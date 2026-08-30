import { b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as useCurrentUserState, t as NexaMark } from "./mark-BTRJyPI5.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BJQ2Vdoz.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-28 animate-pulse rounded-full bg-secondary" })
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "relative min-h-dvh overflow-hidden bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex min-h-dvh max-w-lg flex-col justify-between px-6 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NexaMark, { className: "size-10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 py-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm tracking-[0.2em] text-muted-foreground uppercase",
							children: "Private messenger"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-5xl leading-[1.05] font-medium tracking-tight",
							children: "Quiet conversations, kept between you."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-base leading-relaxed text-muted-foreground",
							children: "Nexa is a real-time chat built for people, not audiences. Presence, receipts, and typing stay light. Private threads stay private — even from admins."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 pb-[env(safe-area-inset-bottom)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "h-12 w-full rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							children: "Create account"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						className: "h-12 w-full rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							children: "Sign in"
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { Home as component };
