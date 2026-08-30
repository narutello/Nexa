import { getSql } from "@/lib/db";
import {
  assertCanManageAdmins,
  assertCanModerateUser,
  assertCanViewReportEvidence,
  assertOwner,
  assertStaff,
  toActor,
} from "./authz";
import { writeAudit, writeModerationAction } from "./audit.server";
import { NexaError } from "./errors";
import { ensureProfile, loadProfile } from "./profile.server";
import { LIMITS, consumeRateLimit } from "./rate-limit.server";
import { toIso, toIsoOrNull } from "./time";
import type {
  AccountStatus,
  AdminReport,
  AdminUserRow,
  AuditLogRow,
  ModerationActionRow,
  ReportStatus,
  Role,
} from "./types";
import { REPORT_STATUSES } from "./types";

async function requireStaff(userId: string) {
  const sql = await getSql();
  await consumeRateLimit(sql, `admin:${userId}`, LIMITS.admin.limit, LIMITS.admin.windowMs);
  const me = await ensureProfile(sql, userId);
  const actor = toActor(me);
  assertStaff(actor);
  return { sql, me, actor };
}

export async function adminListReportsImpl(
  userId: string,
  status: ReportStatus | "all",
): Promise<AdminReport[]> {
  const { sql, actor } = await requireStaff(userId);
  assertCanViewReportEvidence(actor);
  const params: unknown[] = [];
  let where = "";
  if (status !== "all") {
    params.push(status);
    where = `where r.status = $1`;
  }
  const rows = await sql.query<{
    id: string;
    target_type: AdminReport["targetType"];
    reason: AdminReport["reason"];
    details: string | null;
    status: ReportStatus;
    created_at: string | Date;
    updated_at: string | Date;
    resolution_note: string | null;
    reporter_id: string;
    reporter_handle: string;
    reporter_name: string;
    target_user_id: string | null;
    target_handle: string | null;
    target_name: string | null;
    target_status: AccountStatus | null;
  }>(
    `select r.id, r.target_type, r.reason, r.details, r.status, r.created_at, r.updated_at,
            r.resolution_note, r.reporter_id,
            rp.handle as reporter_handle, rp.display_name as reporter_name,
            r.target_user_id, tp.handle as target_handle, tp.display_name as target_name,
            tp.status as target_status
     from reports r
     join profiles rp on rp.user_id = r.reporter_id
     left join profiles tp on tp.user_id = r.target_user_id
     ${where}
     order by r.created_at desc
     limit 80`,
    params,
  );
  return rows.map((r) => ({
    id: r.id,
    targetType: r.target_type,
    reason: r.reason,
    details: r.details,
    status: r.status,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
    reporter: {
      userId: r.reporter_id,
      handle: r.reporter_handle,
      displayName: r.reporter_name,
    },
    targetUser: r.target_user_id
      ? {
          userId: r.target_user_id,
          handle: r.target_handle ?? "unknown",
          displayName: r.target_name ?? "Unknown",
          status: r.target_status ?? "active",
        }
      : null,
    evidence: [],
    resolutionNote: r.resolution_note,
  }));
}

