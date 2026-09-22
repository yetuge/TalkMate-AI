import { Bot, Mic, Sparkles, UserRound, Volume2 } from "lucide-react";

const chat: {
  role: "ai" | "user";
  text: string;
  time: string;
}[] = [
  {
    role: "ai",
    text: "Tell me about a project you are proud of.",
    time: "10:02",
  },
  {
    role: "user",
    text: "I build a booking system last year and I improved the page loading speed.",
    time: "10:03",
  },
  {
    role: "ai",
    text: "Nice. What was the hardest part of that project?",
    time: "10:03",
  },
];

const scores = [
  { label: "语法", value: 88 },
  { label: "流利度", value: 84 },
  { label: "词汇", value: 80 },
  { label: "发音", value: 82 },
];

const waveBars = [10, 18, 26, 16, 30, 22, 12, 24, 18, 28, 14, 20];

/** Static product preview used on the landing hero. */
export function HeroPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 blur-2xl"
      />

      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">求职面试</p>
              <p className="text-xs text-muted-foreground">AI 面试官正在倾听</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
            </span>
            录音中
          </span>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_224px]">
          <div className="space-y-3">
            {chat.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  className={`flex gap-2.5 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                  key={message.text}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "border bg-background text-primary"
                    }`}
                  >
                    {isUser ? (
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-6 shadow-xs ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "border bg-card text-card-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-2.5 rounded-xl border border-secondary/25 bg-secondary/5 px-3.5 py-2.5">
              <Volume2
                className="h-4 w-4 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <span className="flex h-5 items-end gap-0.5">
                {waveBars.map((height, index) => (
                  <span
                    className="w-0.5 rounded-full bg-secondary animate-wave"
                    key={index}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${index * 70}ms`,
                    }}
                  />
                ))}
              </span>
              <span className="text-xs font-semibold text-secondary">
                AI 正在朗读回复
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border bg-background px-3.5 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground animate-pulse-ring">
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="truncate text-xs text-muted-foreground">
                说说你这个项目里最难的部分……
              </span>
            </div>
          </div>

          <aside className="rounded-xl border bg-background/70 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-bold">即时反馈</p>
            </div>

            <div className="mt-3.5 space-y-3">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  推荐表达
                </p>
                <p className="mt-1.5 text-[13px] font-semibold leading-5 text-secondary">
                  I built a booking system last year and improved its page load
                  speed.
                </p>
              </div>

              <div className="rounded-lg border border-accent/25 bg-accent-soft p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-accent-foreground/70">
                  原因
                </p>
                <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
                  过去发生的事用一般过去时；build 的过去式是 built。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {scores.map((score) => (
                  <div
                    className="rounded-lg border bg-muted/50 p-2.5"
                    key={score.label}
                  >
                    <p className="text-[11px] text-muted-foreground">
                      {score.label}
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold tabular-nums">
                      {score.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
