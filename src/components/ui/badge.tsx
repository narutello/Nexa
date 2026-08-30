import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "ok" | "warn" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "neutral" && "bg-secondary text-muted-foreground",
        tone === "ok" && "bg-online/15 text-online",
        tone === "warn" && "bg-warn/15 text-warn",
        tone === "danger" && "bg-destructive/15 text-destructive",
        className,
      )}
      {...props}
    />
  );
}
