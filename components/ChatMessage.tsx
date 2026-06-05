import { Bot, UserRound } from "lucide-react";
import { LoadingDots } from "@/components/LoadingDots";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse text-right" : "text-left",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-background text-primary",
        )}
      >
        {isUser ? (
          <UserRound className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bot className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[82%] rounded-lg px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-card-foreground",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold",
            isUser ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {isUser ? "你" : "TalkMate AI"}
        </p>
        {message.content ? (
          <p className="mt-1 text-sm leading-6">{message.content}</p>
        ) : (
          <p className="mt-1 inline-flex h-6 items-center text-sm leading-6 text-muted-foreground">
            <LoadingDots />
          </p>
        )}
        <time
          className={cn(
            "mt-2 block text-xs",
            isUser ? "text-primary-foreground/65" : "text-muted-foreground",
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </article>
  );
}
