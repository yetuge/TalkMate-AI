import Link from "next/link";
import { scenarios } from "@/lib/scenarios";

export default function ScenariosPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Step 2
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Scenario Routes Ready
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            The scenario data source is connected. Full scenario cards will be
            built in Step 3.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {scenarios.map((scenario) => (
            <Link
              className="rounded-lg border bg-card p-5 text-card-foreground transition hover:border-primary"
              href={`/practice?scenario=${scenario.id}`}
              key={scenario.id}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{scenario.title}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {scenario.difficulty}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {scenario.description}
              </p>
              <p className="mt-4 text-sm font-medium">
                Opening: {scenario.openingQuestion}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
