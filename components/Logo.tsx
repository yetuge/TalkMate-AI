import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
};

/** Speech bubble + sound wave mark. Uses currentColor so it inherits context. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
      fill="none"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="currentColor"
        height="40"
        rx="12"
        width="40"
      />
      <path
        d="M12.5 15.5h15M12.5 20.5h10.5"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="M20.5 26.5v3.2l4.2-3.2"
        fill="white"
      />
      <circle cx="27.5" cy="25.5" fill="white" r="1.1" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
};

export function Logo({ className, markClassName, showTagline }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className={cn("text-primary", markClassName)} />
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight">
          TalkMate AI
        </span>
        {showTagline ? (
          <span className="block text-xs font-medium text-muted-foreground">
            AI 英语口语陪练
          </span>
        ) : null}
      </span>
    </span>
  );
}
