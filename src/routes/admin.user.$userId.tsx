import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminGetUser, adminModerateUser } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import { formatExactTime } from "@/lib/nexa/format";

export const Route = createFileRoute("/admin/user/$userId")({ component: UserDetail });

function UserDetail() {
  const { userId } = Route.useParams();
  const q = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminGetUser({ data: { targetUserId: userId } }),
  });
  const user = q.data?.user;

  async function act(action: "warn" | "suspend" | "ban" | "reactivate") {
    try {
      await adminModerateUser({ data: { targetUserId: userId, action } });
      toast.success("Moderation action recorded");
      await q.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <Link to="/admin/users" className="text-sm text-muted-foreground hover:text-foreground">
        Back to users
      </Link>
      {q.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {user && (
        <div className="mt-4 max-w-xl space-y-6">
          <header>
            <h1 className="font-display text-3xl font-medium tracking-tight">{user.displayName}</h1>
            <p className="text-sm text-muted-foreground">
              @{user.handle} · {user.role}
            </p>
            <div className="mt-2">
              <Badge>{user.status}</Badge>
            </div>
          </header>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void act("warn")}>
              Warn
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void act("suspend")}>
              Suspend
            </Button>
            <Button variant="destructive" size="sm" onClick={() => void act("ban")}>
              Ban
            </Button>
            <Button variant="outline" size="sm" onClick={() => void act("reactivate")}>
              Reactivate
            </Button>
          </div>
          <section>
            <h2 className="mb-2 font-medium">Moderation history</h2>
            {q.data?.actions.length === 0 && (
              <p className="text-sm text-muted-foreground">No actions yet.</p>
            )}
            <ul className="space-y-2">
              {q.data?.actions.map((a) => (
                <li key={a.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                  <p>
                    {a.action} · @{a.actorHandle ?? "staff"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatExactTime(a.createdAt)}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
