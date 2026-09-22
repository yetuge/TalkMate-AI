"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  Clock3,
  Database,
  HardDrive,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  HistoryItem,
  type HistorySessionSummary,
} from "@/components/HistoryItem";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { StatusNotice } from "@/components/StatusNotice";
import type { PracticeReport, ScenarioId } from "@/lib/types";

type SessionsApiResponse = {
  sessions?: HistorySessionSummary[];
  provider?: "supabase" | "localStorage";
  error?: string;
};

type LocalReportSession = {
  id: string;
  scenario: ScenarioId;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  report: PracticeReport;
};

function readLocalSessions() {
  const sessions: HistorySessionSummary[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key?.startsWith("talkmate-report-")) {
      continue;
    }

    const stored = window.localStorage.getItem(key);

    if (!stored) {
      continue;
    }

    try {
      const session = JSON.parse(stored) as LocalReportSession;

      sessions.push({
        id: session.id,
        scenario: session.scenario,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationSeconds: session.durationSeconds,
        overallScore: session.report.overallScore,
        scores: session.report.scores,
      });
    } catch {
      continue;
    }
  }

  return sessions.sort(
    (first, second) =>
      new Date(second.endedAt).getTime() - new Date(first.endedAt).getTime(),
  );
}

export function HistoryView() {
  const [remoteSessions, setRemoteSessions] = useState<HistorySessionSummary[]>([]);
  const [localSessions, setLocalSessions] = useState<HistorySessionSummary[]>([]);
  const [provider, setProvider] = useState<"supabase" | "localStorage">(
    "localStorage",
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        const response = await fetch("/api/sessions");
        const data = (await response.json()) as SessionsApiResponse;

        if (!isMounted) {
          return;
        }

        setProvider(data.provider ?? "localStorage");
        setRemoteSessions(data.sessions ?? []);
        setLocalSessions(readLocalSessions());
        setNotice(
          data.provider === "localStorage"
            ? "Supabase 未配置，当前展示浏览器本地保存的报告。"
            : null,
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setProvider("localStorage");
        setLocalSessions(readLocalSessions());
        setNotice("历史记录接口暂时不可用，TalkMate 正在展示浏览器本地报告。");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const sessions = useMemo(() => {
    if (remoteSessions.length > 0) {
      return remoteSessions;
    }

    return localSessions;
  }, [localSessions, remoteSessions]);

  const stats = useMemo(() => {
    const scored = sessions.filter(
      (session) => typeof session.overallScore === "number",
    );
    const totalSeconds = sessions.reduce(
      (sum, session) => sum + session.durationSeconds,
      0,
    );
    const average =
      scored.length > 0
        ? Math.round(
            scored.reduce(
              (sum, session) => sum + (session.overallScore ?? 0),
              0,
            ) / scored.length,
          )
        : null;

    return {
      count: sessions.length,
      average,
      minutes: Math.round(totalSeconds / 60),
    };
  }, [sessions]);

  return (
    <div className="surface-canvas min-h-screen">
      <SiteNav />

      <main className="px-6 py-12">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="animate-rise">
              <span className="badge-pill">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                练习历史
              </span>
              <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">
                回顾你的
                <span className="text-gradient">口语练习</span>
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                打开过往报告、比较每个场景的得分，并在准备好后继续下一个场景。
              </p>
            </div>

            <Link
              className="btn-primary animate-rise animation-delay-200 h-11 px-5 text-sm"
              href="/scenarios"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              新的练习
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={BarChart3}
              label="累计练习"
              unit="次"
              value={stats.count}
            />
            <StatCard
              icon={Sparkles}
              label="平均总分"
              value={stats.average ?? "--"}
            />
            <StatCard
              icon={Clock3}
              label="累计时长"
              unit="分钟"
              value={stats.minutes}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {provider === "supabase" ? (
                <Database className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              ) : (
                <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              数据来源：{provider === "supabase" ? "Supabase" : "浏览器本地存储"}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <StatusNotice title="正在加载练习历史" tone="loading" />
            ) : null}

            {!isLoading && notice ? (
              <StatusNotice
                title="本地备用记录已启用"
                description={notice}
                tone="info"
              />
            ) : null}

            {!isLoading && sessions.length === 0 ? (
              <section className="card-surface p-10 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <ClipboardList className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl font-extrabold">暂无练习历史</h2>
                <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
                  完成一次练习后，系统会生成课后报告并显示在这里，方便你对比每次的表现。
                </p>
                <Link
                  className="btn-primary mt-6 h-11 px-5 text-sm"
                  href="/scenarios"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  开始第一次练习
                </Link>
              </section>
            ) : null}

            {sessions.map((session) => (
              <HistoryItem session={session} key={session.id} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold tabular-nums">
          {value}
          {unit ? (
            <span className="ml-1 text-sm font-bold text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
