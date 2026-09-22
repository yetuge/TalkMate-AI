import { Bot, UserRound, Volume2 } from "lucide-react";
import { LoadingDots } from "@/components/LoadingDots";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: ChatMessageType;
  isSpeaking?: boolean;
};

export function ChatMessage({ message, isSpeaking }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "flex animate-fade-in gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          isUser
            ? "bg-gradient-to-br from-primary to-[hsl(258_82%_62%)] text-primary-foreground"
            : "bg-primary-soft text-primary",
        )}
      >
        {isUser ? (
          <UserRound className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bot className="h-4 w-4" aria-hidden="true" />
        )}
      </span>

      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 shadow-xs",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border bg-card text-card-foreground",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-bold",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          <span
            className={cn(
              isUser ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {isUser ? "你" : "TalkMate AI"}
          </span>
          {!isUser && isSpeaking ? (
            <span className="inline-flex items-center gap-1 text-secondary">
              <Volume2 className="h-3 w-3" aria-hidden="true" />
              朗读中
            </span>
          ) : null}
        </div>

        {message.content ? (
          <p className="mt-1.5 text-sm leading-7">{message.content}</p>
        ) : (
          <p
            className={cn(
              "mt-1.5 inline-flex h-6 items-center text-sm",
              !isUser && "text-muted-foreground",
            )}
          >
            <LoadingDots />
          </p>
        )}

        <time
          className={cn(
            "mt-2 block text-[11px] tabular-nums",
            isUser
              ? "text-right text-primary-foreground/70"
              : "text-muted-foreground",
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
