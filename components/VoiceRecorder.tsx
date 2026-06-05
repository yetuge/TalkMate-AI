import { AlertCircle, Mic, Send, Square, Type, XCircle } from "lucide-react";

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
            title="Start recording"
            type="button"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-background text-foreground transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isRecording || !isSpeechSupported}
            onClick={onStopRecording}
            title="Stop recording"
            type="button"
          >
            <Square className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
            <Type className="h-3.5 w-3.5" aria-hidden="true" />
            {isRecording ? "Listening" : "Current transcript"}
          </span>
          <textarea
            className="min-h-[92px] w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
            onChange={(event) => onTranscriptChange(event.target.value)}
            placeholder="Speak or type your English answer here."
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
            {isSending ? "Sending" : "Send"}
          </button>
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-bold text-foreground transition hover:border-destructive hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
            disabled={isEnding}
            onClick={onEndPractice}
            type="button"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {isEnding ? "Ending" : "End"}
          </button>
        </div>
      </div>
      {speechError ? (
        <div className="mt-3 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{speechError}</p>
        </div>
      ) : null}
      {!isSpeechSupported ? (
        <p className="mt-3 text-sm text-muted-foreground">
          当前浏览器不支持语音识别，请手动输入文本。
        </p>
      ) : null}
    </section>
  );
}