export async function adminGetReportImpl(userId: string, reportId: string): Promise<AdminReport> {
  const { sql, actor, me } = await requireStaff(userId);
  assertCanViewReportEvidence(actor);

  const rows = await sql.query<{
    id: string;
    target_type: AdminReport["targetType"];
    reason: AdminReport["reason"];
    details: string | null;
    status: ReportStatus;
    created_at: string | Date;
    updated_at: string | Date;
    resolution_note: string | null;
    reporter_id: string;
    reporter_handle: string;
    reporter_name: string;
    target_user_id: string | null;
    target_handle: string | null;
    target_name: string | null;
    target_status: AccountStatus | null;
  }>(
    `select r.id, r.target_type, r.reason, r.details, r.status, r.created_at, r.updated_at,
            r.resolution_note, r.reporter_id,
            rp.handle as reporter_handle, rp.display_name as reporter_name,
            r.target_user_id, tp.handle as target_handle, tp.display_name as target_name,
            tp.status as target_status
     from reports r
     join profiles rp on rp.user_id = r.reporter_id
     left join profiles tp on tp.user_id = r.target_user_id
     where r.id = $1`,
    [reportId],
  );
  const r = rows[0];
  if (!r) throw new NexaError("Report not found.", 404, "NOT_FOUND");

  const evidenceRows = await sql.query<{
    id: string;
    message_id: string | null;
    sender_id: string | null;
    body: string;
    sent_at: string | Date;
    is_reported: boolean;
    handle: string | null;
    display_name: string | null;
  }>(
    `select e.id, e.message_id, e.sender_id, e.body, e.sent_at, e.is_reported,
            p.handle, p.display_name
     from report_evidence e
     left join profiles p on p.user_id = e.sender_id
     where e.report_id = $1
     order by e.sort_order asc`,
    [reportId],
  );

  await writeAudit(sql, {
    actorId: me.user_id,
    action: "report.evidence.view",
    resourceType: "report",
    resourceId: reportId,
    targetUserId: r.target_user_id,
    metadata: { evidenceCount: evidenceRows.length },
  });

  if (r.status === "pending") {
    await sql.query(
      "update reports set status = 'reviewing', updated_at = now() where id = $1 and status = 'pending'",
      [reportId],
    );
  }

  return {
    id: r.id,
    targetType: r.target_type,
    reason: r.reason,
    details: r.details,
    status: r.status === "pending" ? "reviewing" : r.status,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
    reporter: {
      userId: r.reporter_id,
      handle: r.reporter_handle,
      displayName: r.reporter_name,
    },
    targetUser: r.target_user_id
      ? {
          userId: r.target_user_id,
          handle: r.target_handle ?? "unknown",
          displayName: r.target_name ?? "Unknown",
          status: r.target_status ?? "active",
        }
      : null,
    evidence: evidenceRows.map((e) => ({
      id: e.id,
      messageId: e.message_id,
      senderHandle: e.handle,
      senderName: e.display_name,
      body: e.body,
      sentAt: toIso(e.sent_at),
      isReported: Boolean(e.is_reported),
    })),
    resolutionNote: r.resolution_note,
  };
}

export async function adminUpdateReportImpl(
  userId: string,
  data: { reportId: string; status: ReportStatus; note?: string },
): Promise<void> {
  const { sql, actor, me } = await requireStaff(userId);
  if (!REPORT_STATUSES.includes(data.status)) throw new NexaError("Invalid status.");
  const rows = await sql.query<{ id: string; target_user_id: string | null }>(
    "select id, target_user_id from reports where id = $1",
    [data.reportId],
  );
  if (!rows[0]) throw new NexaError("Report not found.", 404, "NOT_FOUND");
  await sql.query(
    `update reports
     set status = $2, resolution_note = $3, resolved_by = $4, resolved_at = now(), updated_at = now()
     where id = $1`,
    [data.reportId, data.status, data.note?.trim() || null, me.user_id],
  );
  await writeAudit(sql, {
    actorId: actor.userId,
    action: `report.${data.status}`,
    resourceType: "report",
    resourceId: data.reportId,
    targetUserId: rows[0].target_user_id,
    metadata: { note: data.note?.trim() || null },
  });
}

export async function adminListUsersImpl(
  userId: string,
  query: string,
): Promise<AdminUserRow[]> {
  const { sql } = await requireStaff(userId);
  const q = query.trim().replace(/[%_\\]/g, "");
  const params: unknown[] = [];
  let where = "";
  if (q.length >= 2) {
    params.push(`%${q}%`);
    where = `where (p.handle ilike $1 or p.display_name ilike $1)`;
  }
  const rows = await sql.query<{
    user_id: string;
    display_name: string;
    handle: string;
    role: Role;
    status: AccountStatus;
    created_at: string | Date;
    last_seen_at: string | Date | null;
    report_count: number;
  }>(
    `select p.user_id, p.display_name, p.handle, p.role, p.status, p.created_at, p.last_seen_at,
            coalesce(rc.n, 0)::int as report_count
     from profiles p
     left join (
       select target_user_id, count(*)::int as n from reports group by target_user_id
     ) rc on rc.target_user_id = p.user_id
     ${where}
     order by p.created_at desc
     limit 60`,
    params,
  );
  return rows.map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    handle: r.handle,
    role: r.role,
    status: r.status,
    createdAt: toIso(r.created_at),
    lastSeenAt: toIsoOrNull(r.last_seen_at),
    reportCount: r.report_count,
  }));
}

