import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  getMyProfile,
  listConversations,
  listMessages,
  syncState,
} from "./api";
import type { ChatMessage, ConversationPreview, SyncPayload } from "./types";

export const meKey = ["me"] as const;
export const inboxKey = ["inbox"] as const;
export const messagesKey = (id: string) => ["messages", id] as const;

export function mergeInbox(
  current: ConversationPreview[],
  incoming: ConversationPreview[],
): ConversationPreview[] {
  if (incoming.length === 0) return current;
  const map = new Map(current.map((c) => [c.id, c]));
  for (const item of incoming) map.set(item.id, item);
  return [...map.values()].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (incoming.length === 0) return current;
  const map = new Map(current.map((m) => [m.id, m]));
  for (const item of incoming) map.set(item.id, { ...map.get(item.id), ...item });
  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function useMe() {
  return useQuery({
    queryKey: meKey,
    queryFn: () => getMyProfile(),
  });
}

export function useInbox() {
  return useQuery({
    queryKey: inboxKey,
    queryFn: async () => {
      const res = await listConversations({ data: { cursor: null } });
      return res.items;
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: messagesKey(conversationId ?? ""),
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const res = await listMessages({
        data: { conversationId: conversationId!, before: null },
      });
      return res.items;
    },
  });
}

export function useChatSync(conversationId: string | null) {
  const client = useQueryClient();
  const convRef = useRef(conversationId);
  convRef.current = conversationId;

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        timer = window.setTimeout(() => void tick(), 25_000);
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        timer = window.setTimeout(() => void tick(), 8_000);
        return;
      }

      const inbox = client.getQueryData<ConversationPreview[]>(inboxKey) ?? [];
      const openId = convRef.current;
      const openMsgs = openId
        ? (client.getQueryData<ChatMessage[]>(messagesKey(openId)) ?? [])
        : [];
      const inboxAfter = inbox[0]?.lastMessageAt ?? null;
      const afterCreatedAt = openMsgs.length ? openMsgs[openMsgs.length - 1]!.createdAt : null;
      const peerIds = inbox.slice(0, 30).map((c) => c.other.userId);

      try {
        const payload: SyncPayload = await syncState({
          data: {
            inboxAfter,
            conversationId: openId,
            afterCreatedAt,
            peerIds,
          },
        });
        if (cancelled) return;

        client.setQueryData(meKey, (prev) =>
          prev && typeof prev === "object"
            ? { ...prev, ...payload.me }
            : prev,
        );
        if (payload.inbox.length) {
          client.setQueryData<ConversationPreview[]>(inboxKey, (prev) =>
            mergeInbox(prev ?? [], payload.inbox),
          );
        }
        if (openId && (payload.messages.length || payload.receipts.length)) {
          client.setQueryData<ChatMessage[]>(messagesKey(openId), (prev) => {
            let next = mergeMessages(prev ?? [], payload.messages);
            if (payload.receipts.length) {
              const rec = new Map(payload.receipts.map((r) => [r.messageId, r]));
              next = next.map((m) => {
                const r = rec.get(m.id);
                return r ? { ...m, deliveredAt: r.deliveredAt, readAt: r.readAt } : m;
              });
            }
            return next;
          });
        }
        if (openId) {
          client.setQueryData<ConversationPreview[]>(inboxKey, (prev) =>
            (prev ?? []).map((c) =>
              c.id === openId ? { ...c, typing: payload.typingUserIds.length > 0 } : c,
            ),
          );
        }
        if (payload.presence.length) {
          const presence = new Map(payload.presence.map((p) => [p.userId, p]));
          client.setQueryData<ConversationPreview[]>(inboxKey, (prev) =>
            (prev ?? []).map((c) => {
              const p = presence.get(c.other.userId);
              return p
                ? { ...c, other: { ...c.other, online: p.online, lastSeenAt: p.lastSeenAt } }
                : c;
            }),
          );
        }
      } catch {
        /* keep last good state; next tick retries */
      }

      const active = Boolean(convRef.current) && document.visibilityState === "visible";
      timer = window.setTimeout(() => void tick(), active ? 3000 : 7000);
    };

    timer = window.setTimeout(() => void tick(), 2500);
    const onVis = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [client]);
}
