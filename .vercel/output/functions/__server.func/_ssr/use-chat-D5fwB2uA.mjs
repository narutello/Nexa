import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as syncState, d as getMyProfile, f as listConversations, p as listMessages } from "./api-CGkd5JiH.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-chat-D5fwB2uA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var meKey = ["me"];
var inboxKey = ["inbox"];
var messagesKey = (id) => ["messages", id];
function mergeInbox(current, incoming) {
	if (incoming.length === 0) return current;
	const map = new Map(current.map((c) => [c.id, c]));
	for (const item of incoming) map.set(item.id, item);
	return [...map.values()].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}
function mergeMessages(current, incoming) {
	if (incoming.length === 0) return current;
	const map = new Map(current.map((m) => [m.id, m]));
	for (const item of incoming) map.set(item.id, {
		...map.get(item.id),
		...item
	});
	return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
function useMe() {
	return useQuery({
		queryKey: meKey,
		queryFn: () => getMyProfile()
	});
}
function useInbox() {
	return useQuery({
		queryKey: inboxKey,
		queryFn: async () => {
			return (await listConversations({ data: { cursor: null } })).items;
		}
	});
}
function useMessages(conversationId) {
	return useQuery({
		queryKey: messagesKey(conversationId ?? ""),
		enabled: Boolean(conversationId),
		queryFn: async () => {
			return (await listMessages({ data: {
				conversationId,
				before: null
			} })).items;
		}
	});
}
function useChatSync(conversationId) {
	const client = useQueryClient();
	const convRef = (0, import_react.useRef)(conversationId);
	convRef.current = conversationId;
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		let timer;
		const tick = async () => {
			if (cancelled) return;
			if (typeof document !== "undefined" && document.visibilityState === "hidden") {
				timer = window.setTimeout(() => void tick(), 25e3);
				return;
			}
			if (typeof navigator !== "undefined" && !navigator.onLine) {
				timer = window.setTimeout(() => void tick(), 8e3);
				return;
			}
			const inbox = client.getQueryData(inboxKey) ?? [];
			const openId = convRef.current;
			const openMsgs = openId ? client.getQueryData(messagesKey(openId)) ?? [] : [];
			const inboxAfter = inbox[0]?.lastMessageAt ?? null;
			const afterCreatedAt = openMsgs.length ? openMsgs[openMsgs.length - 1].createdAt : null;
			const peerIds = inbox.slice(0, 30).map((c) => c.other.userId);
			try {
				const payload = await syncState({ data: {
					inboxAfter,
					conversationId: openId,
					afterCreatedAt,
					peerIds
				} });
				if (cancelled) return;
				client.setQueryData(meKey, (prev) => prev && typeof prev === "object" ? {
					...prev,
					...payload.me
				} : prev);
				if (payload.inbox.length) client.setQueryData(inboxKey, (prev) => mergeInbox(prev ?? [], payload.inbox));
				if (openId && (payload.messages.length || payload.receipts.length)) client.setQueryData(messagesKey(openId), (prev) => {
					let next = mergeMessages(prev ?? [], payload.messages);
					if (payload.receipts.length) {
						const rec = new Map(payload.receipts.map((r) => [r.messageId, r]));
						next = next.map((m) => {
							const r = rec.get(m.id);
							return r ? {
								...m,
								deliveredAt: r.deliveredAt,
								readAt: r.readAt
							} : m;
						});
					}
					return next;
				});
				if (openId) client.setQueryData(inboxKey, (prev) => (prev ?? []).map((c) => c.id === openId ? {
					...c,
					typing: payload.typingUserIds.length > 0
				} : c));
				if (payload.presence.length) {
					const presence = new Map(payload.presence.map((p) => [p.userId, p]));
					client.setQueryData(inboxKey, (prev) => (prev ?? []).map((c) => {
						const p = presence.get(c.other.userId);
						return p ? {
							...c,
							other: {
								...c.other,
								online: p.online,
								lastSeenAt: p.lastSeenAt
							}
						} : c;
					}));
				}
			} catch {}
			const active = Boolean(convRef.current) && document.visibilityState === "visible";
			timer = window.setTimeout(() => void tick(), active ? 3e3 : 7e3);
		};
		timer = window.setTimeout(() => void tick(), 2500);
		const onVis = () => {
			if (document.visibilityState === "visible") tick();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			cancelled = true;
			if (timer) window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [client]);
}
//#endregion
export { useChatSync as a, useMessages as c, messagesKey as i, meKey as n, useInbox as o, mergeInbox as r, useMe as s, inboxKey as t };
