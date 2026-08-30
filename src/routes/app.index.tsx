import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({ component: AppIndex });

function AppIndex() {
  return (
    <div className="hidden h-full place-items-center md:grid">
      <div className="max-w-sm px-6 text-center">
        <p className="font-display text-2xl font-medium tracking-tight">Select a conversation</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your messages stay between the people in the thread. Search to start a new one.
        </p>
      </div>
    </div>
  );
}
