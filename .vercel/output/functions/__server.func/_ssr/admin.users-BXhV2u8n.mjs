import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as adminListUsers } from "./api-CGkd5JiH.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-Bd1frMLp.mjs";
import { t as Input } from "./input-CSblYDui.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.users-BXhV2u8n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UsersPage() {
	const [query, setQuery] = (0, import_react.useState)("");
	const q = useQuery({
		queryKey: ["admin-users", query],
		queryFn: () => adminListUsers({ data: { query } })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Users"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Account and moderation status only. Message history is not listed here."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: query,
				onChange: (e) => setQuery(e.target.value),
				placeholder: "Search handle or name",
				className: "mb-4 max-w-sm"
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading users…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: q.data?.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/user/$userId",
					params: { userId: u.userId },
					className: "flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [
							u.displayName,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["@", u.handle]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							u.role,
							" · ",
							u.reportCount,
							" reports"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: u.status === "banned" ? "danger" : u.status === "suspended" ? "warn" : "neutral",
						children: u.status
					})]
				}) }, u.userId))
			})
		]
	});
}
//#endregion
export { UsersPage as component };
