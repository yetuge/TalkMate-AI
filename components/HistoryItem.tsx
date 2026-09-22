import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import type { ScenarioId, ScoreBreakdown } from "@/lib/types";
import { difficultyLabels, getScenarioLabel, scoreLabels } from "@/lib/labels";
import { scenarioMap } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

export type HistorySessionSummary = {
  id: string;
  scenario: ScenarioId;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  overallScore?: number | null;
  scores?: Partial<ScoreBreakdown>;
  createdAt?: string;
};

type HistoryItemProps = {
  session: HistorySessionSummary;
};

const scoreKeys: (keyof ScoreBreakdown)[] = [
  "grammar",
  "fluency",
  "vocabulary",
  "pronunciation",
];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}分 ${restSeconds}秒`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function scoreTone(score: number) {
  if (score >= 85) {
    return "text-secondary";
  }

  if (score >= 70) {
    return "text-primary";
  }

  return "text-amber-600";
}

export function HistoryItem({ session }: HistoryItemProps) {
  const scenario = scenarioMap[session.scenario];
  const scenarioLabel = getScenarioLabel(session.scenario);
  const overallScore = session.overallScore ?? null;

  return (
    <article className="card-surface card-interactive p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              {difficultyLabels[scenario?.difficulty ?? "Medium"]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(session.endedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDuration(session.durationSeconds)}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-extrabold">{scenarioLabel.title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {scenarioLabel.description}
          </p>

          {session.scores ? (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {scoreKeys.map((key) => {
                const value = session.scores?.[key];

                return (
                  <span className="text-xs" key={key}>
                    <span className="text-muted-foreground">
                      {scoreLabels[key]}{" "}
                    </span>
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        typeof value === "number"
                          ? scoreTone(value)
                          : "text-muted-foreground",
                      )}
                    >
                      {typeof value === "number" ? value : "--"}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary-soft px-5 py-3 text-center">
            <p className="text-xs font-semibold text-primary/80">总分</p>
            <p className="mt-0.5 text-3xl font-extrabold tabular-nums text-primary">
              {overallScore ?? "--"}
            </p>
          </div>
          <Link
            className="btn-ghost h-11 px-4 text-sm"
            href={`/report/${session.id}`}
          >
            查看报告
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
