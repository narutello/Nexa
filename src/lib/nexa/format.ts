import { format, isThisYear, isToday, isYesterday } from "date-fns";

export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  if (isThisYear(d)) return format(d, "MMM d");
  return format(d, "MMM d, yyyy");
}

export function formatExactTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "MMM d, yyyy · HH:mm");
}

export function formatLastSeen(iso: string | null, online: boolean): string {
  if (online) return "Online";
  if (!iso) return "Offline";
  return `Last seen ${formatMessageTime(iso)}`;
}
