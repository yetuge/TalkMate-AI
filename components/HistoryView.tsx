"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Plus } from "lucide-react";
import {
  HistoryItem,
  type HistorySessionSummary,
} from "@/components/HistoryItem";
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
        setNotice(
          "历史记录接口暂时不可用，TalkMate 正在展示浏览器本地报告。",
        );
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

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <section className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            TalkMate AI
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/scenarios"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新练习
          </Link>
        </nav>

        <header className="mt-10 rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-secondary">
            练习历史
          </p>
          <h1 className="mt-3 text-4xl font-black">回顾你的口语练习</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            打开过往报告、比较练习得分，并在准备好后继续下一个场景。
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            数据来源：{provider === "supabase" ? "Supabase" : "浏览器本地存储"}
          </p>
        </header>

        <div className="mt-5 space-y-4">
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
            <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <ClipboardList className="h-10 w-10 text-primary" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-black">暂无练习历史</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                完成一次练习后，系统会生成报告并显示在这里。
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                href="/scenarios"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                开始练习
              </Link>
            </section>
          ) : null}

          {sessions.map((session) => (
            <HistoryItem session={session} key={session.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
