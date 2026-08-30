//#region node_modules/.nitro/vite/services/ssr/assets/session-DRBOWFbC.js
var BEARER_KEY = "grok-auth.bearer-token";
/** Persist Better Auth bearer so preview iframe server functions stay signed in. */
function persistSessionToken(token) {
	if (typeof window === "undefined") return;
	if (typeof token !== "string" || !token) return;
	try {
		window.sessionStorage.setItem(BEARER_KEY, token);
	} catch {}
}
//#endregion
export { persistSessionToken as t };
