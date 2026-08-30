import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import type { ChatMessage, ReportReason, ReportTargetType } from "@/lib/nexa/types";
import { REPORT_REASON_LABELS, REPORT_REASONS } from "@/lib/nexa/types";
import { cn } from "@/lib/utils";

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetUserId,
  conversationId,
  messages = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetUserId?: string;
  conversationId?: string;
  messages?: ChatMessage[];
}) {
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [details, setDetails] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const title =
    targetType === "user"
      ? "Report user"
      : targetType === "conversation"
        ? "Report conversation"
        : "Report messages";

  async function submit() {
    if (targetType === "message" && selected.length === 0) {
      toast.error("Select at least one message as evidence.");
      return;
    }
    setBusy(true);
    try {
      await createReport({
        data: {
          targetType,
          reason,
          details: details.trim() || undefined,
          targetUserId,
          conversationId,
          messageIds: selected.length ? selected : undefined,
        },
      });
      toast.success("Report submitted. A moderator will review it.");
      onOpenChange(false);
      setDetails("");
      setSelected([]);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Moderators only see the reason, your note, and any messages you attach.
            They cannot open the rest of the private conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm",
                    reason === r
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {REPORT_REASON_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          {(targetType === "message" || (targetType === "conversation" && messages.length > 0)) && (
            <div className="space-y-2">
              <Label>
                {targetType === "message" ? "Evidence (required)" : "Optional evidence"}
              </Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {messages.slice(-20).map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(m.id)}
                      onChange={(e) => {
                        setSelected((cur) =>
                          e.target.checked ? [...cur, m.id].slice(0, 5) : cur.filter((id) => id !== m.id),
                        );
                      }}
                    />
                    <span className="line-clamp-2 text-muted-foreground">
                      {m.deleted ? "Deleted message" : m.body}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="report-details">Additional details</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={2000}
              placeholder="Anything a moderator should know"
            />
          </div>
          <Button className="w-full" onClick={() => void submit()} disabled={busy}>
            {busy ? "Submitting…" : "Submit report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
