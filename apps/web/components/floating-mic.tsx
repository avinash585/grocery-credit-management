"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseVoiceCommand } from "@/lib/api";
import type { Language, t } from "@/lib/i18n";

type SpeechRecognitionCtor = new () => SpeechRecognition;

type SpeechRecognition = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

const langCodes: Record<Language, string> = {
  ENGLISH: "en-IN",
  TAMIL: "ta-IN",
  HINDI: "hi-IN",
  TELUGU: "te-IN",
  KANNADA: "kn-IN",
  MALAYALAM: "ml-IN"
};

export function FloatingMic({
  language,
  copy,
  onTranscript,
  onCommandParsed
}: {
  language: Language;
  copy: ReturnType<typeof t>;
  onTranscript: (value: string) => void;
  onCommandParsed?: (command: {
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }) => void;
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const win = window as typeof window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Recognition = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }
    const recognition = new Recognition();
    recognition.lang = langCodes[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      onTranscript(transcript || copy.voiceCommandReady);
      parseVoiceCommand(transcript, language)
        .then((cmd) => {
          if (cmd && onCommandParsed) {
            onCommandParsed(cmd);
          }
        })
        .catch((err) => console.error("Voice parse error:", err));
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      setListening(false);
      recognition.stop();
    };
  }, [copy.voiceCommandReady, language, onTranscript, onCommandParsed]);

  function toggle() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      onTranscript(copy.speechUnavailable);
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      try {
        recognition.lang = langCodes[language];
        recognition.start();
        setListening(true);
        onTranscript(copy.listening);
      } catch {
        setListening(false);
        onTranscript(copy.speechUnavailable);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full bg-leaf-600 text-white shadow-soft transition hover:bg-leaf-700"
      aria-label={listening ? copy.stopVoice : copy.startVoice}
      title={listening ? copy.stopVoice : copy.startVoice}
    >
      {listening ? <MicOff className="h-10 w-10" aria-hidden /> : <Mic className="h-10 w-10" aria-hidden />}
    </button>
  );
}
