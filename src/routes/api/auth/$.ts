import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

const windows = new Map<string, { count: number; start: number }>();

function rateLimit(request: Request): Response | null {
  const url = new URL(request.url);
  const sensitive =
    url.pathname.includes("/sign-in") ||
    url.pathname.includes("/sign-up") ||
    url.pathname.includes("/forget-password");
  if (!sensitive || request.method === "GET") return null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const key = `${ip}:${url.pathname}`;
  const now = Date.now();
  const cur = windows.get(key);
  if (!cur || now - cur.start > 60_000) {
    windows.set(key, { count: 1, start: now });
    return null;
  }
  if (cur.count >= 12) {
    return new Response(JSON.stringify({ message: "Too many attempts. Try again shortly." }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }
  cur.count += 1;
  return null;
}

async function handle(request: Request): Promise<Response> {
  const blocked = rateLimit(request);
  if (blocked) return blocked;
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
