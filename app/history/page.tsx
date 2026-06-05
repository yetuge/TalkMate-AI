import Link from "next/link";

export default function HistoryPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-3xl rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-sm font-semibold uppercase text-secondary">
          Step 2
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          History Route Ready
        </h1>
        <p className="mt-4 text-muted-foreground">
          Practice history will be connected after sessions are persisted.
        </p>
        <Link className="mt-6 inline-block text-sm font-semibold text-primary" href="/">
          Back home
        </Link>
      </section>
    </main>
  );
}
