import Link from "next/link";
import { ArrowLeft, Bot, Clock3 } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { difficultyLabels } from "@/lib/labels";
import { formatClock } from "@/lib/time";
import type { ScenarioDifficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

type PracticeHeaderProps = {
  scenarioLabel: { title: string; aiRole: string };
  difficulty: ScenarioDifficulty;
  elapsedSeconds: number;
  isRecording: boolean;
};

const difficultyStyles: Record<ScenarioDifficulty, string> = {
  Easy: "border-secondary/25 bg-secondary/10 text-secondary",
  Medium: "border-accent/30 bg-accent/15 text-amber-700",
  Hard: "border-primary/30 bg-primary/10 text-primary",
};

export function PracticeHeader({
  scenarioLabel,
  difficulty,
  elapsedSeconds,
  isRecording,
}: PracticeHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b bg-background/90 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            className="btn-ghost h-10 w-10 shrink-0 p-0"
            href="/scenarios"
            title="返回场景选择"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">返回场景选择</span>
          </Link>

          <div className="hidden items-center gap-2.5 sm:flex">
            <LogoMark className="h-9 w-9 text-primary" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold sm:text-xl">
                {scenarioLabel.title}
              </h1>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  difficultyStyles[difficulty],
                )}
              >
                {difficultyLabels[difficulty]}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              练习房间 · 结束后自动生成学习报告
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-semibold">
            <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline text-muted-foreground">
              你的对话对象：
            </span>
            {scenarioLabel.aiRole}
          </span>

          <span className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-bold tabular-nums">
            <Clock3 className="h-4 w-4 text-secondary" aria-hidden="true" />
            {formatClock(elapsedSeconds)}
          </span>

          {isRecording ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              录音中
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
