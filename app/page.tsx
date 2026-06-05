import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  Mic,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Scenario Speaking Practice",
    description: "Practice interviews, restaurants, meetings, and travel.",
    icon: MessageSquareText,
  },
  {
    title: "AI Real-Time Conversation",
    description: "Get short English replies that keep the dialogue moving.",
    icon: Bot,
  },
  {
    title: "Grammar Correction",
    description: "See corrected sentences and more natural expressions.",
    icon: CheckCircle2,
  },
  {
    title: "Session Summary",
    description: "Review scores, mistakes, suggestions, and practice tasks.",
    icon: ClipboardCheck,
  },
  {
    title: "Growth Tracking",
    description: "Keep practice history and track progress over time.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b bg-background px-6">
        <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Web AI English speaking coach
            </div>
            <h1 className="mt-6 text-5xl font-black leading-none sm:text-7xl">
              TalkMate AI
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold text-foreground sm:text-2xl">
              Practice Real English Conversations with AI
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Pick a real-life scenario, speak or type your answer, receive an
              English reply, and review instant corrections after each turn.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                href="/scenarios"
              >
                Start Practice
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-lg border bg-card px-6 text-sm font-bold text-card-foreground shadow-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                href="/history"
              >
                View History
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-sm font-bold">Job Interview</p>
                  <p className="text-xs text-muted-foreground">
                    AI interviewer is listening
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-secondary">
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                  Recording
                </div>
              </div>

              <div className="grid gap-4 pt-4 md:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  <div className="max-w-[82%] rounded-lg bg-muted p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                      AI
                    </p>
                    <p className="mt-2 text-sm">
                      Tell me about yourself and one project you are proud of.
                    </p>
                  </div>
                  <div className="ml-auto max-w-[82%] rounded-lg bg-primary p-4 text-primary-foreground">
                    <p className="text-xs font-semibold opacity-80">You</p>
                    <p className="mt-2 text-sm">
                      I built a booking system and improved the page loading
                      speed.
                    </p>
                  </div>
                  <div className="max-w-[82%] rounded-lg bg-muted p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                      AI
                    </p>
                    <p className="mt-2 text-sm">
                      Great. What challenge did you solve during that project?
                    </p>
                  </div>
                </div>

                <aside className="rounded-lg border bg-background p-4">
                  <p className="text-sm font-bold">Instant Feedback</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Better expression
                      </p>
                      <p className="mt-1">
                        I improved the loading speed of the booking system.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["Grammar", "86"],
                        ["Fluency", "82"],
                        ["Vocabulary", "78"],
                        ["Pronunciation", "80"],
                      ].map(([label, score]) => (
                        <div className="rounded-lg bg-muted p-3" key={label}>
                          <p className="text-xs text-muted-foreground">
                            {label}
                          </p>
                          <p className="mt-1 text-xl font-black">{score}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {features.slice(0, 3).map((feature) => {
                const Icon = feature.icon;
                return (
                  <div className="rounded-lg border bg-card p-4 shadow-sm" key={feature.title}>
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h2 className="mt-3 text-base font-bold">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  className="rounded-lg border bg-card p-4 shadow-sm"
                  key={feature.title}
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-3 text-base font-bold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
