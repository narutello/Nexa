import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/offline-banner-DrohvRfu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UserAvatar({ name, hue, size = "md", className }) {
	const initial = (name.trim().charAt(0) || "?").toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid shrink-0 place-items-center rounded-full font-medium text-background", size === "sm" && "size-8 text-xs", size === "md" && "size-10 text-sm", size === "lg" && "size-12 text-base", className),
		style: { background: `hsl(${hue} 18% 62%)` },
		"aria-hidden": true,
		children: initial
	});
}
function PresenceDot({ online, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-card", online ? "bg-online" : "bg-muted-foreground/50", className) });
}
function OfflineBanner() {
	const [online, setOnline] = (0, import_react.useState)(typeof navigator === "undefined" ? true : navigator.onLine);
	(0, import_react.useEffect)(() => {
		const on = () => setOnline(true);
		const off = () => setOnline(false);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);
	if (online) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-warn/15 px-4 py-2 text-center text-sm text-warn",
		children: "You are offline. Messages will send when you reconnect."
	});
}
function useOnline() {
	const [online, setOnline] = (0, import_react.useState)(typeof navigator === "undefined" ? true : navigator.onLine);
	(0, import_react.useEffect)(() => {
		const on = () => setOnline(true);
		const off = () => setOnline(false);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);
	return online;
}
//#endregion
export { useOnline as i, PresenceDot as n, UserAvatar as r, OfflineBanner as t };
