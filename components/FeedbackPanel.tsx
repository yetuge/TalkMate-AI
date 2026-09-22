import { Check, Info, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LoadingDots } from "@/components/LoadingDots";
import {
  getCorrectionFeedbackType,
  getCorrectionOriginal,
  getCorrectionRecommendation,
} from "@/lib/corrections";
import { scoreLabels } from "@/lib/labels";
import type { Correction, ScoreBreakdown } from "@/lib/types";
import { cn } from "@/lib/utils";

type FeedbackPanelProps = {
  feedback?: Correction;
  isLoading?: boolean;
};

const feedbackTone: Record<
  "CORRECTION" | "ENHANCEMENT" | "CONTEXT_VALID",
  { label: string; className: string; icon: LucideIcon }
> = {
  CORRECTION: {
    label: "已修正",
    className: "border-destructive/25 bg-destructive/10 text-destructive",
    icon: TriangleAlert,
  },
  ENHANCEMENT: {
    label: "表达更自然",
    className: "border-accent/30 bg-accent/15 text-amber-700",
    icon: Info,
  },
  CONTEXT_VALID: {
    label: "当前表达成立",
    className: "border-secondary/25 bg-secondary/10 text-secondary",
    icon: Check,
  },
};

const scoreKeys: (keyof ScoreBreakdown)[] = [
  "grammar",
  "fluency",
  "vocabulary",
  "pronunciation",
];

function PanelShell({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "loading";
}) {
  return (
    <aside
      className={cn(
        "card-surface flex h-full flex-col p-5",
        tone === "loading" && "border-primary/25",
      )}
    >
      {children}
    </aside>
  );
}

function ScoreGrid({ scores }: { scores: ScoreBreakdown }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {scoreKeys.map((key) => {
        const value = scores[key];
        const isStrong = value >= 85;

        return (
          <div className="rounded-xl border bg-muted/40 p-3" key={key}>
            <p className="text-xs text-muted-foreground">{scoreLabels[key]}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-2xl font-extrabold tabular-nums",
                  isStrong && "text-secondary",
                )}
              >
                {value}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isStrong ? "bg-secondary" : "bg-primary",
                )}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FeedbackPanel({ feedback, isLoading = false }: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <PanelShell tone="loading">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <LoadingDots />
          </span>
          <div>
            <h2 className="text-base font-bold">正在分析</h2>
            <p className="text-sm text-muted-foreground">
              检查语法、流利度、词汇与发音
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              className="space-y-2 rounded-xl border bg-muted/30 p-4"
              key={index}
            >
              <div className="h-3 w-16 animate-pulse rounded-full bg-border" />
              <div className="h-3 w-full animate-pulse rounded-full bg-border" />
              <div className="h-3 w-3/5 animate-pulse rounded-full bg-border" />
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (!feedback) {
    return (
      <PanelShell>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold">即时反馈</h2>
            <p className="text-sm text-muted-foreground">等待你的第一句回答</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-dashed bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
          发送一句英文后，这里会显示原句、推荐表达、纠错原因和四项评分。
        </div>

        <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          {["原句与推荐表达对照", "纠错原因说明", "语法 / 流利度 / 词汇 / 发音评分"].map(
            (item) => (
              <li className="flex items-center gap-2" key={item}>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                {item}
              </li>
            ),
          )}
        </ul>
      </PanelShell>
    );
  }

  const originalText = getCorrectionOriginal(feedback);
  const recommendedExpression = getCorrectionRecommendation(feedback);
  const feedbackType = getCorrectionFeedbackType(feedback.feedbackType);
  const tone = feedbackTone[feedbackType];
  const ToneIcon = tone.icon;
  const isCorrected = feedbackType === "CORRECTION";

  return (
    <PanelShell>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ToneIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold">即时反馈</h2>
            <p className="text-sm text-muted-foreground">最近一轮回答</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
            tone.className,
          )}
        >
          {tone.label}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <section className="rounded-xl border bg-background p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            原句
          </p>
          <p
            className={cn(
              "mt-2 text-sm leading-6 text-muted-foreground",
              isCorrected && "line-through decoration-destructive/40",
            )}
          >
            {originalText}
          </p>
        </section>

        <section className="rounded-xl border border-secondary/25 bg-secondary-soft/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-secondary">
            {isCorrected ? "推荐表达" : "更自然的说法"}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {recommendedExpression}
          </p>
        </section>

        <section className="rounded-xl border bg-background p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            原因
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {feedback.reason}
          </p>
        </section>
      </div>

      <div className="mt-5 border-t pt-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          本轮评分
        </p>
        <ScoreGrid scores={feedback.scores} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        反馈仅针对最近一轮回答，不影响练习流程。
      </p>
    </PanelShell>
  );
}
