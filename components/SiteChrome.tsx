import Link from "next/link";
import { Github, History, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/yetuge/TalkMate-AI";

export function SiteNav({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl",
        className,
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          href="/"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="btn-ghost hidden h-10 px-4 text-sm sm:inline-flex"
            href="/history"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            历史记录
          </Link>
          <a
            className="btn-ghost h-10 px-3 text-sm sm:px-4"
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <Link className="btn-primary h-10 px-4 text-sm" href="/scenarios">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            开始练习
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t bg-card/60 px-6 py-10", className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo showTagline />
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            面向英语学习者的场景化口语练习平台，在浏览器中完成从对话到报告的完整闭环。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            className="font-semibold text-muted-foreground transition hover:text-primary"
            href="/scenarios"
          >
            场景选择
          </Link>
          <Link
            className="font-semibold text-muted-foreground transition hover:text-primary"
            href="/history"
          >
            历史记录
          </Link>
          <a
            className="inline-flex items-center gap-2 font-semibold text-muted-foreground transition hover:text-primary"
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub 仓库
          </a>
        </div>
      </div>
    </footer>
  );
}
