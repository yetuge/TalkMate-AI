import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { PracticeRoom } from "@/components/PracticeRoom";
import { getScenarioById } from "@/lib/scenarios";

type PracticePageProps = {
  searchParams: Promise<{
    scenario?: string;
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const { scenario: scenarioId } = await searchParams;
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-10">
        <section className="w-full max-w-xl rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-black">Scenario not found</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Choose a valid practice scenario before entering the speaking room.
          </p>
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/scenarios"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to scenarios
          </Link>
        </section>
      </main>
    );
  }

  return <PracticeRoom scenario={scenario} />;
}
