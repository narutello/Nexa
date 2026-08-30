import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { adminListActions } from "@/lib/nexa/api";
import { formatExactTime } from "@/lib/nexa/format";

export const Route = createFileRoute("/admin/actions")({ component: ActionsPage });

function ActionsPage() {
  const q = useQuery({
    queryKey: ["admin-actions"],
    queryFn: () => adminListActions(),
  });
  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Moderation actions</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Warns, suspensions, bans, and admin changes.</p>
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <ul className="space-y-2">
        {q.data?.map((a) => (
          <li key={a.id} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <p>
              {a.action} · @{a.targetHandle ?? a.targetUserId.slice(0, 8)}
            </p>
            <p className="text-xs text-muted-foreground">
              by @{a.actorHandle ?? "staff"} · {formatExactTime(a.createdAt)}
              {a.reason ? ` · ${a.reason}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
