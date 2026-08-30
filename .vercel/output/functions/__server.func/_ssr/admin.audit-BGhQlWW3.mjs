import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as adminListAudit } from "./api-CGkd5JiH.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as useMe } from "./use-chat-D5fwB2uA.mjs";
import { t as formatExactTime } from "./format-BWj4dxhY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.audit-BGhQlWW3.js
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const me = useMe();
	const q = useQuery({
		queryKey: ["admin-audit"],
		queryFn: () => adminListAudit()
	});
	if (me.data && me.data.role !== "OWNER") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 py-10 text-sm text-muted-foreground",
		children: "Only the owner can read the audit log."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Audit log"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-6 text-sm text-muted-foreground",
				children: "Every sensitive staff action, including evidence views."
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}),
			q.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: "Could not load the audit log."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: q.data?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-border bg-card px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						row.action,
						" · ",
						row.resourceType,
						row.targetHandle ? ` · @${row.targetHandle}` : ""
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"@",
							row.actorHandle ?? "staff",
							" · ",
							formatExactTime(row.createdAt)
						]
					})]
				}, row.id))
			})
		]
	});
}
//#endregion
export { AuditPage as component };
