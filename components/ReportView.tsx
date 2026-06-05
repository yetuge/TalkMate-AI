"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import type { Correction, PracticeReport, ScenarioId } from "@/lib/types";

type LocalReportSession = {
  id: string;
  scenario: ScenarioId;
  scenarioTitle: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  corrections: Correction[];
  report: PracticeReport;
};

type ReportViewProps = {
  sessionId: string;
};

const scoreLabels = {
  grammar: "Grammar",
  fluency: "Fluency",
  vocabulary: "Vocabulary",
  pronunciation: "Pronunciation",
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}m ${restSeconds}s`;
}

export function ReportView({ sessionId }: ReportViewProps) {
  const [session, setSession] = useState<LocalReportSession | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(`talkmate-report-${sessionId}`);

    if (!stored) {
      return;
    }

    try {
      setSession(JSON.parse(stored) as LocalReportSession);
    } catch {
      setSession(null);
    }
  }, [sessionId]);

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-10">
        <section className="w-full max-w-xl rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <ClipboardList className="h-10 w-10 text-primary" aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-black">Report not found</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            This local report is not available in the browser. Complete a
            practice session to generate a new report.
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

  const { report } = session;

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <nav>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/scenarios"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            New practice
          </Link>
        </nav>

        <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm font-bold uppercase text-secondary">
              Session Report
            </p>
            <h1 className="mt-3 text-3xl font-black">{session.scenarioTitle}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Duration: {formatDuration(session.durationSeconds)}
            </p>
            <div className="mt-6 rounded-lg bg-primary p-5 text-primary-foreground">
              <p className="text-sm font-semibold opacity-80">Overall Score</p>
              <p className="mt-2 text-5xl font-black">{report.overallScore}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {Object.entries(report.scores).map(([key, value]) => (
                <div className="rounded-lg bg-muted p-3" key={key}>
                  <p className="text-xs text-muted-foreground">
                    {scoreLabels[key as keyof typeof scoreLabels]}
                  </p>
                  <p className="mt-1 text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Summary</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {report.summary}
              </p>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <ReportList title="Common Mistakes" items={report.commonMistakes} />
              <ReportList title="Suggestions" items={report.suggestions} />
              <ReportList
                title="Practice Sentences"
                items={report.practiceSentences}
              />
              <ReportList title="Speaking Tasks" items={report.speakingTasks} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-black">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="flex gap-3 text-sm leading-6 text-muted-foreground" key={item}>
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
