import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, CheckCheck, ChevronLeft, Flag, MoreHorizontal, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PresenceDot, UserAvatar } from "@/components/nexa/avatar";
import { ReportDialog } from "@/components/nexa/report-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConversation, markRead, sendMessage, setTyping } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import { formatExactTime, formatLastSeen, formatMessageTime } from "@/lib/nexa/format";
import { inboxKey, messagesKey, mergeInbox, useInbox, useMessages } from "@/lib/nexa/use-chat";
import type { ChatMessage, ConversationPreview, PublicProfile } from "@/lib/nexa/types";
import { cn } from "@/lib/utils";
import { useOnline } from "./offline-banner";

export function Thread({ conversationId, myId }: { conversationId: string; myId: string }) {
  const messages = useMessages(conversationId);
  const inbox = useInbox();
  const client = useQueryClient();
  const online = useOnline();
  const [other, setOther] = useState<PublicProfile | null>(
    inbox.data?.find((c) => c.id === conversationId)?.other ?? null,
  );
  const [draft, setDraft] = useState("");
  const [report, setReport] = useState<"user" | "conversation" | "message" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const typingOn = useRef(false);
  const preview = inbox.data?.find((c) => c.id === conversationId);

  useEffect(() => {
    let alive = true;
    setLoadError(null);
    void getConversation({ data: { conversationId } })
      .then((res) => {
        if (alive) setOther(res.other);
      })
      .catch((err) => {
        if (alive) setLoadError(errorMessage(err));
      });
    return () => {
      alive = false;
    };
  }, [conversationId]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.data?.length, preview?.typing]);

  useEffect(() => {
    if (!messages.data?.length) return;
    const last = messages.data[messages.data.length - 1];
    if (last && last.senderId !== myId) {
      void markRead({ data: { conversationId, messageId: last.id } });
      client.setQueryData<ConversationPreview[]>(inboxKey, (prev) =>
        (prev ?? []).map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
      );
    }
  }, [client, conversationId, messages.data, myId]);

  useEffect(() => {
    return () => {
      if (typingOn.current) void setTyping({ data: { conversationId, typing: false } });
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, [conversationId]);

  function bumpTyping() {
    if (!typingOn.current) {
      typingOn.current = true;
      void setTyping({ data: { conversationId, typing: true } });
    }
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      typingOn.current = false;
      void setTyping({ data: { conversationId, typing: false } });
    }, 2500);
  }

  async function onSend() {
    const body = draft.trim();
    if (!body || !online) return;
    const clientId = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: clientId,
      conversationId,
      senderId: myId,
      body,
      createdAt: new Date().toISOString(),
      deleted: false,
      deliveredAt: null,
      readAt: null,
    };
    client.setQueryData<ChatMessage[]>(messagesKey(conversationId), (prev) => [
      ...(prev ?? []),
      optimistic,
    ]);
    setDraft("");
    if (typingOn.current) {
      typingOn.current = false;
      void setTyping({ data: { conversationId, typing: false } });
    }
    try {
      const saved = await sendMessage({ data: { conversationId, body, clientId } });
      client.setQueryData<ChatMessage[]>(messagesKey(conversationId), (prev) =>
        (prev ?? []).map((m) => (m.id === clientId ? saved : m)),
      );
      client.setQueryData<ConversationPreview[]>(inboxKey, (prev) =>
        mergeInbox(prev ?? [], [
          {
            id: conversationId,
            other: other ?? preview?.other ?? {
              userId: "",
              displayName: "",
              handle: "",
              avatarHue: 200,
              online: false,
              lastSeenAt: null,
            },
            lastMessage: {
              id: saved.id,
              body: saved.body,
              senderId: saved.senderId,
              createdAt: saved.createdAt,
            },
            lastMessageAt: saved.createdAt,
            unreadCount: 0,
            typing: false,
          },
        ]),
      );
    } catch (err) {
      client.setQueryData<ChatMessage[]>(messagesKey(conversationId), (prev) =>
        (prev ?? []).filter((m) => m.id !== clientId),
      );
      setDraft(body);
      toast.error(errorMessage(err));
    }
  }

  const grouped = useMemo(() => messages.data ?? [], [messages.data]);

  if (loadError) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <div className="space-y-3">
          <p className="font-display text-lg">Conversation unavailable</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button asChild variant="secondary">
            <Link to="/app">Back to inbox</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center gap-1 border-b border-border px-1 py-2">
        <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="Back">
          <Link to="/app">
            <ChevronLeft />
          </Link>
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
          <span className="relative">
            <UserAvatar name={other?.displayName ?? "…"} hue={other?.avatarHue ?? 200} size="sm" />
            <PresenceDot online={Boolean(other?.online)} className="ring-background" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{other?.displayName ?? "Loading"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {other ? formatLastSeen(other.lastSeenAt, other.online) : " "}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Conversation menu">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setReport("user")}>
              <Flag className="size-4" /> Report user
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setReport("conversation")}>
              <Flag className="size-4" /> Report conversation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setReport("message")}>
              <Flag className="size-4" /> Report messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div ref={scroller} className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.isLoading && (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading messages…</p>
        )}
        {messages.isError && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Could not load messages.</p>
            <Button variant="secondary" className="mt-3" onClick={() => void messages.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {!messages.isLoading && grouped.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            This is the start of your conversation with {other?.displayName ?? "them"}.
          </p>
        )}
        {grouped.map((m) => {
          const mine = m.senderId === myId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[min(100%,20rem)] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  mine
                    ? "rounded-br-md bg-bubble-mine text-foreground"
                    : "rounded-bl-md bg-bubble-theirs text-foreground",
                )}
                title={formatExactTime(m.createdAt)}
              >
                <p className="whitespace-pre-wrap break-words">
                  {m.deleted ? <span className="italic text-muted-foreground">Message deleted</span> : m.body}
                </p>
                <p
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground tabular-nums",
                  )}
                >
                  {formatMessageTime(m.createdAt)}
                  {mine && <ReceiptIcon deliveredAt={m.deliveredAt} readAt={m.readAt} />}
                </p>
              </div>
            </div>
          );
        })}
        {preview?.typing && (
          <p className="px-1 text-xs text-muted-foreground">{other?.displayName} is typing…</p>
        )}
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void onSend();
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl bg-secondary p-1.5 pl-3">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (e.target.value.trim()) bumpTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder={online ? "Message" : "Waiting for connection…"}
            disabled={!online}
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl"
            disabled={!draft.trim() || !online}
            aria-label="Send"
          >
            <Send />
          </Button>
        </div>
      </form>

      <ReportDialog
        open={report !== null}
        onOpenChange={(open) => {
          if (!open) setReport(null);
        }}
        targetType={report === "user" ? "user" : report === "conversation" ? "conversation" : "message"}
        targetUserId={other?.userId}
        conversationId={conversationId}
        messages={grouped}
      />
    </div>
  );
}

function ReceiptIcon({
  deliveredAt,
  readAt,
}: {
  deliveredAt: string | null;
  readAt: string | null;
}) {
  if (readAt) return <CheckCheck className="size-3.5 text-online" aria-label="Read" />;
  if (deliveredAt) return <CheckCheck className="size-3.5" aria-label="Delivered" />;
  return <Check className="size-3.5" aria-label="Sent" />;
}
