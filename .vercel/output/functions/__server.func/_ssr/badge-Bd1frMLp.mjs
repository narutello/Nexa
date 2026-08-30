import { t as cn } from "./utils-C_uf36nf.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Bd1frMLp.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide", tone === "neutral" && "bg-secondary text-muted-foreground", tone === "ok" && "bg-online/15 text-online", tone === "warn" && "bg-warn/15 text-warn", tone === "danger" && "bg-destructive/15 text-destructive", className),
		...props
	});
}
//#endregion
export { Badge as t };
