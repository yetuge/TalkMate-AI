"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseSpeechRecognitionOptions = {
  lang?: string;
};

function getRecognitionConstructor() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function getErrorMessage(error: SpeechRecognitionErrorCode) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "麦克风权限被拒绝，请手动输入你的回答。";
    case "audio-capture":
      return "未检测到麦克风，请手动输入你的回答。";
    case "no-speech":
      return "没有检测到语音，请重试或手动输入。";
    case "network":
      return "语音识别网络异常，请暂时手动输入。";
    case "language-not-supported":
      return "当前浏览器不支持英文语音识别。";
    default:
      return "语音识别意外停止，你可以手动输入。";
  }
}

export function useSpeechRecognition({
  lang = "en-US",
}: UseSpeechRecognitionOptions = {}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const RecognitionConstructor = getRecognitionConstructor();

    if (!RecognitionConstructor) {
      setIsSupported(false);
      setError(
        "当前浏览器不支持语音识别，请手动输入文本。",
      );
      return;
    }

    const recognition = new RecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${text}`.trim();
        }
      }

      setTranscript(
        `${finalTranscriptRef.current} ${interimTranscript}`.trim(),
      );
    };

    recognition.onerror = (event) => {
      setError(getErrorMessage(event.error));
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
    setError(null);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang]);

  const startRecording = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setError("当前浏览器不支持语音识别，请手动输入文本。");
      return;
    }

    setError(null);

    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      setError("语音识别已经在运行，请继续说话。");
      setIsRecording(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const updateTranscript = useCallback((value: string) => {
    finalTranscriptRef.current = value;
    setTranscript(value);
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    transcript,
    isRecording,
    isSupported,
    error,
    setTranscript: updateTranscript,
    resetTranscript,
    startRecording,
    stopRecording,
  };
}
