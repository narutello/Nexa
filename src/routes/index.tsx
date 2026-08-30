import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { NexaMark } from "@/components/nexa/mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="h-10 w-28 animate-pulse rounded-full bg-secondary" />
      </main>
    );
  }
  if (user) return <Navigate to="/app" />;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-between px-6 py-10">
        <NexaMark className="size-10" />
        <div className="space-y-5 py-12">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">Private messenger</p>
          <h1 className="font-display text-5xl leading-[1.05] font-medium tracking-tight">
            Quiet conversations, kept between you.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Nexa is a real-time chat built for people, not audiences. Presence, receipts, and
            typing stay light. Private threads stay private — even from admins.
          </p>
        </div>
        <div className="space-y-3 pb-[env(safe-area-inset-bottom)]">
          <Button asChild className="h-12 w-full rounded-xl">
            <Link to="/register">Create account</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 w-full rounded-xl">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
