import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as REPORT_REASON_LABELS } from "./middleware-CR0SyJR2.mjs";
import { a as adminListReports } from "./api-CGkd5JiH.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as formatExactTime } from "./format-BWj4dxhY.mjs";
import { t as Badge } from "./badge-Bd1frMLp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.reports-C_xwjklA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"all",
	"pending",
	"reviewing",
	"resolved",
	"rejected"
];
function ReportsPage() {
	const [status, setStatus] = (0, import_react.useState)("all");
	const q = useQuery({
		queryKey: ["admin-reports", status],
		queryFn: () => adminListReports({ data: { status } })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Reports"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Review attached evidence only. Private threads are not browsable from here."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-1",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setStatus(f),
					className: cn("rounded-full px-3 py-1.5 text-sm capitalize", status === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
					children: f
				}, f))
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading reports…"
			}),
			q.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: "Could not load reports. You may not have access."
			}),
			q.data?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No reports in this view."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: q.data?.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/report/$reportId",
					params: { reportId: r.id },
					className: "block rounded-2xl border border-border bg-card px-4 py-3 hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: REPORT_REASON_LABELS[r.reason]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: r.status === "resolved" ? "ok" : r.status === "rejected" ? "danger" : "warn",
							children: r.status
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: [
							r.targetType,
							" ",
							r.targetUser ? `· @${r.targetUser.handle}` : "",
							" ·",
							" ",
							formatExactTime(r.createdAt)
						]
					})]
				}) }, r.id))
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
