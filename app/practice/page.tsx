import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { PracticeRoom } from "@/components/PracticeRoom";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
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
      <div className="surface-canvas min-h-screen">
        <SiteNav />
        <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
          <section className="card-surface w-full max-w-xl p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <SearchX className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold">未找到练习场景</h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              进入练习房间前，请先选择一个有效的练习场景。
            </p>
            <Link
              className="btn-primary mt-6 h-11 px-5 text-sm"
              href="/scenarios"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              返回场景选择
            </Link>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <PracticeRoom scenario={scenario} />;
}
