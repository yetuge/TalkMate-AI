import { Lightbulb, Sparkles } from "lucide-react";
import { LoadingDots } from "@/components/LoadingDots";
import { scoreLabels } from "@/lib/labels";
import type { Correction } from "@/lib/types";

type FeedbackPanelProps = {
  feedback?: Correction;
  isLoading?: boolean;
};

function getRecommendedExpression(feedback: Correction) {
  return feedback.betterExpression.trim() || feedback.corrected;
}

export function FeedbackPanel({ feedback, isLoading = false }: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <aside className="flex h-full flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">分析中</h2>
            <p className="text-sm text-muted-foreground">
              正在检查语法、流利度、词汇和发音表现
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          即时反馈正在生成中 <LoadingDots className="ml-1" />
        </div>
      </aside>
    );
  }

  if (!feedback) {
    return (
      <aside className="flex h-full flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">即时反馈</h2>
            <p className="text-sm text-muted-foreground">
              发送一句英文后，这里会显示纠错结果。
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          反馈将包含原句、推荐表达、原因和评分明细。
        </div>
      </aside>
    );
  }

  const recommendedExpression = getRecommendedExpression(feedback);

  return (
    <aside className="flex h-full flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold">即时反馈</h2>
          <p className="text-sm text-muted-foreground">最近一轮回答</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <section className="rounded-lg border bg-background p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            原句
          </p>
          <p className="mt-2 text-sm leading-6">{feedback.original}</p>
        </section>

        <section className="rounded-lg border bg-secondary/10 p-4">
          <p className="text-xs font-bold uppercase text-secondary">
            推荐表达
          </p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {recommendedExpression}
          </p>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            原因
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {feedback.reason}
          </p>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {Object.entries(feedback.scores).map(([key, value]) => (
          <div className="rounded-lg bg-muted p-3" key={key}>
            <p className="text-xs text-muted-foreground">
              {scoreLabels[key as keyof typeof scoreLabels]}
            </p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
