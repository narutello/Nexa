import { r as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/middleware-CR0SyJR2.js
var REPORT_STATUSES = [
	"pending",
	"reviewing",
	"resolved",
	"rejected"
];
var REPORT_TARGETS = [
	"user",
	"conversation",
	"message"
];
var REPORT_REASONS = [
	"harassment",
	"hate",
	"threats",
	"spam",
	"scam",
	"sexual",
	"impersonation",
	"other"
];
var REPORT_REASON_LABELS = {
	harassment: "Harassment or bullying",
	hate: "Hate or slurs",
	threats: "Threats or violence",
	spam: "Spam",
	scam: "Scam or fraud",
	sexual: "Sexual content",
	impersonation: "Impersonation",
	other: "Something else"
};
var MESSAGE_MAX_LENGTH = 4e3;
var DETAILS_MAX_LENGTH = 2e3;
var TYPING_TTL_MS = 4e3;
var ONLINE_WINDOW_MS = 45e3;
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B40BzJxt.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-Bhkwhex7.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
//#endregion
export { REPORT_REASON_LABELS as a, TYPING_TTL_MS as c, REPORT_REASONS as i, authMiddleware as l, MESSAGE_MAX_LENGTH as n, REPORT_STATUSES as o, ONLINE_WINDOW_MS as r, REPORT_TARGETS as s, DETAILS_MAX_LENGTH as t };
