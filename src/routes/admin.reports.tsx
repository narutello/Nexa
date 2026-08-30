import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { adminListReports } from "@/lib/nexa/api";
import { formatExactTime } from "@/lib/nexa/format";
import { REPORT_REASON_LABELS, type ReportStatus } from "@/lib/nexa/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

const FILTERS: Array<ReportStatus | "all"> = ["all", "pending", "reviewing", "resolved", "rejected"];

function ReportsPage() {
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const q = useQuery({
    queryKey: ["admin-reports", status],
    queryFn: () => adminListReports({ data: { status } }),
  });

  return (
    <div className="px-4 py-6 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review attached evidence only. Private threads are not browsable from here.
        </p>
      </header>
      <div className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm capitalize",
              status === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading reports…</p>}
      {q.isError && (
        <p className="text-sm text-destructive">Could not load reports. You may not have access.</p>
      )}
      {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No reports in this view.</p>}
      <ul className="space-y-2">
        {q.data?.map((r) => (
          <li key={r.id}>
            <Link
              to="/admin/report/$reportId"
              params={{ reportId: r.id }}
              className="block rounded-2xl border border-border bg-card px-4 py-3 hover:bg-accent"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{REPORT_REASON_LABELS[r.reason]}</p>
                <Badge
                  tone={
                    r.status === "resolved" ? "ok" : r.status === "rejected" ? "danger" : "warn"
                  }
                >
                  {r.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.targetType} {r.targetUser ? `· @${r.targetUser.handle}` : ""} ·{" "}
                {formatExactTime(r.createdAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
