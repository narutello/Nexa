import { o as __toESM } from "../_runtime.mjs";
import { n as errorMessage } from "./errors-qjtEjvj0.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as ownerSetAdmin, g as ownerListAdmins, o as adminListUsers, v as ownerSuspendAdmin } from "./api-CGkd5JiH.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as useMe } from "./use-chat-D5fwB2uA.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
import { t as Badge } from "./badge-Bd1frMLp.mjs";
import { t as Input } from "./input-CSblYDui.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.admins-D4k5UsI9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminsPage() {
	const me = useMe();
	const q = useQuery({
		queryKey: ["owner-admins"],
		queryFn: () => ownerListAdmins()
	});
	const [handle, setHandle] = (0, import_react.useState)("");
	if (me.data && me.data.role !== "OWNER") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 py-10 text-sm text-muted-foreground",
		children: "Only the owner can manage admins."
	});
	async function promote() {
		try {
			const match = (await adminListUsers({ data: { query: handle } })).find((u) => u.handle === handle.replace(/^@/, "").toLowerCase());
			if (!match) {
				toast.error("No user with that handle.");
				return;
			}
			await ownerSetAdmin({ data: {
				targetUserId: match.userId,
				makeAdmin: true
			} });
			toast.success("Admin created");
			setHandle("");
			await q.refetch();
		} catch (err) {
			toast.error(errorMessage(err));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Admins"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-6 text-sm text-muted-foreground",
				children: "Owner-only. Admins cannot create, remove, or change other admins."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex max-w-md gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: handle,
					onChange: (e) => setHandle(e.target.value),
					placeholder: "Handle to promote"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void promote(),
					children: "Make admin"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: q.data?.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3",
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: u.role
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: u.status }), u.role === "ADMIN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => void ownerSuspendAdmin({ data: {
								targetUserId: u.userId,
								suspend: u.status !== "suspended"
							} }).then(() => q.refetch()).catch((err) => toast.error(errorMessage(err))),
							children: u.status === "suspended" ? "Reactivate" : "Suspend"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => void ownerSetAdmin({ data: {
								targetUserId: u.userId,
								makeAdmin: false
							} }).then(() => q.refetch()).catch((err) => toast.error(errorMessage(err))),
							children: "Remove"
						})] })]
					})]
				}, u.userId))
			})
		]
	});
}
//#endregion
export { AdminsPage as component };
