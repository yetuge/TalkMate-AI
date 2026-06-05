type ReportPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-3xl rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
          Step 2
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Report Route Ready
        </h1>
        <p className="mt-4 text-muted-foreground">
          Report details will be rendered here after the report API is connected.
        </p>
        <p className="mt-5 rounded-lg bg-muted p-4 text-sm">
          Session ID: {sessionId}
        </p>
      </section>
    </main>
  );
}
