import { ReportView } from "@/components/ReportView";

type ReportPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;

  return <ReportView sessionId={sessionId} />;
}
