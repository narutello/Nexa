import { o as __toESM } from "../_runtime.mjs";
import { n as errorMessage } from "./errors-qjtEjvj0.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as REPORT_REASON_LABELS } from "./middleware-CR0SyJR2.mjs";
import { c as adminUpdateReport, s as adminModerateUser, t as adminGetReport } from "./api-CGkd5JiH.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
import { t as formatExactTime } from "./format-BWj4dxhY.mjs";
import { t as Badge } from "./badge-Bd1frMLp.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$2 } from "./router-D88Ada1J.mjs";
import { t as Textarea } from "./textarea-Dp2VYBgH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.report._reportId-CM6IkNof.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportDetail() {
	const { reportId } = Route$2.useParams();
	const client = useQueryClient();
	const [note, setNote] = (0, import_react.useState)("");
	const q = useQuery({
		queryKey: ["admin-report", reportId],
		queryFn: () => adminGetReport({ data: { reportId } })
	});
	const update = useMutation({
		mutationFn: (status) => adminUpdateReport({ data: {
			reportId,
			status,
			note
		} }),
		onSuccess: () => {
			toast.success("Report updated");
			client.invalidateQueries({ queryKey: ["admin-report", reportId] });
			client.invalidateQueries({ queryKey: ["admin-reports"] });
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	const report = q.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin/reports",
				className: "text-sm text-muted-foreground hover:text-foreground",
				children: "Back to reports"
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: "Loading evidence…"
			}),
			q.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-destructive",
				children: "Could not open this report."
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 max-w-2xl space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-medium tracking-tight",
								children: REPORT_REASON_LABELS[report.reason]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: report.status })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								report.targetType,
								" report · ",
								formatExactTime(report.createdAt)
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border border-border bg-card p-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Reporter ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: ["@", report.reporter.handle]
							})] }),
							report.targetUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1",
								children: [
									"Reported user",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/admin/user/$userId",
										params: { userId: report.targetUser.userId },
										className: "font-medium underline-offset-4 hover:underline",
										children: ["@", report.targetUser.handle]
									}),
									" ",
									"· ",
									report.targetUser.status
								]
							}),
							report.details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-foreground",
								children: report.details
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 font-medium",
						children: "Attached evidence"
					}), report.evidence.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No message snapshots were attached. The live conversation is not available."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: report.evidence.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("rounded-2xl border px-4 py-3 text-sm", e.isReported ? "border-warn/40 bg-warn/5" : "border-border bg-card"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"@",
									e.senderHandle ?? "unknown",
									" · ",
									formatExactTime(e.sentAt),
									e.isReported ? " · reported" : " · context"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 whitespace-pre-wrap",
								children: e.body
							})]
						}, e.id))
					})] }),
					report.targetUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								onClick: () => void adminModerateUser({ data: {
									targetUserId: report.targetUser.userId,
									action: "warn"
								} }).then(() => toast.success("User warned")).catch((err) => toast.error(errorMessage(err))),
								children: "Warn"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								onClick: () => void adminModerateUser({ data: {
									targetUserId: report.targetUser.userId,
									action: "suspend"
								} }).then(() => toast.success("User suspended")).catch((err) => toast.error(errorMessage(err))),
								children: "Suspend"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "destructive",
								size: "sm",
								onClick: () => void adminModerateUser({ data: {
									targetUserId: report.targetUser.userId,
									action: "ban"
								} }).then(() => toast.success("User banned")).catch((err) => toast.error(errorMessage(err))),
								children: "Ban"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "Resolution note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => update.mutate("resolved"),
								disabled: update.isPending,
								children: "Resolve"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => update.mutate("rejected"),
								disabled: update.isPending,
								children: "Reject"
							})]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { ReportDetail as component };
