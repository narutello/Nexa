import { getSql, type Sql } from "@/lib/db";
import { assertCanUseChat, toActor } from "./authz";
import { NexaError } from "./errors";
import { handleFromName, normalizeHandle } from "./evidence";
import { LIMITS, consumeRateLimit } from "./rate-limit.server";
import { hashHue, isOnline, toIsoOrNull } from "./time";
import type { AccountStatus, MyProfile, PublicProfile, Role } from "./types";
import { DISPLAY_NAME_MAX, HANDLE_MAX, HANDLE_MIN, SEARCH_LIMIT, SEARCH_MIN } from "./types";

type ProfileRow = {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_hue: number;
  role: Role;
  status: AccountStatus;
  status_reason: string | null;
  last_seen_at: string | Date | null;
  email?: string | null;
};

export { toActor };

export function toPublic(row: ProfileRow, now = Date.now()): PublicProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    handle: row.handle,
    avatarHue: Number(row.avatar_hue) || 200,
    online: isOnline(row.last_seen_at, now),
    lastSeenAt: toIsoOrNull(row.last_seen_at),
  };
}

export function toMine(row: ProfileRow, email: string | null, now = Date.now()): MyProfile {
  return {
    ...toPublic(row, now),
    role: row.role,
    status: row.status,
    statusReason: row.status_reason,
    email,
  };
}

async function uniqueHandle(sql: Sql, base: string): Promise<string> {
  const root = (normalizeHandle(base) || "user").slice(0, 18);
  for (let i = 0; i < 12; i += 1) {
    const candidate = i === 0 ? root : `${root}${Math.floor(10 + Math.random() * 89)}`;
    const rows = await sql.query<{ n: number }>(
      "select count(*)::int as n from profiles where handle = $1",
      [candidate],
    );
    if ((rows[0]?.n ?? 0) === 0) return candidate;
  }
  return `${root}${crypto.randomUUID().replace(/-/g, "").slice(0, 6)}`;
}

export async function loadProfile(sql: Sql, userId: string): Promise<ProfileRow | null> {
  const rows = await sql.query<ProfileRow>(
    `select p.user_id, p.display_name, p.handle, p.avatar_hue, p.role, p.status,
            p.status_reason, p.last_seen_at, u.email
     from profiles p
     join "user" u on u.id = p.user_id
     where p.user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function requireProfile(sql: Sql, userId: string): Promise<ProfileRow> {
  const row = await ensureProfile(sql, userId);
  return row;
}

export async function ensureProfile(sql: Sql, userId: string): Promise<ProfileRow> {
  const existing = await loadProfile(sql, userId);
  if (existing) return existing;

  const users = await sql.query<{ id: string; name: string; email: string }>(
    `select id, name, email from "user" where id = $1`,
    [userId],
  );
  const user = users[0];
  if (!user) throw new NexaError("Account not found.", 401, "UNAUTHORIZED");

  const handle = await uniqueHandle(sql, handleFromName(user.name, user.email));
  const displayName = (user.name || handle).trim().slice(0, DISPLAY_NAME_MAX) || handle;
  const hue = hashHue(userId);

  await sql.query(
    `insert into profiles (user_id, display_name, handle, avatar_hue, role, last_seen_at)
     values ($1, $2, $3, $4, 'USER', now())
     on conflict (user_id) do nothing`,
    [userId, displayName, handle, hue],
  );

  try {
    await sql.query(
      `update profiles
       set role = 'OWNER'
       where user_id = $1
         and role = 'USER'
         and not exists (select 1 from profiles where role = 'OWNER')`,
      [userId],
    );
  } catch {
    // Unique owner index — another request won the race.
  }

  const created = await loadProfile(sql, userId);
  if (!created) throw new NexaError("Could not create your profile.", 500, "INTERNAL");
  return created;
}

export async function touchPresence(sql: Sql, userId: string): Promise<void> {
  await sql.query("update profiles set last_seen_at = now() where user_id = $1", [userId]);
}

export async function getMyProfileImpl(userId: string): Promise<MyProfile> {
  const sql = await getSql();
  const row = await ensureProfile(sql, userId);
  await touchPresence(sql, userId);
  return toMine(row, row.email ?? null);
}

export async function updateMyProfileImpl(
  userId: string,
  data: { displayName: string; handle: string },
): Promise<MyProfile> {
  const sql = await getSql();
  await consumeRateLimit(sql, `profile:${userId}`, LIMITS.profile.limit, LIMITS.profile.windowMs);
  const row = await ensureProfile(sql, userId);
  assertCanUseChat(toActor(row));

  const displayName = data.displayName.trim().slice(0, DISPLAY_NAME_MAX);
  const handle = normalizeHandle(data.handle);
  if (displayName.length < 1) throw new NexaError("Enter a display name.");
  if (handle.length < HANDLE_MIN || handle.length > HANDLE_MAX) {
    throw new NexaError(`Handle must be ${HANDLE_MIN}–${HANDLE_MAX} letters, numbers, or underscores.`);
  }

  const taken = await sql.query<{ user_id: string }>(
    "select user_id from profiles where handle = $1 and user_id <> $2",
    [handle, userId],
  );
  if (taken[0]) throw new NexaError("That handle is taken.");

  await sql.query(
    `update profiles
     set display_name = $2, handle = $3, updated_at = now()
     where user_id = $1`,
    [userId, displayName, handle],
  );
  const updated = await loadProfile(sql, userId);
  if (!updated) throw new NexaError("Profile not found.", 404, "NOT_FOUND");
  return toMine(updated, updated.email ?? null);
}

export async function searchUsersImpl(userId: string, query: string): Promise<PublicProfile[]> {
  const sql = await getSql();
  await consumeRateLimit(sql, `search:${userId}`, LIMITS.search.limit, LIMITS.search.windowMs);
  const me = await ensureProfile(sql, userId);
  assertCanUseChat(toActor(me));

  const q = query.trim();
  if (q.length < SEARCH_MIN) return [];
  const safe = q.replace(/[%_\\]/g, "");
  if (safe.length < SEARCH_MIN) return [];
  const pattern = `%${safe}%`;

  const rows = await sql.query<ProfileRow>(
    `select user_id, display_name, handle, avatar_hue, role, status, status_reason, last_seen_at
     from profiles
     where user_id <> $1
       and status <> 'banned'
       and (handle ilike $2 or display_name ilike $2)
     order by handle asc
     limit $3`,
    [userId, pattern, SEARCH_LIMIT],
  );
  const now = Date.now();
  return rows.map((r) => toPublic(r, now));
}

export async function presenceForPeers(
  sql: Sql,
  userId: string,
  peerIds: string[],
): Promise<{ userId: string; online: boolean; lastSeenAt: string | null }[]> {
  const ids = [...new Set(peerIds.filter((id) => id && id !== userId))].slice(0, 40);
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
  const rows = await sql.query<{ user_id: string; last_seen_at: string | Date | null }>(
    `select p.user_id, p.last_seen_at
     from profiles p
     where p.user_id in (${placeholders})
       and exists (
         select 1
         from conversation_members me
         join conversation_members them
           on them.conversation_id = me.conversation_id and them.user_id = p.user_id
         where me.user_id = $1
       )`,
    [userId, ...ids],
  );
  const now = Date.now();
  return rows.map((r) => ({
    userId: r.user_id,
    online: isOnline(r.last_seen_at, now),
    lastSeenAt: toIsoOrNull(r.last_seen_at),
  }));
}
