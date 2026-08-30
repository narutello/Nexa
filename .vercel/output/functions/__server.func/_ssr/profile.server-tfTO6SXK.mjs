import { t as NexaError } from "./errors-qjtEjvj0.mjs";
import { r as assertCanUseChat, u as toActor } from "./authz-BLpDbWRQ.mjs";
import { r as ONLINE_WINDOW_MS } from "./middleware-CR0SyJR2.mjs";
import { r as getSql } from "./db-BfNPo7P6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile.server-tfTO6SXK.js
/**
* Build the minimum evidence set for a message report.
* Selected messages are marked reported. If exactly one is selected, include
* a tiny amount of surrounding context (one message each side) so moderators
* can understand the report without opening the private thread.
*/
function planEvidence(selectedIds, threadChronological, opts = {}) {
	const maxTotal = opts.maxTotal ?? 5;
	const contextEachSide = opts.contextEachSide ?? 1;
	const uniqueSelected = [...new Set(selectedIds.filter(Boolean))];
	if (uniqueSelected.length === 0) return [];
	const indexById = new Map(threadChronological.map((m, i) => [m.id, i]));
	const reported = uniqueSelected.filter((id) => indexById.has(id));
	if (reported.length === 0) return [];
	const include = /* @__PURE__ */ new Map();
	for (const id of reported.slice(0, maxTotal)) include.set(id, true);
	if (reported.length === 1 && include.size < maxTotal) {
		const idx = indexById.get(reported[0]) ?? -1;
		if (idx >= 0) for (let d = 1; d <= contextEachSide; d += 1) {
			const before = threadChronological[idx - d];
			const after = threadChronological[idx + d];
			if (before && include.size < maxTotal && !include.has(before.id)) include.set(before.id, false);
			if (after && include.size < maxTotal && !include.has(after.id)) include.set(after.id, false);
		}
	}
	return threadChronological.filter((m) => include.has(m.id)).slice(0, maxTotal).map((m) => ({
		id: m.id,
		isReported: include.get(m.id) === true
	}));
}
function normalizeHandle(raw) {
	return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
}
function handleFromName(name, fallback) {
	return (normalizeHandle(name) || normalizeHandle(fallback.split("@")[0] ?? "") || "user").slice(0, 18);
}
function sanitizeBody(raw, max) {
	const cleaned = raw.replace(/\u0000/g, "").replace(/\r\n/g, "\n").trim();
	if (!cleaned) return "";
	return cleaned.slice(0, max);
}
function isUuid(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
async function consumeRateLimit(sql, key, limit, windowMs) {
	const rows = await sql.query("select count, window_start from rate_limits where key = $1", [key]);
	const now = Date.now();
	const row = rows[0];
	if (!row) {
		await sql.query("insert into rate_limits (key, count, window_start) values ($1, 1, now()) on conflict (key) do update set count = rate_limits.count + 1", [key]);
		return;
	}
	const start = new Date(row.window_start).getTime();
	if (Number.isNaN(start) || now - start >= windowMs) {
		await sql.query("update rate_limits set count = 1, window_start = now() where key = $1", [key]);
		return;
	}
	if (row.count >= limit) throw new NexaError("Too many requests. Please wait a moment.", 429, "RATE_LIMIT");
	await sql.query("update rate_limits set count = count + 1 where key = $1", [key]);
}
var LIMITS = {
	search: {
		limit: 30,
		windowMs: 6e4
	},
	send: {
		limit: 40,
		windowMs: 6e4
	},
	report: {
		limit: 8,
		windowMs: 6e5
	},
	sync: {
		limit: 120,
		windowMs: 6e4
	},
	start: {
		limit: 20,
		windowMs: 6e4
	},
	profile: {
		limit: 20,
		windowMs: 6e4
	},
	admin: {
		limit: 90,
		windowMs: 6e4
	},
	auth: {
		limit: 12,
		windowMs: 6e4
	}
};
function toIso(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") {
		const d = new Date(value);
		if (!Number.isNaN(d.getTime())) return d.toISOString();
	}
	return (/* @__PURE__ */ new Date()).toISOString();
}
function toIsoOrNull(value) {
	if (value == null || value === "") return null;
	return toIso(value);
}
function isOnline(lastSeenAt, now = Date.now()) {
	if (lastSeenAt == null || lastSeenAt === "") return false;
	const t = lastSeenAt instanceof Date ? lastSeenAt.getTime() : new Date(String(lastSeenAt)).getTime();
	if (Number.isNaN(t)) return false;
	return now - t <= ONLINE_WINDOW_MS;
}
function hashHue(seed) {
	let h = 0;
	for (let i = 0; i < seed.length; i += 1) h = h * 31 + seed.charCodeAt(i) >>> 0;
	return h % 360;
}
function toPublic(row, now = Date.now()) {
	return {
		userId: row.user_id,
		displayName: row.display_name,
		handle: row.handle,
		avatarHue: Number(row.avatar_hue) || 200,
		online: isOnline(row.last_seen_at, now),
		lastSeenAt: toIsoOrNull(row.last_seen_at)
	};
}
function toMine(row, email, now = Date.now()) {
	return {
		...toPublic(row, now),
		role: row.role,
		status: row.status,
		statusReason: row.status_reason,
		email
	};
}
async function uniqueHandle(sql, base) {
	const root = (normalizeHandle(base) || "user").slice(0, 18);
	for (let i = 0; i < 12; i += 1) {
		const candidate = i === 0 ? root : `${root}${Math.floor(10 + Math.random() * 89)}`;
		if (((await sql.query("select count(*)::int as n from profiles where handle = $1", [candidate]))[0]?.n ?? 0) === 0) return candidate;
	}
	return `${root}${crypto.randomUUID().replace(/-/g, "").slice(0, 6)}`;
}
async function loadProfile(sql, userId) {
	return (await sql.query(`select p.user_id, p.display_name, p.handle, p.avatar_hue, p.role, p.status,
            p.status_reason, p.last_seen_at, u.email
     from profiles p
     join "user" u on u.id = p.user_id
     where p.user_id = $1`, [userId]))[0] ?? null;
}
async function ensureProfile(sql, userId) {
	const existing = await loadProfile(sql, userId);
	if (existing) return existing;
	const user = (await sql.query(`select id, name, email from "user" where id = $1`, [userId]))[0];
	if (!user) throw new NexaError("Account not found.", 401, "UNAUTHORIZED");
	const handle = await uniqueHandle(sql, handleFromName(user.name, user.email));
	const displayName = (user.name || handle).trim().slice(0, 40) || handle;
	const hue = hashHue(userId);
	await sql.query(`insert into profiles (user_id, display_name, handle, avatar_hue, role, last_seen_at)
     values ($1, $2, $3, $4, 'USER', now())
     on conflict (user_id) do nothing`, [
		userId,
		displayName,
		handle,
		hue
	]);
	try {
		await sql.query(`update profiles
       set role = 'OWNER'
       where user_id = $1
         and role = 'USER'
         and not exists (select 1 from profiles where role = 'OWNER')`, [userId]);
	} catch {}
	const created = await loadProfile(sql, userId);
	if (!created) throw new NexaError("Could not create your profile.", 500, "INTERNAL");
	return created;
}
async function touchPresence(sql, userId) {
	await sql.query("update profiles set last_seen_at = now() where user_id = $1", [userId]);
}
async function getMyProfileImpl(userId) {
	const sql = await getSql();
	const row = await ensureProfile(sql, userId);
	await touchPresence(sql, userId);
	return toMine(row, row.email ?? null);
}
async function updateMyProfileImpl(userId, data) {
	const sql = await getSql();
	await consumeRateLimit(sql, `profile:${userId}`, LIMITS.profile.limit, LIMITS.profile.windowMs);
	const row = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(row));
	const displayName = data.displayName.trim().slice(0, 40);
	const handle = normalizeHandle(data.handle);
	if (displayName.length < 1) throw new NexaError("Enter a display name.");
	if (handle.length < 3 || handle.length > 24) throw new NexaError(`Handle must be 3–24 letters, numbers, or underscores.`);
	if ((await sql.query("select user_id from profiles where handle = $1 and user_id <> $2", [handle, userId]))[0]) throw new NexaError("That handle is taken.");
	await sql.query(`update profiles
     set display_name = $2, handle = $3, updated_at = now()
     where user_id = $1`, [
		userId,
		displayName,
		handle
	]);
	const updated = await loadProfile(sql, userId);
	if (!updated) throw new NexaError("Profile not found.", 404, "NOT_FOUND");
	return toMine(updated, updated.email ?? null);
}
async function searchUsersImpl(userId, query) {
	const sql = await getSql();
	await consumeRateLimit(sql, `search:${userId}`, LIMITS.search.limit, LIMITS.search.windowMs);
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	const q = query.trim();
	if (q.length < 2) return [];
	const safe = q.replace(/[%_\\]/g, "");
	if (safe.length < 2) return [];
	const pattern = `%${safe}%`;
	const rows = await sql.query(`select user_id, display_name, handle, avatar_hue, role, status, status_reason, last_seen_at
     from profiles
     where user_id <> $1
       and status <> 'banned'
       and (handle ilike $2 or display_name ilike $2)
     order by handle asc
     limit $3`, [
		userId,
		pattern,
		20
	]);
	const now = Date.now();
	return rows.map((r) => toPublic(r, now));
}
async function presenceForPeers(sql, userId, peerIds) {
	const ids = [...new Set(peerIds.filter((id) => id && id !== userId))].slice(0, 40);
	if (ids.length === 0) return [];
	const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
	const rows = await sql.query(`select p.user_id, p.last_seen_at
     from profiles p
     where p.user_id in (${placeholders})
       and exists (
         select 1
         from conversation_members me
         join conversation_members them
           on them.conversation_id = me.conversation_id and them.user_id = p.user_id
         where me.user_id = $1
       )`, [userId, ...ids]);
	const now = Date.now();
	return rows.map((r) => ({
		userId: r.user_id,
		online: isOnline(r.last_seen_at, now),
		lastSeenAt: toIsoOrNull(r.last_seen_at)
	}));
}
//#endregion
export { isUuid as a, ensureProfile, getMyProfileImpl, consumeRateLimit as i, loadProfile, toIsoOrNull as n, planEvidence as o, presenceForPeers, LIMITS as r, sanitizeBody as s, searchUsersImpl, toIso as t, toPublic, touchPresence, updateMyProfileImpl };
