import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Plane,
  Presentation,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

type ScenarioCardProps = {
  scenario: Scenario;
};

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const Icon = scenarioIcons[scenario.id];
  const label = getScenarioLabel(scenario.id);

  return (
    <Link
      className="group flex h-full min-h-[320px] flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      href={`/practice?scenario=${scenario.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
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
        <h2 className="text-2xl font-bold">{label.title}</h2>
        <p className="mt-3 min-h-[72px] text-sm leading-6 text-muted-foreground">
          {label.description}
        </p>
      </div>

      <div className="mt-5 rounded-lg border bg-muted/50 p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          开场问题
        </p>
        <p className="mt-2 text-sm font-medium">{scenario.openingQuestion}</p>
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-2">
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

      <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
        开始练习
        <span className="ml-2 transition group-hover:translate-x-1" aria-hidden="true">
          -&gt;
        </span>
      </span>
    </Link>
  );
}
