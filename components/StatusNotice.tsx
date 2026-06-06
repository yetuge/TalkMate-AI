import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusNoticeTone = "info" | "success" | "warning" | "error" | "loading";

type StatusNoticeProps = {
  title: string;
  description?: string;
  tone?: StatusNoticeTone;
  className?: string;
  onDismiss?: () => void;
};

const toneStyles: Record<
  StatusNoticeTone,
  {
    icon: LucideIcon;
    className: string;
    iconClassName: string;
  }
> = {
  info: {
    icon: Info,
    className: "border-primary/20 bg-primary/10 text-primary",
    iconClassName: "text-primary",
  },
  success: {
    icon: CheckCircle2,
    className: "border-secondary/20 bg-secondary/10 text-secondary",
    iconClassName: "text-secondary",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-accent/30 bg-accent/15 text-amber-700",
    iconClassName: "text-amber-700",
  },
  error: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    iconClassName: "text-destructive",
  },
  loading: {
    icon: Loader2,
    className: "border-border bg-card text-muted-foreground",
    iconClassName: "animate-spin text-primary",
  },
};

export function StatusNotice({
  title,
  description,
  tone = "info",
  className,
  onDismiss,
}: StatusNoticeProps) {
  const styles = toneStyles[tone];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm shadow-sm",
        styles.className,
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", styles.iconClassName)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        {description ? (
          <p className="mt-1 leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          aria-label="关闭提示"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-current transition hover:bg-background/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={onDismiss}
          title="关闭提示"
          type="button"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
