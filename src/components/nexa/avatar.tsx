import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  hue,
  size = "md",
  className,
}: {
  name: string;
  hue: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-medium text-background",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-12 text-base",
        className,
      )}
      style={{ background: `hsl(${hue} 18% 62%)` }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function PresenceDot({
  online,
  className,
}: {
  online: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-card",
        online ? "bg-online" : "bg-muted-foreground/50",
        className,
      )}
    />
  );
}
