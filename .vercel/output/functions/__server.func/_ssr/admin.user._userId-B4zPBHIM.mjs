import { n as errorMessage } from "./errors-qjtEjvj0.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as adminGetUser, s as adminModerateUser } from "./api-CGkd5JiH.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
import { t as formatExactTime } from "./format-BWj4dxhY.mjs";
import { t as Badge } from "./badge-Bd1frMLp.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$1 } from "./router-D88Ada1J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.user._userId-B4zPBHIM.js
var import_jsx_runtime = require_jsx_runtime();
function UserDetail() {
	const { userId } = Route$1.useParams();
	const q = useQuery({
		queryKey: ["admin-user", userId],
		queryFn: () => adminGetUser({ data: { targetUserId: userId } })
	});
	const user = q.data?.user;
	async function act(action) {
		try {
			await adminModerateUser({ data: {
				targetUserId: userId,
				action
			} });
			toast.success("Moderation action recorded");
			await q.refetch();
		} catch (err) {
			toast.error(errorMessage(err));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin/users",
				className: "text-sm text-muted-foreground hover:text-foreground",
				children: "Back to users"
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: "Loading…"
			}),
			user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 max-w-xl space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-medium tracking-tight",
							children: user.displayName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"@",
								user.handle,
								" · ",
								user.role
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: user.status })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								onClick: () => void act("warn"),
								children: "Warn"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								onClick: () => void act("suspend"),
								children: "Suspend"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "destructive",
								size: "sm",
								onClick: () => void act("ban"),
								children: "Ban"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => void act("reactivate"),
								children: "Reactivate"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 font-medium",
							children: "Moderation history"
						}),
						q.data?.actions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No actions yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: q.data?.actions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-xl border border-border px-3 py-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									a.action,
									" · @",
									a.actorHandle ?? "staff"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [formatExactTime(a.createdAt), a.reason ? ` · ${a.reason}` : ""]
								})]
							}, a.id))
						})
					] })
				]
			})
		]
	});
}
//#endregion
export { UserDetail as component };
