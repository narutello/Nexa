import { EVIDENCE_CONTEXT, EVIDENCE_MAX } from "./types.ts";

export type ThreadMessage = { id: string };

export type PlannedEvidence = {
  id: string;
  isReported: boolean;
};

/**
 * Build the minimum evidence set for a message report.
 * Selected messages are marked reported. If exactly one is selected, include
 * a tiny amount of surrounding context (one message each side) so moderators
 * can understand the report without opening the private thread.
 */
export function planEvidence(
  selectedIds: string[],
  threadChronological: ThreadMessage[],
  opts: { maxTotal?: number; contextEachSide?: number } = {},
): PlannedEvidence[] {
  const maxTotal = opts.maxTotal ?? EVIDENCE_MAX;
  const contextEachSide = opts.contextEachSide ?? EVIDENCE_CONTEXT;
  const uniqueSelected = [...new Set(selectedIds.filter(Boolean))];
  if (uniqueSelected.length === 0) return [];

  const indexById = new Map(threadChronological.map((m, i) => [m.id, i]));
  const reported = uniqueSelected.filter((id) => indexById.has(id));
  if (reported.length === 0) return [];

  const include = new Map<string, boolean>();
  for (const id of reported.slice(0, maxTotal)) include.set(id, true);

  if (reported.length === 1 && include.size < maxTotal) {
    const idx = indexById.get(reported[0]) ?? -1;
    if (idx >= 0) {
      for (let d = 1; d <= contextEachSide; d += 1) {
        const before = threadChronological[idx - d];
        const after = threadChronological[idx + d];
        if (before && include.size < maxTotal && !include.has(before.id)) {
          include.set(before.id, false);
        }
        if (after && include.size < maxTotal && !include.has(after.id)) {
          include.set(after.id, false);
        }
      }
    }
  }

  const ordered = threadChronological.filter((m) => include.has(m.id));
  return ordered.slice(0, maxTotal).map((m) => ({
    id: m.id,
    isReported: include.get(m.id) === true,
  }));
}

export function escapeIlike(raw: string): string {
  return raw.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

export function handleFromName(name: string, fallback: string): string {
  const base = normalizeHandle(name) || normalizeHandle(fallback.split("@")[0] ?? "") || "user";
  return base.slice(0, 18);
}

export function sanitizeBody(raw: string, max: number): string {
  const cleaned = raw.split("\0").join("").replace(/\r\n/g, "\n").trim();
  if (!cleaned) return "";
  return cleaned.slice(0, max);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
