import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminListUsers } from "@/lib/nexa/api";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const [query, setQuery] = useState("");
  const q = useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => adminListUsers({ data: { query } }),
  });

  return (
    <div className="px-4 py-6 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account and moderation status only. Message history is not listed here.
        </p>
      </header>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search handle or name"
        className="mb-4 max-w-sm"
      />
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading users…</p>}
      <ul className="space-y-2">
        {q.data?.map((u) => (
          <li key={u.userId}>
            <Link
              to="/admin/user/$userId"
              params={{ userId: u.userId }}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 hover:bg-accent"
            >
              <div>
                <p className="font-medium">
                  {u.displayName} <span className="text-muted-foreground">@{u.handle}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {u.role} · {u.reportCount} reports
                </p>
              </div>
              <Badge
                tone={
                  u.status === "banned" ? "danger" : u.status === "suspended" ? "warn" : "neutral"
                }
              >
                {u.status}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
