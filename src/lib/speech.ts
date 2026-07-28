export type SpeechRate = "slow" | "normal" | "fast";

const RATE_MAP: Record<SpeechRate, number> = { slow: 0.78, normal: 1, fast: 1.25 };

export function isRecognitionSupported(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSynthesisSupported(): boolean {
  return "speechSynthesis" in window;
}

export interface RecognizerHandle {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface RecognizerCallbacks {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (kind: "denied" | "no-speech" | "network" | "other") => void;
  onEnd?: () => void;
}

export function createRecognizer(callbacks: RecognizerCallbacks): RecognizerHandle | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognizer = new Ctor();
  recognizer.lang = "ko-KR";
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? "";
      if (result.isFinal) finalText += transcript;
      else interimText += transcript;
    }
    if (interimText) callbacks.onInterim?.(interimText);
    if (finalText) callbacks.onFinal(finalText);
  };

  recognizer.onerror = (event) => {
    if (event.error === "not-allowed" || event.error === "permission-denied") {
      callbacks.onError("denied");
    } else if (event.error === "no-speech") {
      callbacks.onError("no-speech");
    } else if (event.error === "network") {
      callbacks.onError("network");
    } else {
      callbacks.onError("other");
    }
  };

  recognizer.onend = () => callbacks.onEnd?.();

  return {
    start: () => recognizer.start(),
    stop: () => recognizer.stop(),
    abort: () => recognizer.abort()
  };
}

let preferredVoice: SpeechSynthesisVoice | null = null;

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (!isSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang?.toLowerCase().startsWith("ko")) || voices[0] || null;
}

if (isSynthesisSupported()) {
  preferredVoice = pickKoreanVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickKoreanVoice();
  };
}

export interface SpeakOptions {
  rate?: SpeechRate;
  onEnd?: () => void;
  onStart?: () => void;
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSynthesisSupported() || !text.trim()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = RATE_MAP[options.rate ?? "normal"];
  if (preferredVoice) utterance.voice = preferredVoice;
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (isSynthesisSupported()) window.speechSynthesis.cancel();
}
