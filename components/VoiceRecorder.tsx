import { Keyboard, Mic, Send, Square, Type, XCircle } from "lucide-react";
import { StatusNotice } from "@/components/StatusNotice";
import { cn } from "@/lib/utils";

type VoiceRecorderProps = {
  transcript: string;
  isRecording: boolean;
  isSending: boolean;
  isEnding: boolean;
  isSpeechSupported: boolean;
  speechError?: string | null;
  onTranscriptChange: (value: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSend: () => void;
  onEndPractice: () => void;
};

export function VoiceRecorder({
  transcript,
  isRecording,
  isSending,
  isEnding,
  isSpeechSupported,
  speechError,
  onTranscriptChange,
  onStartRecording,
  onStopRecording,
  onSend,
  onEndPractice,
}: VoiceRecorderProps) {
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <section className="rounded-2xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition",
              isRecording
                ? "bg-destructive text-destructive-foreground animate-pulse-ring"
                : "bg-primary-soft text-primary",
            )}
          >
            {isRecording ? (
              <Square className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">
              {isRecording ? "正在听你说话" : "说出或输入你的回答"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRecording
                ? "再次点击麦克风结束录音"
                : "支持浏览器语音识别，也可以直接打字"}
            </p>
          </div>
        </div>

        <span className="hidden items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground sm:inline-flex">
          <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          {wordCount} 词
        </span>
      </div>

      <label className="block">
        <div
          className={cn(
            "rounded-xl border bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30",
            isRecording && "border-destructive/40 bg-destructive/[0.03]",
          )}
        >
          <div className="flex items-center gap-2 border-b px-3.5 py-2">
            <Type
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wide",
                isRecording ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {isRecording ? "实时识别中" : "识别文本"}
            </span>
            {isRecording ? (
              <span className="ml-auto flex h-4 items-end gap-0.5">
                {[8, 14, 10, 16, 8].map((height, index) => (
                  <span
                    className="w-0.5 rounded-full bg-destructive animate-wave"
                    key={index}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${index * 110}ms`,
                    }}
                  />
                ))}
              </span>
            ) : null}
          </div>

          <textarea
            className="min-h-[88px] w-full resize-none rounded-b-xl bg-transparent px-3.5 py-3 text-sm leading-7 outline-none placeholder:text-muted-foreground"
            onChange={(event) => onTranscriptChange(event.target.value)}
            placeholder="例如：I built a booking system last year and improved its page load speed."
            value={transcript}
          />
        </div>
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <div className="flex gap-2">
          <button
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              isRecording
                ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
                : "bg-background text-foreground hover:border-primary",
            )}
            disabled={!isSpeechSupported}
            onClick={isRecording ? onStopRecording : onStartRecording}
            title={isRecording ? "停止录音" : "开始录音"}
            type="button"
          >
            {isRecording ? (
              <Square className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Mic className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="text-xs leading-5 text-muted-foreground sm:px-1">
          按 <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-semibold">Ctrl</kbd>{" "}
          +{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-semibold">Enter</kbd>{" "}
          快速发送，结束练习后会生成学习报告。
        </p>

        <div className="flex gap-2">
          <button
            className="btn-primary h-11 flex-1 px-5 text-sm sm:flex-none"
            disabled={isSending || !transcript.trim()}
            onClick={onSend}
            type="button"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {isSending ? "发送中" : "发送"}
          </button>
          <button
            className="btn-ghost h-11 flex-1 px-4 text-sm hover:border-destructive/50 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            disabled={isEnding}
            onClick={onEndPractice}
            type="button"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {isEnding ? "结束中" : "结束练习"}
          </button>
        </div>
      </div>

      {speechError ? (
        <StatusNotice
          className="mt-3"
          title="语音识别提示"
          description={speechError}
          tone="error"
        />
      ) : null}
      {!isSpeechSupported ? (
        <StatusNotice
          className="mt-3"
          title="可使用手动输入"
          description="当前浏览器不支持语音识别，请手动输入文本继续练习。"
          tone="warning"
        />
      ) : null}
    </section>
  );
}
