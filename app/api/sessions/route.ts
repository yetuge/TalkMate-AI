import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import type {
  ChatMessage,
  Correction,
  PracticeReport,
  ScenarioId,
} from "@/lib/types";

export const runtime = "nodejs";

type SaveSessionRequestBody = {
  id?: string;
  userId?: string;
  scenario?: ScenarioId;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  messages?: ChatMessage[];
  corrections?: Correction[];
  report?: PracticeReport;
};

function isMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "content" in message &&
        typeof message.content === "string" &&
        (message.role === "user" ||
          message.role === "assistant" ||
          message.role === "system"),
    )
  );
}

function isCorrections(value: unknown): value is Correction[] {
  return (
    Array.isArray(value) &&
    value.every(
      (correction) =>
        typeof correction === "object" &&
        correction !== null &&
        "original" in correction &&
        "corrected" in correction &&
        "reason" in correction &&
        "betterExpression" in correction &&
        "scores" in correction,
    )
  );
}

function isReport(value: unknown): value is PracticeReport {
  return (
    typeof value === "object" &&
    value !== null &&
    "overallScore" in value &&
    "scores" in value
  );
}

export async function POST(request: Request) {
  let body: SaveSessionRequestBody;

  try {
    body = (await request.json()) as SaveSessionRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  if (!body.scenario || !body.startedAt || !body.endedAt) {
    return NextResponse.json(
      { error: "Scenario, startedAt, and endedAt are required." },
      { status: 400 },
    );
  }

  if (!isMessages(body.messages)) {
    return NextResponse.json(
      { error: "Messages must be valid chat messages." },
      { status: 400 },
    );
  }

  if (!isCorrections(body.corrections)) {
    return NextResponse.json(
      { error: "Corrections must be valid correction records." },
      { status: 400 },
    );
  }

  if (!isReport(body.report)) {
    return NextResponse.json(
      { error: "Report must be a valid practice report." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      id: body.id,
      provider: "localStorage",
    });
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: body.userId ?? null,
      scenario: body.scenario,
      started_at: body.startedAt,
      ended_at: body.endedAt,
      duration_seconds: Math.max(0, Math.round(body.durationSeconds ?? 0)),
      overall_score: body.report.overallScore,
      grammar_score: body.report.scores.grammar,
      fluency_score: body.report.scores.fluency,
      vocabulary_score: body.report.scores.vocabulary,
      pronunciation_score: body.report.scores.pronunciation,
      report: body.report,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("Failed to save practice session", sessionError);

    return NextResponse.json(
      { error: "Failed to save practice session." },
      { status: 500 },
    );
  }

  if (body.messages.length > 0) {
    const { error: messagesError } = await supabase
      .from("practice_messages")
      .insert(
        body.messages.map((message) => ({
          session_id: session.id,
          role: message.role,
          content: message.content,
          created_at: message.createdAt,
        })),
      );

    if (messagesError) {
      console.error("Failed to save practice messages", messagesError);
    }
  }

  if (body.corrections.length > 0) {
    const { error: correctionsError } = await supabase
      .from("practice_corrections")
      .insert(
        body.corrections.map((correction) => ({
          session_id: session.id,
          original: correction.original,
          corrected: correction.corrected,
          reason: correction.reason,
          better_expression: correction.betterExpression,
          scores: correction.scores,
        })),
      );

    if (correctionsError) {
      console.error("Failed to save practice corrections", correctionsError);
    }
  }

  return NextResponse.json({
    id: session.id,
    provider: "supabase",
  });
}

export async function GET() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      sessions: [],
      provider: "localStorage",
    });
  }

  const { data, error } = await supabase
    .from("practice_sessions")
    .select(
      "id, scenario, started_at, ended_at, duration_seconds, overall_score, grammar_score, fluency_score, vocabulary_score, pronunciation_score, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch practice sessions", error);

    return NextResponse.json(
      { error: "Failed to fetch practice sessions." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    sessions: data ?? [],
    provider: "supabase",
  });
}
