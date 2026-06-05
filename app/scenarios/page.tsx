import Link from "next/link";
import { ArrowLeft, Clock3, History, Sparkles } from "lucide-react";
import { ScenarioCard } from "@/components/ScenarioCard";
import { scenarios } from "@/lib/scenarios";

export default function ScenariosPage() {
  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            TalkMate AI
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/history"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            History
          </Link>
        </nav>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Choose a speaking mission
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
              Practice English in a real situation.
            </h1>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Focused practice flow</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Each session starts with a realistic opening question, then
                  moves into short English turns and focused feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <ScenarioCard scenario={scenario} key={scenario.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
