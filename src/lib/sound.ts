// צלילים קצרים שנוצרים ב־Web Audio (בלי קבצים) + הקראה בעברית.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine") {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t0 = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** מנגינת ניצחון עולה — כשמצליחים לזהות צמח. */
export function playSuccess() {
  if (muted) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // דו-מי-סול-דו
  notes.forEach((f, i) => tone(f, i * 0.12, 0.18, "triangle"));
}

/** צליל קליק קטן ונעים ללחיצות. */
export function playPop() {
  if (muted) return;
  tone(660, 0, 0.09, "square");
}

/** צליל עדין לפתיחת תג/הישג. */
export function playBadge() {
  if (muted) return;
  [784, 988, 1319].forEach((f, i) => tone(f, i * 0.1, 0.2, "sine"));
}

/** מקריא טקסט בעברית (תמיכה בקוראים מתחילים). */
/** הקראה בקול המכשיר (Web Speech) — קירוב לקול ילד: גובה גבוה. */
function speakDevice(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 1.05;
  u.pitch = 1.8;
  const voices = window.speechSynthesis.getVoices();
  const heVoices = voices.filter((v) => v.lang.startsWith("he"));
  const heVoice =
    heVoices.find((v) => /female|woman|girl|כרמית|Carmit/i.test(v.name)) ?? heVoices[0];
  if (heVoice) u.voice = heVoice;
  window.speechSynthesis.speak(u);
}

// אם ה-TTS בענן לא זמין (למשל לא הוגדר מפתח), עוברים לקול המכשיר לכל השאר.
let cloudTtsDisabled = false;
let currentAudio: HTMLAudioElement | null = null;
const ttsCache = new Map<string, string>();

/**
 * הקראה: מנסה קול ילד אמיתי מהשרת (ElevenLabs דרך /api/tts), עם מטמון;
 * אם לא זמין — נופל לקול המכשיר.
 */
export async function speak(text: string) {
  if (typeof window === "undefined") return;
  stopSpeaking();

  if (cloudTtsDisabled) return speakDevice(text);

  try {
    let url = ttsCache.get(text);
    if (!url) {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.status === 503 || res.status === 501) {
        cloudTtsDisabled = true; // לא הוגדר — לא ננסה שוב הפעם
        return speakDevice(text);
      }
      if (!res.ok) return speakDevice(text);
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      ttsCache.set(text, url);
    }
    const audio = new Audio(url);
    currentAudio = audio;
    await audio.play();
  } catch {
    speakDevice(text);
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}
