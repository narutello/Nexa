import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminGetReport, adminModerateUser, adminUpdateReport } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import { formatExactTime } from "@/lib/nexa/format";
import { REPORT_REASON_LABELS } from "@/lib/nexa/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/report/$reportId")({ component: ReportDetail });

function ReportDetail() {
  const { reportId } = Route.useParams();
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const q = useQuery({
    queryKey: ["admin-report", reportId],
    queryFn: () => adminGetReport({ data: { reportId } }),
  });
  const update = useMutation({
    mutationFn: (status: "resolved" | "rejected" | "reviewing") =>
      adminUpdateReport({ data: { reportId, status, note } }),
    onSuccess: () => {
      toast.success("Report updated");
      void client.invalidateQueries({ queryKey: ["admin-report", reportId] });
      void client.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const report = q.data;
  return (
    <div className="px-4 py-6 md:px-8">
      <Link to="/admin/reports" className="text-sm text-muted-foreground hover:text-foreground">
        Back to reports
      </Link>
      {q.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading evidence…</p>}
      {q.isError && <p className="mt-6 text-sm text-destructive">Could not open this report.</p>}
      {report && (
        <div className="mt-4 max-w-2xl space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-medium tracking-tight">
                {REPORT_REASON_LABELS[report.reason]}
              </h1>
              <Badge>{report.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.targetType} report · {formatExactTime(report.createdAt)}
            </p>
          </header>
          <section className="rounded-2xl border border-border bg-card p-4 text-sm">
            <p>
              Reporter <span className="font-medium">@{report.reporter.handle}</span>
            </p>
            {report.targetUser && (
              <p className="mt-1">
                Reported user{" "}
                <Link
                  to="/admin/user/$userId"
                  params={{ userId: report.targetUser.userId }}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  @{report.targetUser.handle}
                </Link>{" "}
                · {report.targetUser.status}
              </p>
            )}
            {report.details && <p className="mt-3 text-foreground">{report.details}</p>}
          </section>
          <section>
            <h2 className="mb-2 font-medium">Attached evidence</h2>
            {report.evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No message snapshots were attached. The live conversation is not available.
              </p>
            ) : (
              <ul className="space-y-2">
                {report.evidence.map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm",
                      e.isReported ? "border-warn/40 bg-warn/5" : "border-border bg-card",
                    )}
                  >
                    <p className="text-xs text-muted-foreground">
                      @{e.senderHandle ?? "unknown"} · {formatExactTime(e.sentAt)}
                      {e.isReported ? " · reported" : " · context"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{e.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {report.targetUser && (
            <section className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  void adminModerateUser({
                    data: { targetUserId: report.targetUser!.userId, action: "warn" },
                  })
                    .then(() => toast.success("User warned"))
                    .catch((err) => toast.error(errorMessage(err)))
                }
              >
                Warn
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  void adminModerateUser({
                    data: { targetUserId: report.targetUser!.userId, action: "suspend" },
                  })
                    .then(() => toast.success("User suspended"))
                    .catch((err) => toast.error(errorMessage(err)))
                }
              >
                Suspend
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  void adminModerateUser({
                    data: { targetUserId: report.targetUser!.userId, action: "ban" },
                  })
                    .then(() => toast.success("User banned"))
                    .catch((err) => toast.error(errorMessage(err)))
                }
              >
                Ban
              </Button>
            </section>
          )}
          <section className="space-y-3">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Resolution note"
            />
            <div className="flex gap-2">
              <Button onClick={() => update.mutate("resolved")} disabled={update.isPending}>
                Resolve
              </Button>
              <Button
                variant="secondary"
                onClick={() => update.mutate("rejected")}
                disabled={update.isPending}
              >
                Reject
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
