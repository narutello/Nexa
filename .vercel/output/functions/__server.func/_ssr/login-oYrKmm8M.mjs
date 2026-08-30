import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Navigate, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as NexaWordmark, r as useCurrentUserState } from "./mark-BTRJyPI5.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
import { t as Input } from "./input-CSblYDui.mjs";
import { t as GROK_PROVIDERS } from "./server-Dnb74gCf.mjs";
import { t as Label } from "./label-Bpw8mAUq.mjs";
import { t as persistSessionToken } from "./session-DRBOWFbC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-oYrKmm8M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "grid min-h-dvh place-items-center bg-background" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app" });
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const { data, error: err } = await authClient.signIn.email({
				email,
				password
			});
			if (err) throw new Error(err.message ?? "Could not sign in");
			persistSessionToken(data?.token);
			await authClient.getSession();
			await navigate({ to: "/app" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background px-6 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm space-y-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NexaWordmark, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-medium tracking-tight",
						children: "Welcome back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Sign in to continue your conversations."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (e) => void onSubmit(e),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								type: "email",
								autoComplete: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: "password",
								autoComplete: "current-password",
								required: true,
								value: password,
								onChange: (e) => setPassword(e.target.value)
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-destructive",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: busy ? "Signing in…" : "Sign in"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						className: "w-full",
						onClick: () => void signIn(p.providerId, { callbackURL: "/app" }),
						children: ["Continue with ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-sm text-muted-foreground",
					children: [
						"New here?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							className: "text-foreground underline-offset-4 hover:underline",
							children: "Create an account"
						})
					]
				})
			] })]
		})
	});
}
//#endregion
export { Login as component };
