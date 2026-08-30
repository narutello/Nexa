import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Flag, Shield, Users, ScrollText } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { NexaWordmark } from "@/components/nexa/mark";
import { RestrictedScreen } from "@/components/nexa/restricted";
import { isStaff } from "@/lib/nexa/authz";
import { useMe } from "@/lib/nexa/use-chat";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: AdminGate });

function AdminGate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <main className="grid min-h-dvh place-items-center bg-background" />;
  if (!user) return <RedirectToSignIn />;
  return <AdminShell />;
}

function AdminShell() {
  const me = useMe();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (me.isPending) return <main className="grid min-h-dvh place-items-center bg-background" />;
  if (me.data && (me.data.status === "suspended" || me.data.status === "banned")) {
    return <RestrictedScreen status={me.data.status} reason={me.data.statusReason} />;
  }
  if (!me.data || !isStaff(me.data.role)) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="space-y-3">
          <p className="font-display text-2xl">Staff only</p>
          <p className="text-sm text-muted-foreground">You do not have access to the admin panel.</p>
          <Link to="/app" className="text-sm underline">
            Back to Nexa
          </Link>
        </div>
      </main>
    );
  }

  const owner = me.data.role === "OWNER";
  const links = [
    { to: "/admin/reports", label: "Reports", icon: Flag },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/actions", label: "Moderation", icon: ClipboardList },
    ...(owner
      ? [
          { to: "/admin/admins", label: "Admins", icon: Shield },
          { to: "/admin/audit", label: "Audit log", icon: ScrollText },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside className="border-b border-border md:w-56 md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 py-4">
          <NexaWordmark />
          <Link to="/app" className="text-xs text-muted-foreground hover:text-foreground">
            Chat
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-3 md:pb-6">
          {links.map((l) => {
            const Icon = l.icon;
            const active = path === l.to || path.startsWith(`${l.to}/`);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
