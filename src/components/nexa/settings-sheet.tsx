import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { listMyReports, updateMyProfile } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import { REPORT_REASON_LABELS } from "@/lib/nexa/types";
import { meKey, useMe } from "@/lib/nexa/use-chat";
import { isStaff } from "@/lib/nexa/authz";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export function SettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const me = useMe();
  const client = useQueryClient();
  const profile = me.data;
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const reports = useQuery({
    queryKey: ["my-reports"],
    queryFn: () => listMyReports(),
    enabled: open,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.displayName);
      setHandle(profile.handle);
    }
  }, [profile]);

  async function save() {
    setBusy(true);
    try {
      const next = await updateMyProfile({
        data: { displayName: name, handle },
      });
      client.setQueryData(meKey, next);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Account</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {profile && (
            <>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    autoCapitalize="none"
                  />
                </div>
                <Button onClick={() => void save()} disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </Button>
              </div>
              {profile.status === "warned" && (
                <p className="rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn">
                  {profile.statusReason || "A moderator has warned this account."}
                </p>
              )}
              {isStaff(profile.role) && (
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/admin">Open admin panel</Link>
                </Button>
              )}
              <div>
                <p className="mb-2 text-sm font-medium">Your reports</p>
                {reports.data?.length ? (
                  <ul className="space-y-2">
                    {reports.data.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                      >
                        <span>
                          {REPORT_REASON_LABELS[r.reason]}
                          {r.targetHandle ? ` · @${r.targetHandle}` : ""}
                        </span>
                        <Badge>{r.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">You have not submitted any reports.</p>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => void signOut("/login")}>
                Sign out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
