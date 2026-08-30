import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Inbox } from "@/components/nexa/inbox";
import { OfflineBanner } from "@/components/nexa/offline-banner";
import { RestrictedScreen } from "@/components/nexa/restricted";
import { SettingsSheet } from "@/components/nexa/settings-sheet";
import { useChatSync, useMe } from "@/lib/nexa/use-chat";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({ component: AppShell });

function AppShell() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="h-10 w-40 animate-pulse rounded-full bg-secondary" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <AppAuthed />;
}

function AppAuthed() {
  const me = useMe();
  const matches = useMatches();
  const threadMatch = matches.find((m) => m.routeId.includes("$conversationId"));
  const conversationId =
    (threadMatch?.params as { conversationId?: string } | undefined)?.conversationId ?? null;
  useChatSync(conversationId);
  const [settings, setSettings] = useState(false);

  if (me.isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="h-10 w-40 animate-pulse rounded-full bg-secondary" />
      </main>
    );
  }
  if (me.isError) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="space-y-3">
          <p className="font-display text-xl">Could not load your account</p>
          <button type="button" className="text-sm underline" onClick={() => void me.refetch()}>
            Try again
          </button>
        </div>
      </main>
    );
  }
  if (me.data && (me.data.status === "suspended" || me.data.status === "banned")) {
    return <RestrictedScreen status={me.data.status} reason={me.data.statusReason} />;
  }

  const threadOpen = Boolean(conversationId);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <OfflineBanner />
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "w-full border-r border-border md:w-80 md:shrink-0 lg:w-96",
            threadOpen && "hidden md:flex md:flex-col",
            !threadOpen && "flex flex-col",
          )}
        >
          <Inbox activeId={conversationId ?? undefined} onOpenSettings={() => setSettings(true)} />
        </aside>
        <section
          className={cn(
            "min-w-0 flex-1",
            threadOpen ? "flex flex-col" : "hidden md:flex md:flex-col",
          )}
        >
          <Outlet />
        </section>
      </div>
      <SettingsSheet open={settings} onOpenChange={setSettings} />
    </div>
  );
}