export async function adminGetUserImpl(userId: string, targetId: string) {
  const { sql } = await requireStaff(userId);
  const row = await loadProfile(sql, targetId);
  if (!row) throw new NexaError("User not found.", 404, "NOT_FOUND");
  const reports = await sql.query<{ n: number }>(
    "select count(*)::int as n from reports where target_user_id = $1",
    [targetId],
  );
  const actions = await sql.query<{
    id: string;
    actor_id: string;
    target_user_id: string;
    action: string;
    reason: string | null;
    created_at: string | Date;
    actor_handle: string | null;
  }>(
    `select a.id, a.actor_id, a.target_user_id, a.action, a.reason, a.created_at, p.handle as actor_handle
     from moderation_actions a
     left join profiles p on p.user_id = a.actor_id
     where a.target_user_id = $1
     order by a.created_at desc
     limit 40`,
    [targetId],
  );
  return {
    user: {
      userId: row.user_id,
      displayName: row.display_name,
      handle: row.handle,
      role: row.role,
      status: row.status,
      statusReason: row.status_reason,
      createdAt: toIso(new Date()),
      lastSeenAt: toIsoOrNull(row.last_seen_at),
      reportCount: reports[0]?.n ?? 0,
    } satisfies AdminUserRow & { statusReason: string | null },
    actions: actions.map(
      (a): ModerationActionRow => ({
        id: a.id,
        actorId: a.actor_id,
        actorHandle: a.actor_handle,
        targetUserId: a.target_user_id,
        targetHandle: row.handle,
        action: a.action,
        reason: a.reason,
        createdAt: toIso(a.created_at),
      }),
    ),
  };
}

export async function adminModerateUserImpl(
  userId: string,
  data: {
    targetUserId: string;
    action: "warn" | "suspend" | "ban" | "reactivate";
    reason?: string;
  },
): Promise<void> {
  const { sql, actor } = await requireStaff(userId);
  const target = await loadProfile(sql, data.targetUserId);
  if (!target) throw new NexaError("User not found.", 404, "NOT_FOUND");
  assertCanModerateUser(actor, toActor(target));

  const statusMap = {
    warn: "warned",
    suspend: "suspended",
    ban: "banned",
    reactivate: "active",
  } as const;
  const next = statusMap[data.action];
  const reason = data.reason?.trim() || null;
  await sql.query(
    `update profiles
     set status = $2, status_reason = $3, status_until = null, updated_at = now()
     where user_id = $1`,
    [data.targetUserId, next, reason],
  );
  await writeModerationAction(sql, {
    actorId: actor.userId,
    targetUserId: data.targetUserId,
    action: `user.${data.action}`,
    reason,
  });
}

export async function adminListActionsImpl(userId: string): Promise<ModerationActionRow[]> {
  const { sql } = await requireStaff(userId);
  const rows = await sql.query<{
    id: string;
    actor_id: string;
    target_user_id: string;
    action: string;
    reason: string | null;
    created_at: string | Date;
    actor_handle: string | null;
    target_handle: string | null;
  }>(
    `select a.id, a.actor_id, a.target_user_id, a.action, a.reason, a.created_at,
            ap.handle as actor_handle, tp.handle as target_handle
     from moderation_actions a
     left join profiles ap on ap.user_id = a.actor_id
     left join profiles tp on tp.user_id = a.target_user_id
     order by a.created_at desc
     limit 80`,
    [],
  );
  return rows.map((a) => ({
    id: a.id,
    actorId: a.actor_id,
    actorHandle: a.actor_handle,
    targetUserId: a.target_user_id,
    targetHandle: a.target_handle,
    action: a.action,
    reason: a.reason,
    createdAt: toIso(a.created_at),
  }));
}

