import { createFileRoute } from "@tanstack/react-router";
import { Thread } from "@/components/nexa/thread";
import { useMe } from "@/lib/nexa/use-chat";

export const Route = createFileRoute("/app/$conversationId")({ component: ConversationPage });

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const me = useMe();
  if (!me.data) {
    return <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  return <Thread conversationId={conversationId} myId={me.data.userId} />;
}
