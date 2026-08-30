import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as adminListActions } from "./api-CGkd5JiH.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as formatExactTime } from "./format-BWj4dxhY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.actions-DpJE7PA5.js
var import_jsx_runtime = require_jsx_runtime();
function ActionsPage() {
	const q = useQuery({
		queryKey: ["admin-actions"],
		queryFn: () => adminListActions()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Moderation actions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-6 text-sm text-muted-foreground",
				children: "Warns, suspensions, bans, and admin changes."
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: q.data?.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-border bg-card px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						a.action,
						" · @",
						a.targetHandle ?? a.targetUserId.slice(0, 8)
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"by @",
							a.actorHandle ?? "staff",
							" · ",
							formatExactTime(a.createdAt),
							a.reason ? ` · ${a.reason}` : ""
						]
					})]
				}, a.id))
			})
		]
	});
}
//#endregion
export { ActionsPage as component };
