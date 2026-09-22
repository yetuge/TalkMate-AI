import Link from "next/link";
import { CheckCircle2, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Plane,
  Presentation,
  Utensils,
} from "lucide-react";
import type { Scenario, ScenarioId } from "@/lib/types";
import { difficultyLabels, getScenarioLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

const scenarioIcons: Record<ScenarioId, LucideIcon> = {
  "job-interview": BriefcaseBusiness,
  "restaurant-ordering": Utensils,
  "business-meeting": Presentation,
  travel: Plane,
};

const difficultyStyles = {
  Easy: "border-secondary/25 bg-secondary/10 text-secondary",
  Medium: "border-accent/30 bg-accent/15 text-amber-700",
  Hard: "border-primary/30 bg-primary/10 text-primary",
};

const iconStyles: Record<ScenarioId, string> = {
  "job-interview": "bg-primary-soft text-primary",
  "restaurant-ordering": "bg-accent-soft text-accent",
  "business-meeting": "bg-secondary-soft text-secondary",
  travel: "bg-primary-soft text-primary",
};

type ScenarioCardProps = {
  scenario: Scenario;
};

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const Icon = scenarioIcons[scenario.id];
  const label = getScenarioLabel(scenario.id);

  return (
    <Link
      className="card-surface card-interactive group flex h-full min-h-[340px] flex-col p-6 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      href={`/practice?scenario=${scenario.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconStyles[scenario.id],
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold",
            difficultyStyles[scenario.difficulty],
          )}
        >
          {difficultyLabels[scenario.difficulty]}
        </span>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-extrabold">{label.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {label.description}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-primary/20 bg-primary-soft/60 p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          开场问题
        </p>
        <p className="mt-2 text-sm font-semibold leading-6">
          {scenario.openingQuestion}
        </p>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Target className="h-3.5 w-3.5" aria-hidden="true" />
          练习目标
        </p>
        <ul className="mt-3 flex flex-1 flex-col gap-2">
          {label.goals.slice(0, 3).map((goal) => (
            <li className="flex gap-2 text-sm text-muted-foreground" key={goal}>
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="mt-6 inline-flex items-center justify-between border-t pt-5 text-sm font-bold text-primary">
        进入练习房间
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft transition group-hover:translate-x-1"
          aria-hidden="true"
        >
          -&gt;
        </span>
      </span>
    </Link>
  );
}
