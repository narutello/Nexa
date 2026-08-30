import { t as NexaError } from "./errors-qjtEjvj0.mjs";
import { c as assertStaff, i as assertCanViewReportEvidence, n as assertCanModerateUser, s as assertOwner, t as assertCanManageAdmins, u as toActor } from "./authz-BLpDbWRQ.mjs";
import { o as REPORT_STATUSES } from "./middleware-CR0SyJR2.mjs";
import { r as getSql } from "./db-BfNPo7P6.mjs";
import { ensureProfile, i as consumeRateLimit, loadProfile, n as toIsoOrNull, r as LIMITS, t as toIso } from "./profile.server-tfTO6SXK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.server-BnGtqzDb.js
async function writeAudit(sql, entry) {
	await sql.query(`insert into audit_logs
      (id, actor_id, action, resource_type, resource_id, target_user_id, metadata)
     values ($1, $2, $3, $4, $5, $6, $7)`, [
		crypto.randomUUID(),
		entry.actorId,
		entry.action,
		entry.resourceType,
		entry.resourceId ?? null,
		entry.targetUserId ?? null,
		entry.metadata ? JSON.stringify(entry.metadata) : null
	]);
}
async function writeModerationAction(sql, entry) {
	await sql.query(`insert into moderation_actions (id, actor_id, target_user_id, action, reason, metadata)
     values ($1, $2, $3, $4, $5, $6)`, [
		crypto.randomUUID(),
		entry.actorId,
		entry.targetUserId,
		entry.action,
		entry.reason ?? null,
		entry.metadata ? JSON.stringify(entry.metadata) : null
	]);
	await writeAudit(sql, {
		actorId: entry.actorId,
		action: entry.action,
		resourceType: "user",
		resourceId: entry.targetUserId,
		targetUserId: entry.targetUserId,
		metadata: {
			reason: entry.reason ?? null,
			...entry.metadata ?? {}
		}
	});
}
async function requireStaff(userId) {
	const sql = await getSql();
	await consumeRateLimit(sql, `admin:${userId}`, LIMITS.admin.limit, LIMITS.admin.windowMs);
	const me = await ensureProfile(sql, userId);
	const actor = toActor(me);
	assertStaff(actor);
	return {
		sql,
		me,
		actor
	};
}
async function adminListReportsImpl(userId, status) {
	const { sql, actor } = await requireStaff(userId);
	assertCanViewReportEvidence(actor);
	const params = [];
	let where = "";
	if (status !== "all") {
		params.push(status);
		where = `where r.status = $1`;
	}
	return (await sql.query(`select r.id, r.target_type, r.reason, r.details, r.status, r.created_at, r.updated_at,
            r.resolution_note, r.reporter_id,
            rp.handle as reporter_handle, rp.display_name as reporter_name,
            r.target_user_id, tp.handle as target_handle, tp.display_name as target_name,
            tp.status as target_status
     from reports r
     join profiles rp on rp.user_id = r.reporter_id
     left join profiles tp on tp.user_id = r.target_user_id
     ${where}
     order by r.created_at desc
     limit 80`, params)).map((r) => ({
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
			displayName: r.reporter_name
		},
		targetUser: r.target_user_id ? {
			userId: r.target_user_id,
			handle: r.target_handle ?? "unknown",
			displayName: r.target_name ?? "Unknown",
			status: r.target_status ?? "active"
		} : null,
		evidence: [],
		resolutionNote: r.resolution_note
	}));
}
async function adminGetReportImpl(userId, reportId) {
	const { sql, actor, me } = await requireStaff(userId);
	assertCanViewReportEvidence(actor);
	const r = (await sql.query(`select r.id, r.target_type, r.reason, r.details, r.status, r.created_at, r.updated_at,
            r.resolution_note, r.reporter_id,
            rp.handle as reporter_handle, rp.display_name as reporter_name,
            r.target_user_id, tp.handle as target_handle, tp.display_name as target_name,
            tp.status as target_status
     from reports r
     join profiles rp on rp.user_id = r.reporter_id
     left join profiles tp on tp.user_id = r.target_user_id
     where r.id = $1`, [reportId]))[0];
	if (!r) throw new NexaError("Report not found.", 404, "NOT_FOUND");
	const evidenceRows = await sql.query(`select e.id, e.message_id, e.sender_id, e.body, e.sent_at, e.is_reported,
            p.handle, p.display_name
     from report_evidence e
     left join profiles p on p.user_id = e.sender_id
     where e.report_id = $1
     order by e.sort_order asc`, [reportId]);
	await writeAudit(sql, {
		actorId: me.user_id,
		action: "report.evidence.view",
		resourceType: "report",
		resourceId: reportId,
		targetUserId: r.target_user_id,
		metadata: { evidenceCount: evidenceRows.length }
	});
	if (r.status === "pending") await sql.query("update reports set status = 'reviewing', updated_at = now() where id = $1 and status = 'pending'", [reportId]);
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
			displayName: r.reporter_name
		},
		targetUser: r.target_user_id ? {
			userId: r.target_user_id,
			handle: r.target_handle ?? "unknown",
			displayName: r.target_name ?? "Unknown",
			status: r.target_status ?? "active"
		} : null,
		evidence: evidenceRows.map((e) => ({
			id: e.id,
			messageId: e.message_id,
			senderHandle: e.handle,
			senderName: e.display_name,
			body: e.body,
			sentAt: toIso(e.sent_at),
			isReported: Boolean(e.is_reported)
		})),
		resolutionNote: r.resolution_note
	};
}
async function adminUpdateReportImpl(userId, data) {
	const { sql, actor, me } = await requireStaff(userId);
	if (!REPORT_STATUSES.includes(data.status)) throw new NexaError("Invalid status.");
	const rows = await sql.query("select id, target_user_id from reports where id = $1", [data.reportId]);
	if (!rows[0]) throw new NexaError("Report not found.", 404, "NOT_FOUND");
	await sql.query(`update reports
     set status = $2, resolution_note = $3, resolved_by = $4, resolved_at = now(), updated_at = now()
     where id = $1`, [
		data.reportId,
		data.status,
		data.note?.trim() || null,
		me.user_id
	]);
	await writeAudit(sql, {
		actorId: actor.userId,
		action: `report.${data.status}`,
		resourceType: "report",
		resourceId: data.reportId,
		targetUserId: rows[0].target_user_id,
		metadata: { note: data.note?.trim() || null }
	});
}
async function adminListUsersImpl(userId, query) {
	const { sql } = await requireStaff(userId);
	const q = query.trim().replace(/[%_\\]/g, "");
	const params = [];
	let where = "";
	if (q.length >= 2) {
		params.push(`%${q}%`);
		where = `where (p.handle ilike $1 or p.display_name ilike $1)`;
	}
	return (await sql.query(`select p.user_id, p.display_name, p.handle, p.role, p.status, p.created_at, p.last_seen_at,
            coalesce(rc.n, 0)::int as report_count
     from profiles p
     left join (
       select target_user_id, count(*)::int as n from reports group by target_user_id
     ) rc on rc.target_user_id = p.user_id
     ${where}
     order by p.created_at desc
     limit 60`, params)).map((r) => ({
		userId: r.user_id,
		displayName: r.display_name,
		handle: r.handle,
		role: r.role,
		status: r.status,
		createdAt: toIso(r.created_at),
		lastSeenAt: toIsoOrNull(r.last_seen_at),
		reportCount: r.report_count
	}));
}
async function adminGetUserImpl(userId, targetId) {
	const { sql } = await requireStaff(userId);
	const row = await loadProfile(sql, targetId);
	if (!row) throw new NexaError("User not found.", 404, "NOT_FOUND");
	const reports = await sql.query("select count(*)::int as n from reports where target_user_id = $1", [targetId]);
	const actions = await sql.query(`select a.id, a.actor_id, a.target_user_id, a.action, a.reason, a.created_at, p.handle as actor_handle
     from moderation_actions a
     left join profiles p on p.user_id = a.actor_id
     where a.target_user_id = $1
     order by a.created_at desc
     limit 40`, [targetId]);
	return {
		user: {
			userId: row.user_id,
			displayName: row.display_name,
			handle: row.handle,
			role: row.role,
			status: row.status,
			statusReason: row.status_reason,
			createdAt: toIso(/* @__PURE__ */ new Date()),
			lastSeenAt: toIsoOrNull(row.last_seen_at),
			reportCount: reports[0]?.n ?? 0
		},
		actions: actions.map((a) => ({
			id: a.id,
			actorId: a.actor_id,
			actorHandle: a.actor_handle,
			targetUserId: a.target_user_id,
			targetHandle: row.handle,
			action: a.action,
			reason: a.reason,
			createdAt: toIso(a.created_at)
		}))
	};
}
async function adminModerateUserImpl(userId, data) {
	const { sql, actor } = await requireStaff(userId);
	const target = await loadProfile(sql, data.targetUserId);
	if (!target) throw new NexaError("User not found.", 404, "NOT_FOUND");
	assertCanModerateUser(actor, toActor(target));
	const next = {
		warn: "warned",
		suspend: "suspended",
		ban: "banned",
		reactivate: "active"
	}[data.action];
	const reason = data.reason?.trim() || null;
	await sql.query(`update profiles
     set status = $2, status_reason = $3, status_until = null, updated_at = now()
     where user_id = $1`, [
		data.targetUserId,
		next,
		reason
	]);
	await writeModerationAction(sql, {
		actorId: actor.userId,
		targetUserId: data.targetUserId,
		action: `user.${data.action}`,
		reason
	});
}
async function adminListActionsImpl(userId) {
	const { sql } = await requireStaff(userId);
	return (await sql.query(`select a.id, a.actor_id, a.target_user_id, a.action, a.reason, a.created_at,
            ap.handle as actor_handle, tp.handle as target_handle
     from moderation_actions a
     left join profiles ap on ap.user_id = a.actor_id
     left join profiles tp on tp.user_id = a.target_user_id
     order by a.created_at desc
     limit 80`, [])).map((a) => ({
		id: a.id,
		actorId: a.actor_id,
		actorHandle: a.actor_handle,
		targetUserId: a.target_user_id,
		targetHandle: a.target_handle,
		action: a.action,
		reason: a.reason,
		createdAt: toIso(a.created_at)
	}));
}
async function adminListAuditImpl(userId) {
	const { sql, actor } = await requireStaff(userId);
	assertOwner(actor);
	return (await sql.query(`select l.id, l.actor_id, l.action, l.resource_type, l.resource_id, l.target_user_id,
            l.metadata, l.created_at, ap.handle as actor_handle, tp.handle as target_handle
     from audit_logs l
     left join profiles ap on ap.user_id = l.actor_id
     left join profiles tp on tp.user_id = l.target_user_id
     order by l.created_at desc
     limit 120`, [])).map((l) => ({
		id: l.id,
		actorId: l.actor_id,
		actorHandle: l.actor_handle,
		action: l.action,
		resourceType: l.resource_type,
		resourceId: l.resource_id,
		targetUserId: l.target_user_id,
		targetHandle: l.target_handle,
		metadata: l.metadata,
		createdAt: toIso(l.created_at)
	}));
}
async function ownerListAdminsImpl(userId) {
	const { sql, actor } = await requireStaff(userId);
	assertCanManageAdmins(actor);
	return (await sql.query(`select user_id, display_name, handle, role, status, created_at, last_seen_at
     from profiles
     where role in ('ADMIN', 'OWNER')
     order by role desc, handle asc`, [])).map((r) => ({
		userId: r.user_id,
		displayName: r.display_name,
		handle: r.handle,
		role: r.role,
		status: r.status,
		createdAt: toIso(r.created_at),
		lastSeenAt: toIsoOrNull(r.last_seen_at),
		reportCount: 0
	}));
}
async function ownerSetAdminImpl(userId, data) {
	const { sql, actor } = await requireStaff(userId);
	assertCanManageAdmins(actor);
	const target = await loadProfile(sql, data.targetUserId);
	if (!target) throw new NexaError("User not found.", 404, "NOT_FOUND");
	if (target.role === "OWNER") throw new NexaError("The owner cannot be demoted.");
	if (target.user_id === actor.userId) throw new NexaError("You cannot change your own role.");
	const next = data.makeAdmin ? "ADMIN" : "USER";
	await sql.query("update profiles set role = $2, updated_at = now() where user_id = $1", [data.targetUserId, next]);
	await writeModerationAction(sql, {
		actorId: actor.userId,
		targetUserId: data.targetUserId,
		action: data.makeAdmin ? "admin.create" : "admin.remove"
	});
}
async function ownerSuspendAdminImpl(userId, data) {
	const { sql, actor } = await requireStaff(userId);
	assertCanManageAdmins(actor);
	const target = await loadProfile(sql, data.targetUserId);
	if (!target) throw new NexaError("User not found.", 404, "NOT_FOUND");
	if (target.role !== "ADMIN") throw new NexaError("That user is not an admin.");
	const next = data.suspend ? "suspended" : "active";
	await sql.query(`update profiles set status = $2, status_reason = $3, updated_at = now() where user_id = $1`, [
		data.targetUserId,
		next,
		data.reason?.trim() || null
	]);
	await writeModerationAction(sql, {
		actorId: actor.userId,
		targetUserId: data.targetUserId,
		action: data.suspend ? "admin.suspend" : "admin.reactivate",
		reason: data.reason?.trim() || null
	});
}
//#endregion
export { adminGetReportImpl, adminGetUserImpl, adminListActionsImpl, adminListAuditImpl, adminListReportsImpl, adminListUsersImpl, adminModerateUserImpl, adminUpdateReportImpl, ownerListAdminsImpl, ownerSetAdminImpl, ownerSuspendAdminImpl };
