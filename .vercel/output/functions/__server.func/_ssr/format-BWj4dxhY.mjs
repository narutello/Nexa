import { i as format, n as isToday, r as isThisYear, t as isYesterday } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-BWj4dxhY.js
function formatMessageTime(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	if (isToday(d)) return format(d, "HH:mm");
	if (isYesterday(d)) return "Yesterday";
	if (isThisYear(d)) return format(d, "MMM d");
	return format(d, "MMM d, yyyy");
}
function formatExactTime(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return format(d, "MMM d, yyyy · HH:mm");
}
function formatLastSeen(iso, online) {
	if (online) return "Online";
	if (!iso) return "Offline";
	return `Last seen ${formatMessageTime(iso)}`;
}
//#endregion
export { formatLastSeen as n, formatMessageTime as r, formatExactTime as t };
