"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Clock3,
  MessagesSquare,
  Volume2,
} from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { PracticeHeader } from "@/components/PracticeHeader";
import { StatusNotice } from "@/components/StatusNotice";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { withLegacyCorrectionFields } from "@/lib/corrections";
import { getScenarioLabel } from "@/lib/labels";
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
  return withLegacyCorrectionFields({
    feedbackType: "ENHANCEMENT",
    originalText: text,
    recommendedExpression: text,
    reason: "当前使用本地备用反馈，真实纠错原因会由 AI 纠错接口生成。",
    scores: {
      grammar: 82,
      fluency: 80,
      vocabulary: 78,
      pronunciation: 81,
    },
  });
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
  previousAssistantMessage?: string,
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
        previousAssistantMessage,
      }),
    });
    const correctionData = (await response.json()) as CorrectionApiResponse;
    const correction =
      response.ok &&
      correctionData.feedbackType &&
      correctionData.originalText &&
      correctionData.recommendedExpression &&
      correctionData.reason &&
      correctionData.scores
        ? withLegacyCorrectionFields(correctionData as Correction)
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
    clearError: clearSpeechPlaybackError,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis({ lang: "en-US" });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [startedAt]);

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

  const handleSend = useCallback(async () => {
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
    const previousAssistantMessage = [...messages]
      .reverse()
      .find(
        (message) => message.role === "assistant" && message.content.trim(),
      )?.content;

    setMessages([...nextMessages, assistantMessage]);
    resetTranscript();
    setCurrentFeedback(undefined);
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const correctionPromise = fetchCorrectionFeedback(
      scenario.id,
      text,
      previousAssistantMessage,
    );

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
      setErrorMessage("AI 服务暂时不可用，TalkMate 已使用本地备用回复。");
      speak(fallbackReply);
    } finally {
      setIsLoading(false);
    }
  }, [
    messages,
    resetTranscript,
    scenario.id,
    speak,
    stopRecording,
    stopSpeaking,
    transcript,
  ]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void handleSend();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSend]);

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
        setStatusMessage("Supabase 未配置，本次报告已保存到当前浏览器本地。");
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

  const userTurnCount = messages.filter(
    (message) => message.role === "user",
  ).length;

  return (
    <main className="flex min-h-screen flex-col bg-muted lg:h-screen lg:overflow-hidden">
      <PracticeHeader
        scenarioLabel={scenarioLabel}
        difficulty={scenario.difficulty}
        elapsedSeconds={elapsedSeconds}
        isRecording={isRecording}
      />

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:overflow-hidden">
        <section className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl border bg-background shadow-sm lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <MessagesSquare className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <h2 className="text-base font-bold">对话练习</h2>
                <p className="text-xs text-muted-foreground">
                  请用英语回答，尽量保持简短自然
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg bg-background px-3 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground sm:inline-flex">
                {userTurnCount} 轮发言
              </span>
              {isSpeaking ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/25 bg-secondary-soft px-2.5 py-1.5 text-xs font-semibold text-secondary">
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  AI 朗读中
                </span>
              ) : null}
            </div>
          </div>

          <div
            className="scrollbar-slim min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5"
            onScroll={handleChatScroll}
            ref={chatScrollAreaRef}
          >
            {messages.map((message, index) => (
              <ChatMessage
                isSpeaking={
                  isSpeaking &&
                  message.role === "assistant" &&
                  index === messages.length - 1
                }
                key={message.id}
                message={message}
              />
            ))}
          </div>

          <div className="sticky bottom-0 z-10 shrink-0 border-t bg-background p-4">
            <div className="mb-3 space-y-3 empty:mb-0">
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
                  onDismiss={clearSpeechPlaybackError}
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

        <div className="scrollbar-slim min-h-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
          <FeedbackPanel feedback={currentFeedback} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
