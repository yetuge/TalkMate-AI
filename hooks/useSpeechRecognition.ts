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
      return "Microphone permission was denied. Please type your answer manually.";
    case "audio-capture":
      return "No microphone was detected. Please type your answer manually.";
    case "no-speech":
      return "No speech was detected. Please try again or type manually.";
    case "network":
      return "Speech recognition network error. Please type manually for now.";
    case "language-not-supported":
      return "English speech recognition is not supported in this browser.";
    default:
      return "Speech recognition stopped unexpectedly. You can type manually.";
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
      setError("Speech recognition is already running. Please continue speaking.");
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
