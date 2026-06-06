"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Clock3,
  MessageSquareText,
  Volume2,
} from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { StatusNotice } from "@/components/StatusNotice";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { difficultyLabels, getScenarioLabel } from "@/lib/labels";
import type {
  ChatMessage as ChatMessageType,
  Correction,
  PracticeReport,
  Scenario,
} from "@/lib/types";

type PracticeRoomProps = {
  scenario: Scenario;
};

function createMessage(role: "user" | "assistant", content: string) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  } satisfies ChatMessageType;
}

function createMockFeedback(text: string): Correction {
  return {
    original: text,
    corrected: text.trim().endsWith(".") ? text.trim() : `${text.trim()}.`,
    reason: "当前使用本地备用反馈，真实纠错原因会由 AI 纠错接口生成。",
    betterExpression:
      "I would like to explain my answer with a clear example and one specific detail.",
    scores: {
      grammar: 82,
      fluency: 80,
      vocabulary: 78,
      pronunciation: 81,
    },
  };
}

type CorrectionApiResponse = Partial<Correction> & {
  error?: string;
};

type ReportApiResponse = Partial<PracticeReport> & {
  error?: string;
};

type SaveSessionApiResponse = {
  id?: string;
  provider?: "supabase" | "localStorage";
  error?: string;
};

type StreamChatResult = {
  reply: string;
  provider?: "deepseek" | "fallback";
  error?: string;
};

type CorrectionResult = {
  correction: Correction;
  usedFallback: boolean;
};

const STREAM_RENDER_FLUSH_INTERVAL_MS = 45;
const CHAT_AUTO_SCROLL_THRESHOLD_PX = 120;

function parseSseBlock(block: string) {
  const lines = block.split(/\r?\n/);
  const dataLines: string[] = [];
  let event = "message";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return { event, data: {} as Record<string, unknown> };
  }

  try {
    return {
      event,
      data: JSON.parse(dataLines.join("\n")) as Record<string, unknown>,
    };
  } catch {
    return { event, data: {} as Record<string, unknown> };
  }
}

async function streamChatReply({
  scenarioId,
  messages,
  onReply,
}: {
  scenarioId: string;
  messages: ChatMessageType[];
  onReply: (reply: string) => void;
}): Promise<StreamChatResult> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scenario: scenarioId,
      messages,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Chat stream request failed.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = "";
  let renderBuffer = "";
  let reply = "";
  let provider: StreamChatResult["provider"];
  let streamError: string | undefined;

  function flushRenderBuffer() {
    if (!renderBuffer) {
      return;
    }

    reply += renderBuffer;
    renderBuffer = "";
    onReply(reply);
  }

  function handleBlock(block: string) {
    const { event, data } = parseSseBlock(block);

    if (event === "token" && typeof data.token === "string") {
      renderBuffer += data.token;
    }

    if (
      event === "done" &&
      (data.provider === "deepseek" || data.provider === "fallback")
    ) {
      provider = data.provider;
    }

    if (event === "error" && typeof data.message === "string") {
      streamError = data.message;
    }
  }

  const flushTimer = window.setInterval(
    flushRenderBuffer,
    STREAM_RENDER_FLUSH_INTERVAL_MS,
  );

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      sseBuffer += decoder.decode(value, { stream: true });
      const blocks = sseBuffer.split("\n\n");
      sseBuffer = blocks.pop() ?? "";

      for (const block of blocks) {
        if (block.trim()) {
          handleBlock(block);
        }
      }
    }

    sseBuffer += decoder.decode();

    if (sseBuffer.trim()) {
      handleBlock(sseBuffer);
    }
  } finally {
    window.clearInterval(flushTimer);
    flushRenderBuffer();
  }

  if (!reply && streamError) {
    throw new Error(streamError);
  }

  return { reply, provider, error: streamError };
}

