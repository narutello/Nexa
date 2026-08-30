import { l as isStaff } from "./authz-BLpDbWRQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { d as useRouterState, h as Outlet, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as useMe } from "./use-chat-D5fwB2uA.mjs";
import { n as NexaWordmark, r as useCurrentUserState } from "./mark-BTRJyPI5.mjs";
import { n as RestrictedScreen, t as RedirectToSignIn } from "./restricted-DCMzjklC.mjs";
import { c as ScrollText, d as ClipboardList, i as Shield, l as Flag, n as Users } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-D79crRIC.js
var import_jsx_runtime = require_jsx_runtime();
function AdminGate() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "grid min-h-dvh place-items-center bg-background" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {});
}
function AdminShell() {
	const me = useMe();
	const path = useRouterState({ select: (s) => s.location.pathname });
	if (me.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "grid min-h-dvh place-items-center bg-background" });
	if (me.data && (me.data.status === "suspended" || me.data.status === "banned")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestrictedScreen, {
		status: me.data.status,
		reason: me.data.statusReason
	});
	if (!me.data || !isStaff(me.data.role)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: "Staff only"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "You do not have access to the admin panel."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/app",
					className: "text-sm underline",
					children: "Back to Nexa"
				})
			]
		})
	});
	const owner = me.data.role === "OWNER";
	const links = [
		{
			to: "/admin/reports",
			label: "Reports",
			icon: Flag
		},
		{
			to: "/admin/users",
			label: "Users",
			icon: Users
		},
		{
			to: "/admin/actions",
			label: "Moderation",
			icon: ClipboardList
		},
		...owner ? [{
			to: "/admin/admins",
			label: "Admins",
			icon: Shield
		}, {
			to: "/admin/audit",
			label: "Audit log",
			icon: ScrollText
		}] : []
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-background md:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "border-b border-border md:w-56 md:border-r md:border-b-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NexaWordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/app",
					className: "text-xs text-muted-foreground hover:text-foreground",
					children: "Chat"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-3 md:pb-6",
				children: links.map((l) => {
					const Icon = l.icon;
					const active = path === l.to || path.startsWith(`${l.to}/`);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: l.to,
						className: cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), l.label]
					}, l.to);
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
//#endregion
export { AdminGate as component };
