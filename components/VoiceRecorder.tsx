import { Mic, Send, Square, Type, XCircle } from "lucide-react";
import { StatusNotice } from "@/components/StatusNotice";

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
  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
        <div className="flex gap-2">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-background text-foreground transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRecording || !isSpeechSupported}
            onClick={onStartRecording}
            title="开始录音"
            type="button"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-background text-foreground transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isRecording || !isSpeechSupported}
            onClick={onStopRecording}
            title="停止录音"
            type="button"
          >
            <Square className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
            <Type className="h-3.5 w-3.5" aria-hidden="true" />
            {isRecording ? "正在听你说话" : "当前识别文本"}
          </span>
          <textarea
            className="min-h-[92px] w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
            onChange={(event) => onTranscriptChange(event.target.value)}
            placeholder="请在这里说出或输入你的英文回答。"
            value={transcript}
          />
        </label>

        <div className="flex gap-2 lg:flex-col">
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
            disabled={isSending || !transcript.trim()}
            onClick={onSend}
            type="button"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {isSending ? "发送中" : "发送"}
          </button>
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-bold text-foreground transition hover:border-destructive hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
            disabled={isEnding}
            onClick={onEndPractice}
            type="button"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {isEnding ? "结束中" : "结束"}
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
          description="当前浏览器不支持语音识别，请手动输入文本。"
          tone="warning"
        />
      ) : null}
    </section>
  );
}
