"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseSpeechSynthesisOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

function getSpeechSynthesisSupport() {
  if (typeof window === "undefined") {
    return false;
  }

  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function findVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find((voice) => voice.lang === lang) ??
    voices.find((voice) => voice.lang.startsWith(lang.split("-")[0])) ??
    null
  );
}

export function useSpeechSynthesis({
  lang = "en-US",
  rate = 0.95,
  pitch = 1,
}: UseSpeechSynthesisOptions = {}) {
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakTimeoutRef = useRef<number | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voicesVersion, setVoicesVersion] = useState(0);

  const clearPendingSpeak = useCallback(() => {
    if (speakTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(speakTimeoutRef.current);
    speakTimeoutRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (!getSpeechSynthesisSupport()) {
      return;
    }

    clearPendingSpeak();
    activeUtteranceRef.current = null;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [clearPendingSpeak]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const speak = useCallback(
    (text: string) => {
      const content = text.trim();

      if (!content) {
        return;
      }

      if (!getSpeechSynthesisSupport()) {
        setIsSupported(false);
        setError("当前浏览器不支持语音播放。");
        return;
      }

      clearPendingSpeak();
      activeUtteranceRef.current = null;
      window.speechSynthesis.cancel();
      setError(null);

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.voice = findVoice(lang);

      utterance.onstart = () => {
        if (activeUtteranceRef.current !== utterance) {
          return;
        }

        setIsSpeaking(true);
      };

      utterance.onend = () => {
        if (activeUtteranceRef.current !== utterance) {
          return;
        }

        activeUtteranceRef.current = null;
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        if (activeUtteranceRef.current !== utterance) {
          return;
        }

        activeUtteranceRef.current = null;
        setIsSpeaking(false);

        if (event.error === "canceled" || event.error === "interrupted") {
          return;
        }

        setError("语音播放失败，你仍然可以继续文字练习。");
      };

      activeUtteranceRef.current = utterance;

      speakTimeoutRef.current = window.setTimeout(() => {
        speakTimeoutRef.current = null;

        if (activeUtteranceRef.current !== utterance) {
          return;
        }

        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      }, 80);
    },
    [clearPendingSpeak, lang, pitch, rate, voicesVersion],
  );

  useEffect(() => {
    setIsSupported(getSpeechSynthesisSupport());

    if (!getSpeechSynthesisSupport()) {
      return;
    }

    const handleVoicesChanged = () => {
      setVoicesVersion((version) => version + 1);
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged,
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    error,
    clearError,
    speak,
    stop,
  };
}
