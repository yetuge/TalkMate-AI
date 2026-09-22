import { Clock3, History, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { ScenarioCard } from "@/components/ScenarioCard";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { scenarios } from "@/lib/scenarios";

export default function ScenariosPage() {
  return (
    <div className="surface-canvas min-h-screen">
      <SiteNav />

      <main className="px-6 py-12">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end">
            <div className="animate-rise">
              <span className="badge-pill">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                选择练习场景
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
                在真实场景中
                <br />
                <span className="text-gradient">练一口自然的英语</span>
              </h1>
              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                每个场景都有明确的 AI 角色、开场问题和练习目标。选一个最接近你实际需求的情境，立刻开始第一轮对话。
              </p>
            </div>

            <div className="card-surface animate-rise animation-delay-200 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
                  <ListChecks className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-bold">专注练习流程</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    从一个真实开场问题开始，随后进入简短英文对话，并获得针对性的即时反馈。
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-5">
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">可选场景</p>
                  <p className="mt-1 text-2xl font-extrabold tabular-nums">
                    {scenarios.length}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    建议时长
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tabular-nums">
                    5-10
                    <span className="ml-0.5 text-sm font-bold text-muted-foreground">
                      分
                    </span>
                  </p>
                </div>
              </div>

              <Link
                className="btn-ghost mt-4 h-11 w-full text-sm"
                href="/history"
              >
                <History className="h-4 w-4" aria-hidden="true" />
                查看历史练习记录
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard scenario={scenario} key={scenario.id} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
