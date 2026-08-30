import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PresenceDot, UserAvatar } from "@/components/nexa/avatar";
import { NexaWordmark } from "@/components/nexa/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { searchUsers, startConversation } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import { formatMessageTime } from "@/lib/nexa/format";
import { inboxKey, useInbox } from "@/lib/nexa/use-chat";
import type { ConversationPreview, PublicProfile } from "@/lib/nexa/types";
import { cn } from "@/lib/utils";

export function Inbox({
  activeId,
  onOpenSettings,
}: {
  activeId?: string;
  onOpenSettings: () => void;
}) {
  const inbox = useInbox();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PublicProfile[] | null>(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const client = useQueryClient();

  async function onSearch(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setHits(null);
      return;
    }
    setSearching(true);
    try {
      const rows = await searchUsers({ data: { query: value } });
      setHits(rows);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  async function openUser(user: PublicProfile) {
    try {
      const conv = await startConversation({ data: { otherUserId: user.userId } });
      client.setQueryData<ConversationPreview[]>(inboxKey, (prev) => {
        const exists = (prev ?? []).some((c) => c.id === conv.id);
        if (exists) return prev;
        return [
          {
            id: conv.id,
            other: conv.other,
            lastMessage: null,
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
            typing: false,
          },
          ...(prev ?? []),
        ];
      });
      setQ("");
      setHits(null);
      await navigate({ to: "/app/$conversationId", params: { conversationId: conv.id } });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const empty = !inbox.isLoading && (inbox.data?.length ?? 0) === 0 && !q;

  const items = useMemo(() => inbox.data ?? [], [inbox.data]);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <NexaWordmark />
        <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Settings">
          <Settings />
        </Button>
      </header>
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => void onSearch(e.target.value)}
            placeholder="Search people"
            className="pl-9"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {hits ? (
          <div className="px-2 pb-4">
            {searching && <p className="px-3 py-2 text-sm text-muted-foreground">Searching…</p>}
            {!searching && hits.length === 0 && (
              <p className="px-3 py-6 text-sm text-muted-foreground">No people match that search.</p>
            )}
            {hits.map((u) => (
              <button
                key={u.userId}
                type="button"
                onClick={() => void openUser(u)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-accent"
              >
                <span className="relative">
                  <UserAvatar name={u.displayName} hue={u.avatarHue} />
                  <PresenceDot online={u.online} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{u.displayName}</span>
                  <span className="block truncate text-sm text-muted-foreground">@{u.handle}</span>
                </span>
              </button>
            ))}
          </div>
        ) : inbox.isLoading ? (
          <div className="space-y-2 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : inbox.isError ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Could not load conversations.</p>
            <Button variant="secondary" className="mt-3" onClick={() => void inbox.refetch()}>
              Try again
            </Button>
          </div>
        ) : empty ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-lg">No conversations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Search for someone by name or handle to start a private chat.
            </p>
          </div>
        ) : (
          <nav className="px-2 pb-6">
            {items.map((c) => (
              <Link
                key={c.id}
                to="/app/$conversationId"
                params={{ conversationId: c.id }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent",
                  activeId === c.id && "bg-accent",
                )}
              >
                <span className="relative">
                  <UserAvatar name={c.other.displayName} hue={c.other.avatarHue} />
                  <PresenceDot online={c.other.online} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium">{c.other.displayName}</span>
                    {c.lastMessage && (
                      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {formatMessageTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-muted-foreground">
                      {c.typing ? "Typing…" : c.lastMessage?.body || "No messages yet"}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground tabular-nums">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            ))}
          </nav>
        )}
      </ScrollArea>
    </div>
  );
}