export async function adminListAuditImpl(userId: string): Promise<AuditLogRow[]> {
  const { sql, actor } = await requireStaff(userId);
  assertOwner(actor);
  const rows = await sql.query<{
    id: string;
    actor_id: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    target_user_id: string | null;
    metadata: string | null;
    created_at: string | Date;
    actor_handle: string | null;
    target_handle: string | null;
  }>(
    `select l.id, l.actor_id, l.action, l.resource_type, l.resource_id, l.target_user_id,
            l.metadata, l.created_at, ap.handle as actor_handle, tp.handle as target_handle
     from audit_logs l
     left join profiles ap on ap.user_id = l.actor_id
     left join profiles tp on tp.user_id = l.target_user_id
     order by l.created_at desc
     limit 120`,
    [],
  );
  return rows.map((l) => ({
    id: l.id,
    actorId: l.actor_id,
    actorHandle: l.actor_handle,
    action: l.action,
    resourceType: l.resource_type,
    resourceId: l.resource_id,
    targetUserId: l.target_user_id,
    targetHandle: l.target_handle,
    metadata: l.metadata,
    createdAt: toIso(l.created_at),
  }));
}

export async function ownerListAdminsImpl(userId: string): Promise<AdminUserRow[]> {
  const { sql, actor } = await requireStaff(userId);
  assertCanManageAdmins(actor);
  const rows = await sql.query<{
    user_id: string;
    display_name: string;
    handle: string;
    role: Role;
    status: AccountStatus;
    created_at: string | Date;
    last_seen_at: string | Date | null;
  }>(
    `select user_id, display_name, handle, role, status, created_at, last_seen_at
     from profiles
     where role in ('ADMIN', 'OWNER')
     order by role desc, handle asc`,
    [],
  );
  return rows.map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    handle: r.handle,
    role: r.role,
    status: r.status,
    createdAt: toIso(r.created_at),
    lastSeenAt: toIsoOrNull(r.last_seen_at),
    reportCount: 0,
  }));
}

export async function ownerSetAdminImpl(
  userId: string,
  data: { targetUserId: string; makeAdmin: boolean },
): Promise<void> {
  const { sql, actor } = await requireStaff(userId);
  assertCanManageAdmins(actor);
  const target = await loadProfile(sql, data.targetUserId);
  if (!target) throw new NexaError("User not found.", 404, "NOT_FOUND");
  if (target.role === "OWNER") {
    throw new NexaError("The owner cannot be demoted.");
  }
  if (target.user_id === actor.userId) {
    throw new NexaError("You cannot change your own role.");
  }
  const next: Role = data.makeAdmin ? "ADMIN" : "USER";
  await sql.query("update profiles set role = $2, updated_at = now() where user_id = $1", [
    data.targetUserId,
    next,
  ]);
  await writeModerationAction(sql, {
    actorId: actor.userId,
    targetUserId: data.targetUserId,
    action: data.makeAdmin ? "admin.create" : "admin.remove",
  });
}

export async function ownerSuspendAdminImpl(
  userId: string,
  data: { targetUserId: string; suspend: boolean; reason?: string },
): Promise<void> {
  const { sql, actor } = await requireStaff(userId);
  assertCanManageAdmins(actor);
  const target = await loadProfile(sql, data.targetUserId);
  if (!target) throw new NexaError("User not found.", 404, "NOT_FOUND");
  if (target.role !== "ADMIN") throw new NexaError("That user is not an admin.");
  const next = data.suspend ? "suspended" : "active";
  await sql.query(
    `update profiles set status = $2, status_reason = $3, updated_at = now() where user_id = $1`,
    [data.targetUserId, next, data.reason?.trim() || null],
  );
  await writeModerationAction(sql, {
    actorId: actor.userId,
    targetUserId: data.targetUserId,
    action: data.suspend ? "admin.suspend" : "admin.reactivate",
    reason: data.reason?.trim() || null,
  });
}
