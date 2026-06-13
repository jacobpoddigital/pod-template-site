import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// AI transparency notice (EU AI Act Art. 50, in force 2 Aug 2026; research/2026-06-13-
// build-gap-analysis §9). When a user interacts with an AI system (a live chatbot/voice
// agent) it must be self-evident they're talking to AI. Drop this in the chat UI's header
// or first message. For AI-GENERATED IMAGERY, label it in the caption/credit instead (no
// component needed) — see docs/ai-disclosure.md. Tokens + type scale only.
//
// NOTE: a scripted/demo "chat" animation (not a live AI the visitor converses with) is not
// an Art. 50 "interaction" — use this on REAL conversational AI.
export function AiDisclosure({
  children = "You're chatting with an AI assistant.",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <p role="note" className={cn("inline-flex items-center gap-1.5 body-sm text-ink-muted", className)}>
      <Sparkles aria-hidden className="size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