async function fetchCorrectionFeedback(
  scenarioId: string,
  text: string,
): Promise<CorrectionResult> {
  try {
    const response = await fetch("/api/correction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scenario: scenarioId,
        text,
      }),
    });
    const correctionData = (await response.json()) as CorrectionApiResponse;
    const correction =
      response.ok &&
      correctionData.original &&
      correctionData.corrected &&
      correctionData.reason &&
      correctionData.betterExpression &&
      correctionData.scores
        ? (correctionData as Correction)
        : createMockFeedback(text);

    return {
      correction,
      usedFallback: !response.ok || Boolean(correctionData.error),
    };
  } catch {
    return {
      correction: createMockFeedback(text),
      usedFallback: true,
    };
  }
}

export function PracticeRoom({ scenario }: PracticeRoomProps) {
  const router = useRouter();
  const chatScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const shouldFollowChatRef = useRef(true);
  const scenarioLabel = getScenarioLabel(scenario.id);
  const openingMessage = useMemo(
    () => createMessage("assistant", scenario.openingQuestion),
    [scenario.openingQuestion],
  );
  const startedAt = useMemo(() => new Date(), []);
  const [messages, setMessages] = useState<ChatMessageType[]>([openingMessage]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<Correction>();
  const {
    transcript,
    isRecording,
    isSupported: isSpeechSupported,
    error: speechError,
    setTranscript,
    resetTranscript,
    startRecording,
    stopRecording,
  } = useSpeechRecognition({ lang: "en-US" });
  const {
    isSpeaking,
    error: speechPlaybackError,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis({ lang: "en-US" });

  const isChatNearBottom = useCallback(() => {
    const scrollArea = chatScrollAreaRef.current;

    if (!scrollArea) {
      return true;
    }

    return (
      scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight <=
      CHAT_AUTO_SCROLL_THRESHOLD_PX
    );
  }, []);

  const scrollChatToBottom = useCallback(() => {
    const scrollArea = chatScrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: "auto",
    });
  }, []);

  const handleChatScroll = useCallback(() => {
    shouldFollowChatRef.current = isChatNearBottom();
  }, [isChatNearBottom]);

  useEffect(() => {
    if (!shouldFollowChatRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(scrollChatToBottom);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages, isSpeaking, scrollChatToBottom]);

  function handleStartRecording() {
    stopSpeaking();
    startRecording();
  }

  async function handleSend() {
    const text = transcript.trim();

    if (!text) {
      return;
    }

    stopRecording();
    stopSpeaking();
    shouldFollowChatRef.current = true;

    const userMessage = createMessage("user", text);
    const assistantMessage = createMessage("assistant", "");
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, assistantMessage]);
    resetTranscript();
    setCurrentFeedback(undefined);
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const correctionPromise = fetchCorrectionFeedback(scenario.id, text);

    try {
      const [chatResult, correctionResult] = await Promise.all([
        streamChatReply({
          scenarioId: scenario.id,
          messages: nextMessages,
          onReply: (reply) => {
            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: reply }
                  : message,
              ),
            );
          },
        }),
        correctionPromise,
      ]);

      const reply =
        chatResult.reply ||
        "Good answer. Can you add one more detail to make it sound more natural?";

      if (!chatResult.reply) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  content: reply,
                }
              : message,
          ),
        );
      }

      setCurrentFeedback(correctionResult.correction);
      setCorrections((currentCorrections) => [
        ...currentCorrections,
        correctionResult.correction,
      ]);
      if (
        chatResult.provider === "fallback" ||
        chatResult.error ||
        correctionResult.usedFallback
      ) {
        setStatusMessage(
          "部分 AI 服务使用了备用结果，但练习流程仍可继续并保存。",
        );
      }
      speak(reply);
    } catch {
      const correctionResult = await correctionPromise;
      const fallbackReply =
        "Good answer. Can you add one more detail to make it sound more natural?";

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content: fallbackReply,
              }
            : message,
        ),
      );
      setCurrentFeedback(correctionResult.correction);
      setCorrections((currentCorrections) => [
        ...currentCorrections,
        correctionResult.correction,
      ]);
      setErrorMessage(
        "AI 服务暂时不可用，TalkMate 已使用本地备用回复。",
      );
      speak(fallbackReply);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEndPractice() {
    if (isEnding) {
      return;
    }

    setIsEnding(true);
    stopSpeaking();
    setStatusMessage("正在生成学习报告并保存本次练习。");
    setErrorMessage(null);

    try {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAt.getTime()) / 1000),
      );
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: scenario.id,
          messages,
          corrections,
          durationSeconds,
        }),
      });
      const report = (await response.json()) as ReportApiResponse;
      const localSessionId = `local-${Date.now()}`;
      const endedAt = new Date();
      const localSession = {
        id: localSessionId,
        scenario: scenario.id,
        scenarioTitle: scenarioLabel.title,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationSeconds,
        messages,
        corrections,
        report,
      };

      window.localStorage.setItem(
        `talkmate-report-${localSessionId}`,
        JSON.stringify(localSession),
      );

      const saveResponse = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localSession),
      });
      const savedSession = (await saveResponse.json()) as SaveSessionApiResponse;
      const sessionId = savedSession.id ?? localSessionId;

      if (savedSession.provider === "localStorage") {
        setStatusMessage(
          "Supabase 未配置，本次报告已保存到当前浏览器本地。",
        );
      }

      if (sessionId !== localSessionId) {
        window.localStorage.setItem(
          `talkmate-report-${sessionId}`,
          JSON.stringify({
            ...localSession,
            id: sessionId,
          }),
        );
      }

      router.push(`/report/${sessionId}`);
    } catch {
      setErrorMessage("报告生成失败，请稍后重试。");
      setStatusMessage(null);
      setIsEnding(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-muted lg:h-screen lg:overflow-hidden">
      <header className="sticky top-0 z-30 shrink-0 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-card-foreground transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              href="/scenarios"
              title="返回场景选择"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div>
              <p className="text-xs font-bold uppercase text-secondary">
                {difficultyLabels[scenario.difficulty]}场景
              </p>
              <h1 className="text-xl font-black sm:text-2xl">
                {scenarioLabel.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 font-semibold text-card-foreground">
              <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
              {scenarioLabel.aiRole}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 font-semibold text-card-foreground">
              <Clock3 className="h-4 w-4 text-secondary" aria-hidden="true" />
              00:00
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden">
        <section className="flex min-h-[640px] flex-col rounded-lg border bg-background shadow-sm lg:min-h-0">
          <div className="shrink-0 flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">对话练习</h2>
              <p className="text-sm text-muted-foreground">
                请用英语回答，尽量保持简短自然。
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground">
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              {messages.length} 轮对话
            </div>
          </div>

          <div
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5"
            onScroll={handleChatScroll}
            ref={chatScrollAreaRef}
          >
            {messages.map((message) => (
              <ChatMessage message={message} key={message.id} />
            ))}
            {isSpeaking ? (
              <div className="inline-flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm font-semibold text-secondary shadow-sm">
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                AI 正在朗读
              </div>
            ) : null}
          </div>

          <div className="sticky bottom-0 z-10 shrink-0 border-t bg-background p-4">
            <div className="mb-3 space-y-3">
              {isEnding ? (
                <StatusNotice
                  title="正在准备报告"
                  description="正在生成学习报告并保存本次练习。"
                  tone="loading"
                />
              ) : null}
              {statusMessage && !isEnding ? (
                <StatusNotice
                  title="练习继续进行"
                  description={statusMessage}
                  tone="info"
                />
              ) : null}
              {errorMessage ? (
                <StatusNotice
                  title="备用模式已启用"
                  description={errorMessage}
                  tone="warning"
                />
              ) : null}
              {speechPlaybackError ? (
                <StatusNotice
                  title="语音播放提示"
                  description={speechPlaybackError}
                  tone="warning"
                />
              ) : null}
            </div>
            <VoiceRecorder
              transcript={transcript}
              isRecording={isRecording}
              isSending={isLoading}
              isEnding={isEnding}
              isSpeechSupported={isSpeechSupported}
              speechError={speechError}
              onTranscriptChange={setTranscript}
              onStartRecording={handleStartRecording}
              onStopRecording={stopRecording}
              onSend={handleSend}
              onEndPractice={handleEndPractice}
            />
          </div>
        </section>

        <div className="min-h-0 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)] lg:self-start lg:overflow-y-auto">
          <FeedbackPanel feedback={currentFeedback} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
