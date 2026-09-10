import { speak } from "../lib/sound";

export function SpeakButton({ text, label = "הקריאו לי" }: { text: string; label?: string }) {
  return (
    <button
      onClick={() => speak(text)}
      className="inline-flex items-center gap-2 rounded-full bg-sky/20 px-5 py-3 text-lg font-bold text-sky-700 active:scale-95 transition-transform"
      aria-label="הקראה בקול"
    >
      <span className="text-2xl">🔊</span>
      {label}
    </button>
  );
}
