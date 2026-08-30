import { t as NexaError } from "./errors-qjtEjvj0.mjs";
import { r as assertCanUseChat, u as toActor } from "./authz-BLpDbWRQ.mjs";
import { i as REPORT_REASONS, s as REPORT_TARGETS, t as DETAILS_MAX_LENGTH } from "./middleware-CR0SyJR2.mjs";
import { r as getSql } from "./db-BfNPo7P6.mjs";
import { ensureProfile, i as consumeRateLimit, o as planEvidence, r as LIMITS, s as sanitizeBody, t as toIso } from "./profile.server-tfTO6SXK.mjs";
import { loadMessagesForEvidence } from "./chat.server-CXPe0uy7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports.server-DFSTaxjU.js
async function createReportImpl(userId, data) {
	const sql = await getSql();
	await consumeRateLimit(sql, `report:${userId}`, LIMITS.report.limit, LIMITS.report.windowMs);
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	if (!REPORT_TARGETS.includes(data.targetType)) throw new NexaError("Invalid report type.");
	if (!REPORT_REASONS.includes(data.reason)) throw new NexaError("Select a reason.");
	const details = data.details ? sanitizeBody(data.details, DETAILS_MAX_LENGTH) : null;
	let targetUserId = data.targetUserId ?? null;
	const conversationId = data.conversationId ?? null;
	if (data.targetType === "user") {
		if (!targetUserId) throw new NexaError("Select a user to report.");
		if (targetUserId === userId) throw new NexaError("You cannot report yourself.");
		if (!(await sql.query("select user_id from profiles where user_id = $1", [targetUserId]))[0]) throw new NexaError("User not found.", 404, "NOT_FOUND");
	}
	if (data.targetType === "conversation") {
		if (!conversationId) throw new NexaError("Select a conversation to report.");
		const other = await sql.query(`select user_id from conversation_members
       where conversation_id = $1 and user_id <> $2`, [conversationId, userId]);
		if (!(await sql.query("select user_id from conversation_members where conversation_id = $1 and user_id = $2", [conversationId, userId]))[0]) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
		targetUserId = other[0]?.user_id ?? targetUserId;
	}
	if (data.targetType === "message") {
		if (!conversationId) throw new NexaError("Select the conversation that contains the message.");
		if (!data.messageIds?.length) throw new NexaError("Select at least one message as evidence.");
		if (!(await sql.query("select user_id from conversation_members where conversation_id = $1 and user_id = $2", [conversationId, userId]))[0]) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
		targetUserId = (await sql.query(`select user_id from conversation_members
       where conversation_id = $1 and user_id <> $2`, [conversationId, userId]))[0]?.user_id ?? targetUserId;
	}
	const id = crypto.randomUUID();
	await sql.query(`insert into reports
      (id, reporter_id, target_type, target_user_id, target_conversation_id, reason, details)
     values ($1, $2, $3, $4, $5, $6, $7)`, [
		id,
		userId,
		data.targetType,
		targetUserId,
		conversationId,
		data.reason,
		details
	]);
	const selected = data.messageIds ?? [];
	if (conversationId && selected.length > 0) {
		const thread = await loadMessagesForEvidence(sql, conversationId, userId);
		const planned = planEvidence(selected, thread);
		let order = 0;
		for (const item of planned) {
			const msg = thread.find((m) => m.id === item.id);
			if (!msg) continue;
			await sql.query(`insert into report_evidence
          (id, report_id, message_id, sender_id, body, sent_at, is_reported, sort_order)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`, [
				crypto.randomUUID(),
				id,
				msg.id,
				msg.sender_id,
				msg.body,
				msg.created_at,
				item.isReported,
				order
			]);
			order += 1;
		}
	}
	return { id };
}
async function listMyReportsImpl(userId) {
	const sql = await getSql();
	await ensureProfile(sql, userId);
	return (await sql.query(`select r.id, r.target_type, r.reason, r.status, r.created_at, p.handle
     from reports r
     left join profiles p on p.user_id = r.target_user_id
     where r.reporter_id = $1
     order by r.created_at desc
     limit 50`, [userId])).map((r) => ({
		id: r.id,
		targetType: r.target_type,
		reason: r.reason,
		status: r.status,
		createdAt: toIso(r.created_at),
		targetHandle: r.handle
	}));
}
//#endregion
export { createReportImpl, listMyReportsImpl };
