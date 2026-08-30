import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { NexaWordmark } from "@/components/nexa/mark";
import type { AccountStatus } from "@/lib/nexa/types";

export function RestrictedScreen({
  status,
  reason,
}: {
  status: AccountStatus;
  reason: string | null;
}) {
  const title = status === "banned" ? "Account banned" : "Account suspended";
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm space-y-5 text-center">
        <NexaWordmark className="justify-center" />
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {reason || "This account cannot use Nexa right now."}
          </p>
        </div>
        <Button variant="secondary" className="w-full" onClick={() => void signOut("/login")}>
          Sign out
        </Button>
      </div>
    </main>
  );
}
