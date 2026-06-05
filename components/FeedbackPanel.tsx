import { Lightbulb, Sparkles } from "lucide-react";
import { LoadingDots } from "@/components/LoadingDots";
import type { Correction } from "@/lib/types";

type FeedbackPanelProps = {
  feedback?: Correction;
  isLoading?: boolean;
};

const scoreLabels = {
  grammar: "Grammar",
  fluency: "Fluency",
  vocabulary: "Vocabulary",
  pronunciation: "Pronunciation",
};

export function FeedbackPanel({ feedback, isLoading = false }: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <aside className="flex h-full flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Analyzing</h2>
            <p className="text-sm text-muted-foreground">
              Checking your grammar, fluency, vocabulary, and pronunciation
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          Instant feedback is being prepared <LoadingDots className="ml-1" />
        </div>
      </aside>
    );
  }

  if (!feedback) {
    return (
      <aside className="flex h-full flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Instant Feedback</h2>
            <p className="text-sm text-muted-foreground">
              Send a sentence to see corrections here.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          Feedback will include the original sentence, corrected sentence,
          reason, better expression, and score breakdown.
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Instant Feedback</h2>
          <p className="text-sm text-muted-foreground">Latest speaking turn</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <section className="rounded-lg border bg-background p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Original
          </p>
          <p className="mt-2 text-sm leading-6">{feedback.original}</p>
        </section>

        <section className="rounded-lg border bg-secondary/10 p-4">
          <p className="text-xs font-bold uppercase text-secondary">
            Corrected
          </p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {feedback.corrected}
          </p>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Reason
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {feedback.reason}
          </p>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            More Natural
          </p>
          <p className="mt-2 text-sm leading-6">{feedback.betterExpression}</p>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {Object.entries(feedback.scores).map(([key, value]) => (
          <div className="rounded-lg bg-muted p-3" key={key}>
            <p className="text-xs text-muted-foreground">
              {scoreLabels[key as keyof typeof scoreLabels]}
            </p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
