"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Lightbulb,
  MessageSquareQuote,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { StatusNotice } from "@/components/StatusNotice";
import { getCorrectionFeedbackType } from "@/lib/corrections";
import { getScenarioLabel, scoreLabels } from "@/lib/labels";
import { formatClock } from "@/lib/time";
import type { Correction, PracticeReport, ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";

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

type SessionApiResponse = {
  session?: Omit<LocalReportSession, "scenarioTitle"> | null;
  provider?: "supabase" | "localStorage";
  error?: string;
};

type ReportViewProps = {
  sessionId: string;
};

const scoreKeys: (keyof PracticeReport["scores"])[] = [
  "grammar",
  "fluency",
  "vocabulary",
  "pronunciation",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
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

export function ReportView({ sessionId }: ReportViewProps) {
  const [session, setSession] = useState<LocalReportSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      const stored = window.localStorage.getItem(`talkmate-report-${sessionId}`);

      if (stored) {
        try {
          const parsedSession = JSON.parse(stored) as LocalReportSession;

          setSession({
            ...parsedSession,
            scenarioTitle: getScenarioLabel(parsedSession.scenario).title,
          });
          setIsLoading(false);
          return;
        } catch {
          setSession(null);
        }
      }

      try {
        const response = await fetch(`/api/sessions?id=${sessionId}`);
        const data = (await response.json()) as SessionApiResponse;

        if (!isMounted || !data.session) {
          return;
        }

        setSession({
          ...data.session,
          scenarioTitle: getScenarioLabel(data.session.scenario).title,
        });
      } catch {
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <div className="surface-canvas min-h-screen">
      <SiteNav />

      <main className="px-6 py-12">
        {isLoading ? (
          <div className="mx-auto max-w-2xl">
            <StatusNotice
              title="正在加载报告"
              description="正在从浏览器本地存储和 Supabase 查找这份报告。"
              tone="loading"
            />
          </div>
        ) : null}

        {!isLoading && !session ? (
          <section className="card-surface mx-auto max-w-xl p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ClipboardList className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold">未找到报告</h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              当前报告不在浏览器本地存储或 Supabase
              中。请完成一次新的练习来生成报告。
            </p>
            <Link className="btn-primary mt-6 h-11 px-5 text-sm" href="/scenarios">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              返回场景选择
            </Link>
          </section>
        ) : null}

        {!isLoading && session ? (
          <section className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="animate-rise">
                <span className="badge-pill">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  练习报告
                </span>
                <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">
                  {session.scenarioTitle}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  练习于 {formatDateTime(session.endedAt)} · 用时{" "}
                  {formatClock(session.durationSeconds)}
                </p>
              </div>

              <Link className="btn-ghost h-11 px-5 text-sm" href="/scenarios">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                再练一次
              </Link>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="animate-rise card-surface h-fit overflow-hidden p-6">
                <div className="rounded-2xl bg-gradient-to-br from-primary to-[hsl(258_82%_62%)] p-6 text-primary-foreground">
                  <p className="text-sm font-semibold text-primary-foreground/80">
                    本次总分
                  </p>
                  <p className="mt-1 text-6xl font-extrabold tabular-nums leading-none">
                    {session.report.overallScore}
                  </p>
                  <p className="mt-3 text-xs text-primary-foreground/75">
                    由语法、流利度、词汇和发音四项综合得出
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  {scoreKeys.map((key) => {
                    const value = session.report.scores[key];

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {scoreLabels[key]}
                          </span>
                          <span
                            className={cn(
                              "font-bold tabular-nums",
                              scoreTone(value),
                            )}
                          >
                            {value}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              value >= 85 ? "bg-secondary" : "bg-primary",
                            )}
                            style={{
                              width: `${Math.min(100, Math.max(0, value))}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="space-y-5">
                <section className="card-surface animate-rise p-6">
                  <h2 className="flex items-center gap-2 text-lg font-extrabold">
                    <BookOpen
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    整体总结
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {session.report.summary}
                  </p>
                </section>

                <div className="grid items-start gap-5 md:grid-cols-2">
                  <ReportList
                    icon={AlertTriangle}
                    items={session.report.commonMistakes}
                    title="常见问题"
                    tone="text-amber-600"
                  />
                  <ReportList
                    icon={Lightbulb}
                    items={session.report.suggestions}
                    title="改进建议"
                    tone="text-primary"
                  />
                  <ReportList
                    icon={MessageSquareQuote}
                    items={session.report.practiceSentences}
                    title="练习句子"
                    tone="text-secondary"
                  />
                  <ReportList
                    icon={Target}
                    items={session.report.speakingTasks}
                    title="口语任务"
                    tone="text-primary"
                  />
                </div>

                {session.corrections.length > 0 ? (
                  <section className="card-surface p-6">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold">
                      <Mic className="h-5 w-5 text-primary" aria-hidden="true" />
                      本轮纠错回顾
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {session.corrections.length} 条
                      </span>
                    </h2>

                    <ul className="mt-5 space-y-4">
                      {session.corrections.map((correction, index) => {
                        const isCorrected =
                          getCorrectionFeedbackType(correction.feedbackType) ===
                          "CORRECTION";

                        return (
                          <li
                            className="rounded-xl border bg-background p-4"
                            key={`${correction.originalText}-${index}`}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              第 {index + 1} 轮
                            </p>
                            <p
                              className={cn(
                                "mt-2 text-sm leading-6 text-muted-foreground",
                                isCorrected &&
                                  "line-through decoration-destructive/40",
                              )}
                            >
                              {correction.originalText}
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-secondary">
                              {correction.recommendedExpression}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {correction.reason}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}

function ReportList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <section className="card-surface p-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold">
        <Icon className={cn("h-4 w-4", tone)} aria-hidden="true" />
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
            key={item}
          >
            <span
              className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", tone)}
              style={{ backgroundColor: "currentColor" }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
