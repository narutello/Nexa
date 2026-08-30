import { getSql } from "@/lib/db";
import { assertCanUseChat, toActor } from "./authz";
import { loadMessagesForEvidence } from "./chat.server";
import { NexaError } from "./errors";
import { planEvidence, sanitizeBody } from "./evidence";
import { ensureProfile } from "./profile.server";
import { LIMITS, consumeRateLimit } from "./rate-limit.server";
import { toIso } from "./time";
import type { ReportReason, ReportSummary, ReportTargetType } from "./types";
import { DETAILS_MAX_LENGTH, REPORT_REASONS, REPORT_TARGETS } from "./types";

export async function createReportImpl(
  userId: string,
  data: {
    targetType: ReportTargetType;
    reason: ReportReason;
    details?: string;
    targetUserId?: string;
    conversationId?: string;
    messageIds?: string[];
  },
): Promise<{ id: string }> {
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
    const target = await sql.query<{ user_id: string }>(
      "select user_id from profiles where user_id = $1",
      [targetUserId],
    );
    if (!target[0]) throw new NexaError("User not found.", 404, "NOT_FOUND");
  }

  if (data.targetType === "conversation") {
    if (!conversationId) throw new NexaError("Select a conversation to report.");
    const other = await sql.query<{ user_id: string }>(
      `select user_id from conversation_members
       where conversation_id = $1 and user_id <> $2`,
      [conversationId, userId],
    );
    // Membership is enforced when loading evidence / members.
    const member = await sql.query<{ user_id: string }>(
      "select user_id from conversation_members where conversation_id = $1 and user_id = $2",
      [conversationId, userId],
    );
    if (!member[0]) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
    targetUserId = other[0]?.user_id ?? targetUserId;
  }

  if (data.targetType === "message") {
    if (!conversationId) throw new NexaError("Select the conversation that contains the message.");
    if (!data.messageIds?.length) throw new NexaError("Select at least one message as evidence.");
    const member = await sql.query<{ user_id: string }>(
      "select user_id from conversation_members where conversation_id = $1 and user_id = $2",
      [conversationId, userId],
    );
    if (!member[0]) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
    const other = await sql.query<{ user_id: string }>(
      `select user_id from conversation_members
       where conversation_id = $1 and user_id <> $2`,
      [conversationId, userId],
    );
    targetUserId = other[0]?.user_id ?? targetUserId;
  }

  const id = crypto.randomUUID();
  await sql.query(
    `insert into reports
      (id, reporter_id, target_type, target_user_id, target_conversation_id, reason, details)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [id, userId, data.targetType, targetUserId, conversationId, data.reason, details],
  );

  const selected = data.messageIds ?? [];
  if (conversationId && selected.length > 0) {
    const thread = await loadMessagesForEvidence(sql, conversationId, userId);
    const planned = planEvidence(selected, thread);
    let order = 0;
    for (const item of planned) {
      const msg = thread.find((m) => m.id === item.id);
      if (!msg) continue;
      await sql.query(
        `insert into report_evidence
          (id, report_id, message_id, sender_id, body, sent_at, is_reported, sort_order)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          crypto.randomUUID(),
          id,
          msg.id,
          msg.sender_id,
          msg.body,
          msg.created_at,
          item.isReported,
          order,
        ],
      );
      order += 1;
    }
  }

  return { id };
}

export async function listMyReportsImpl(userId: string): Promise<ReportSummary[]> {
  const sql = await getSql();
  await ensureProfile(sql, userId);
  const rows = await sql.query<{
    id: string;
    target_type: ReportTargetType;
    reason: ReportReason;
    status: ReportSummary["status"];
    created_at: string | Date;
    handle: string | null;
  }>(
    `select r.id, r.target_type, r.reason, r.status, r.created_at, p.handle
     from reports r
     left join profiles p on p.user_id = r.target_user_id
     where r.reporter_id = $1
     order by r.created_at desc
     limit 50`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    targetType: r.target_type,
    reason: r.reason,
    status: r.status,
    createdAt: toIso(r.created_at),
    targetHandle: r.handle,
  }));
}
