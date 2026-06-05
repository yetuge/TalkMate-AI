import Link from "next/link";
import { getScenarioById } from "@/lib/scenarios";

type PracticePageProps = {
  searchParams: Promise<{
    scenario?: string;
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const { scenario: scenarioId } = await searchParams;
  const scenario = getScenarioById(scenarioId);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-3xl rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-sm font-semibold uppercase text-secondary">
          Step 2
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Practice Route Ready
        </h1>
        {scenario ? (
          <div className="mt-5 space-y-3">
            <p className="text-muted-foreground">
              Selected scenario:{" "}
              <span className="font-medium text-foreground">
                {scenario.title}
              </span>
            </p>
            <p className="rounded-lg bg-muted p-4 text-sm">
              AI opening question: {scenario.openingQuestion}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-muted-foreground">
              No valid scenario was provided. Choose a scenario before starting
              practice.
            </p>
            <Link className="text-sm font-semibold text-primary" href="/scenarios">
              Back to scenarios
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
