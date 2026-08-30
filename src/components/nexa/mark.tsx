import { cn } from "@/lib/utils";

export function NexaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-foreground", className)} aria-hidden>
      <rect x="5" y="5" width="5" height="22" rx="1.6" fill="currentColor" />
      <rect x="22" y="5" width="5" height="22" rx="1.6" fill="currentColor" />
      <circle cx="16" cy="16" r="3.2" fill="currentColor" />
      <path
        d="M10 9.5L16 16L22 9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NexaWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <NexaMark className="size-7" />
      <span className="font-display text-xl font-medium tracking-tight">Nexa</span>
    </span>
  );
}
