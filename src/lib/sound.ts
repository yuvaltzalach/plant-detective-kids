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
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 0.95;
  u.pitch = 1.05;
  const heVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("he"));
  if (heVoice) u.voice = heVoice;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
