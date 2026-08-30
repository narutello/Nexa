import { ONLINE_WINDOW_MS } from "./types";

export function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

export function toIsoOrNull(value: unknown): string | null {
  if (value == null || value === "") return null;
  return toIso(value);
}

export function isOnline(lastSeenAt: unknown, now = Date.now()): boolean {
  if (lastSeenAt == null || lastSeenAt === "") return false;
  const t = lastSeenAt instanceof Date ? lastSeenAt.getTime() : new Date(String(lastSeenAt)).getTime();
  if (Number.isNaN(t)) return false;
  return now - t <= ONLINE_WINDOW_MS;
}

export function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}
