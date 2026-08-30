import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { NexaWordmark } from "@/components/nexa/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { persistSessionToken } from "@/lib/nexa/session";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <main className="grid min-h-dvh place-items-center bg-background" />;
  }
  if (user) return <Navigate to="/app" />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.signUp.email({
        name: name.trim(),
        email,
        password,
      });
      if (err) throw new Error(err.message ?? "Could not create account");
      persistSessionToken((data as { token?: string } | null)?.token);
      await authClient.getSession();
      await navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3">
          <NexaWordmark />
          <h1 className="font-display text-3xl font-medium tracking-tight">Create your space</h1>
          <p className="text-sm text-muted-foreground">
            A handle, an inbox, and conversations that stay yours.
          </p>
        </div>
        {!authEnabled ? (
          <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
        ) : (
          <>
            <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => void signIn(p.providerId, { callbackURL: "/app" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
