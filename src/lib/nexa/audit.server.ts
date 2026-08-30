import type { Sql } from "@/lib/db";

export async function writeAudit(
  sql: Sql,
  entry: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    targetUserId?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  await sql.query(
    `insert into audit_logs
      (id, actor_id, action, resource_type, resource_id, target_user_id, metadata)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      crypto.randomUUID(),
      entry.actorId,
      entry.action,
      entry.resourceType,
      entry.resourceId ?? null,
      entry.targetUserId ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ],
  );
}

export async function writeModerationAction(
  sql: Sql,
  entry: {
    actorId: string;
    targetUserId: string;
    action: string;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  await sql.query(
    `insert into moderation_actions (id, actor_id, target_user_id, action, reason, metadata)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      entry.actorId,
      entry.targetUserId,
      entry.action,
      entry.reason ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ],
  );
  await writeAudit(sql, {
    actorId: entry.actorId,
    action: entry.action,
    resourceType: "user",
    resourceId: entry.targetUserId,
    targetUserId: entry.targetUserId,
    metadata: {
      reason: entry.reason ?? null,
      ...(entry.metadata ?? {}),
    },
  });
}
