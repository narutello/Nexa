const BEARER_KEY = "grok-auth.bearer-token";

/** Persist Better Auth bearer so preview iframe server functions stay signed in. */
export function persistSessionToken(token: unknown): void {
  if (typeof window === "undefined") return;
  if (typeof token !== "string" || !token) return;
  try {
    window.sessionStorage.setItem(BEARER_KEY, token);
  } catch {
    /* ignore */
  }
}
