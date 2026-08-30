import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { adminListAudit } from "@/lib/nexa/api";
import { formatExactTime } from "@/lib/nexa/format";
import { useMe } from "@/lib/nexa/use-chat";

export const Route = createFileRoute("/admin/audit")({ component: AuditPage });

function AuditPage() {
  const me = useMe();
  const q = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => adminListAudit(),
  });
  if (me.data && me.data.role !== "OWNER") {
    return <div className="px-4 py-10 text-sm text-muted-foreground">Only the owner can read the audit log.</div>;
  }
  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Audit log</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Every sensitive staff action, including evidence views.
      </p>
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {q.isError && <p className="text-sm text-destructive">Could not load the audit log.</p>}
      <ul className="space-y-2">
        {q.data?.map((row) => (
          <li key={row.id} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <p>
              {row.action} · {row.resourceType}
              {row.targetHandle ? ` · @${row.targetHandle}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              @{row.actorHandle ?? "staff"} · {formatExactTime(row.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
