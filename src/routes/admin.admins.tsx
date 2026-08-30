import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminListUsers, ownerListAdmins, ownerSetAdmin, ownerSuspendAdmin } from "@/lib/nexa/api";
import { errorMessage } from "@/lib/nexa/errors";
import { useMe } from "@/lib/nexa/use-chat";

export const Route = createFileRoute("/admin/admins")({ component: AdminsPage });

function AdminsPage() {
  const me = useMe();
  const q = useQuery({
    queryKey: ["owner-admins"],
    queryFn: () => ownerListAdmins(),
  });
  const [handle, setHandle] = useState("");

  if (me.data && me.data.role !== "OWNER") {
    return (
      <div className="px-4 py-10 text-sm text-muted-foreground">Only the owner can manage admins.</div>
    );
  }

  async function promote() {
    try {
      const users = await adminListUsers({ data: { query: handle } });
      const match = users.find((u) => u.handle === handle.replace(/^@/, "").toLowerCase());
      if (!match) {
        toast.error("No user with that handle.");
        return;
      }
      await ownerSetAdmin({ data: { targetUserId: match.userId, makeAdmin: true } });
      toast.success("Admin created");
      setHandle("");
      await q.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Admins</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Owner-only. Admins cannot create, remove, or change other admins.
      </p>
      <div className="mb-6 flex max-w-md gap-2">
        <Input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Handle to promote"
        />
        <Button onClick={() => void promote()}>Make admin</Button>
      </div>
      <ul className="space-y-2">
        {q.data?.map((u) => (
          <li
            key={u.userId}
            className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {u.displayName} <span className="text-muted-foreground">@{u.handle}</span>
              </p>
              <p className="text-xs text-muted-foreground">{u.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{u.status}</Badge>
              {u.role === "ADMIN" && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void ownerSuspendAdmin({
                        data: { targetUserId: u.userId, suspend: u.status !== "suspended" },
                      })
                        .then(() => q.refetch())
                        .catch((err) => toast.error(errorMessage(err)))
                    }
                  >
                    {u.status === "suspended" ? "Reactivate" : "Suspend"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void ownerSetAdmin({ data: { targetUserId: u.userId, makeAdmin: false } })
                        .then(() => q.refetch())
                        .catch((err) => toast.error(errorMessage(err)))
                    }
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
