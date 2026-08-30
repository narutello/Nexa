import type { Sql } from "@/lib/db";
import { NexaError } from "./errors";

export async function consumeRateLimit(
  sql: Sql,
  key: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const rows = await sql.query<{ count: number; window_start: string | Date }>(
    "select count, window_start from rate_limits where key = $1",
    [key],
  );
  const now = Date.now();
  const row = rows[0];
  if (!row) {
    await sql.query(
      "insert into rate_limits (key, count, window_start) values ($1, 1, now()) on conflict (key) do update set count = rate_limits.count + 1",
      [key],
    );
    return;
  }
  const start = new Date(row.window_start).getTime();
  if (Number.isNaN(start) || now - start >= windowMs) {
    await sql.query("update rate_limits set count = 1, window_start = now() where key = $1", [
      key,
    ]);
    return;
  }
  if (row.count >= limit) {
    throw new NexaError("Too many requests. Please wait a moment.", 429, "RATE_LIMIT");
  }
  await sql.query("update rate_limits set count = count + 1 where key = $1", [key]);
}

export const LIMITS = {
  search: { limit: 30, windowMs: 60_000 },
  send: { limit: 40, windowMs: 60_000 },
  report: { limit: 8, windowMs: 10 * 60_000 },
  sync: { limit: 120, windowMs: 60_000 },
  start: { limit: 20, windowMs: 60_000 },
  profile: { limit: 20, windowMs: 60_000 },
  admin: { limit: 90, windowMs: 60_000 },
  auth: { limit: 12, windowMs: 60_000 },
} as const;
