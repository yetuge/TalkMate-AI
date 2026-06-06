"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (!getSpeechSynthesisSupport()) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

      window.speechSynthesis.cancel();
      setError(null);

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.voice = findVoice(lang);

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);

        if (event.error === "canceled" || event.error === "interrupted") {
          return;
        }

        setError("语音播放失败，你仍然可以继续文字练习。");
      };

      window.speechSynthesis.speak(utterance);
    },
    [lang, pitch, rate],
  );

  useEffect(() => {
    setIsSupported(getSpeechSynthesisSupport());

    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    error,
    speak,
    stop,
  };
}
