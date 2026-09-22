import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  Mic,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HeroPreview } from "@/components/HeroPreview";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

const features: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    title: "场景口语练习",
    description:
      "覆盖面试、餐厅、会议和旅行四类真实场景，每个场景都有明确的开场问题和练习目标。",
    icon: MessageSquareText,
    tone: "bg-primary-soft text-primary",
  },
  {
    title: "AI 实时对话",
    description:
      "AI 分别扮演面试官、服务员、同事和旅行助手，用简短自然的英文持续推进对话。",
    icon: Bot,
    tone: "bg-secondary-soft text-secondary",
  },
  {
    title: "即时语法纠错",
    description:
      "每轮回答后给出原句、推荐表达和纠错原因，并附上语法、流利度、词汇、发音四项评分。",
    icon: CheckCircle2,
    tone: "bg-accent-soft text-accent",
  },
  {
    title: "课后练习报告",
    description:
      "结束练习后生成总分、常见问题、改进建议、练习句子和下一阶段口语任务。",
    icon: ClipboardCheck,
    tone: "bg-primary-soft text-primary",
  },
  {
    title: "学习进度追踪",
    description:
      "练习记录与报告保存到 Supabase，在历史页回顾每一次练习的表现变化。",
    icon: BarChart3,
    tone: "bg-secondary-soft text-secondary",
  },
];

const steps: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "选择场景",
    description: "挑选一个真实交流场景，查看开场问题与练习目标。",
    icon: MessageSquareText,
  },
  {
    title: "开口表达",
    description: "使用浏览器语音识别说出英文，或直接手动输入文本。",
    icon: Mic,
  },
  {
    title: "获得反馈",
    description: "查看 AI 回复与即时纠错，AI 语音会朗读标准表达。",
    icon: AudioLines,
  },
  {
    title: "复盘提升",
    description: "结束练习生成报告，在历史记录中对比每次表现。",
    icon: ClipboardCheck,
  },
];

const techStack = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "DeepSeek API",
  "SSE 流式",
  "Supabase",
  "Web Speech API",
];

export default function HomePage() {
  return (
    <div className="surface-canvas min-h-screen">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-16 pt-14 sm:pt-20">
          <div
            aria-hidden="true"
            className="surface-grid pointer-events-none absolute inset-0 -z-10 opacity-40"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="animate-rise">
              <span className="badge-pill">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                AI 英语口语陪练 · 已接入 DeepSeek
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
                在真实场景里
                <br />
                <span className="text-gradient">开口说英语</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                选择一个场景，用语音或文本回答 AI 的提问，每一轮结束都会得到原句、推荐表达和纠错原因，练完还能拿到一份完整的课后学习报告。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  className="btn-primary h-12 px-6 text-sm"
                  href="/scenarios"
                >
                  开始练习
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link className="btn-ghost h-12 px-6 text-sm" href="/history">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  查看练习历史
                </Link>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t pt-8">
                {[
                  { label: "练习场景", value: "4", unit: "类" },
                  { label: "评分维度", value: "4", unit: "项" },
                  { label: "反馈延迟", value: "<3", unit: "秒" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-3xl font-extrabold tabular-nums">
                      {stat.value}
                      <span className="ml-1 text-base font-bold text-muted-foreground">
                        {stat.unit}
                      </span>
                    </dd>
                    <dt className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="animate-rise animation-delay-200">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* Core loop */}
        <section className="border-y bg-card/50 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              description="从场景选择到课后报告，四个步骤串起一条可复现的口语练习闭环。"
              eyebrow="练习流程"
              title="完整的口语练习闭环"
            />

            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <li
                    className="card-surface card-interactive relative p-5"
                    key={step.title}
                  >
                    <span className="absolute right-5 top-4 text-4xl font-extrabold tabular-nums text-muted-foreground/15">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              description="不只是聊天机器人：对话、纠错、报告、历史记录都会被保存下来。"
              eyebrow="核心能力"
              title="为口语练习而生的功能设计"
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    className="card-surface card-interactive p-6"
                    key={feature.title}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.tone}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </article>
                );
              })}

              <article className="card-surface flex flex-col justify-between gap-5 bg-gradient-to-br from-primary to-[hsl(258_82%_62%)] p-6 text-primary-foreground">
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                    <Zap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">
                    现在就试一句英文
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-primary-foreground/85">
                    不需要注册和配置，选择一个场景就能立刻开始第一轮对话。
                  </p>
                </div>
                <Link
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white/95 px-5 text-sm font-bold text-primary transition hover:bg-white"
                  href="/scenarios"
                >
                  开始练习
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-t px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="card-surface overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="p-8">
                  <span className="badge-pill">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    技术实现
                  </span>
                  <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                    流式对话 + 即时纠错并行
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    练习页发送回答后，AI 回复通过 SSE
                    逐步输出到同一条消息气泡，同时即时纠错接口并行生成反馈结果。前端使用双缓冲按固定间隔批量刷新
                    token，避免高频重渲染，让输出节奏更平滑。
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                      <span
                        className="rounded-lg border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                        key={tech}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t bg-muted/40 p-8 lg:border-l lg:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    一次发送的处理链路
                  </p>
                  <ol className="mt-4 space-y-3">
                    {[
                      "用户语音识别或手动输入英文回答",
                      "POST /api/chat/stream 建立 SSE 长连接",
                      "POST /api/correction 并行生成即时反馈",
                      "token 分片渲染到 AI 消息气泡",
                      "结果写入 Supabase，结束练习生成报告",
                    ].map((item, index) => (
                      <li className="flex gap-3 text-sm" key={item}>
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="leading-6 text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="text-sm font-bold uppercase tracking-wide text-secondary">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      <p className="mt-4 leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
