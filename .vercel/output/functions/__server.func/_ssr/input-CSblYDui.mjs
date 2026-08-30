import { t as cn } from "./utils-C_uf36nf.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CSblYDui.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground", "transition-[box-shadow,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Input as t };
