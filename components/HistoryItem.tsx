import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import type { ScenarioId, ScoreBreakdown } from "@/lib/types";
import { scenarioMap } from "@/lib/scenarios";

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

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}m ${restSeconds}s`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HistoryItem({ session }: HistoryItemProps) {
  const scenario = scenarioMap[session.scenario];

  return (
    <article className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-secondary">
            {scenario?.difficulty ?? "Practice"}
          </p>
          <h2 className="mt-2 text-xl font-black">
            {scenario?.title ?? session.scenario}
          </h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{formatDate(session.endedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {formatDuration(session.durationSeconds)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
            <p className="text-xs font-semibold opacity-80">Score</p>
            <p className="mt-1 text-2xl font-black">
              {session.overallScore ?? "--"}
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-bold text-foreground transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href={`/report/${session.id}`}
          >
            Report
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
