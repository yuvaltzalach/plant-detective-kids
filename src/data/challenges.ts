import type { PlantCategory } from "../types";

export interface Challenge {
  id: string;
  text: string;
  emoji: string;
  /** אם מוגדר — האתגר מושלם רק כשמזהים צמח מהקטגוריה הזו. אחרת כל זיהוי נחשב. */
  category?: PlantCategory;
  /** אתגר טקסט חופשי (של הורה) שמסומן ידנית בכפתור "מצאתי!" ולא אוטומטית. */
  manual?: boolean;
}

const CHALLENGES: Challenge[] = [
  { id: "any", text: "מצאו וזהו צמח כלשהו היום", emoji: "🔍" },
  { id: "tree", text: "מצאו עץ גדול וגבוה", emoji: "🌳", category: "עץ" },
  { id: "flower", text: "מצאו פרח צבעוני", emoji: "🌸", category: "פרח" },
  { id: "herb", text: "מצאו עשב ריחני", emoji: "🌿", category: "עשב" },
  { id: "two", text: "זהו שני צמחים שונים היום", emoji: "✌️" },
  { id: "flower2", text: "מצאו פרח צהוב או אדום", emoji: "🌻", category: "פרח" },
  { id: "tree2", text: "מצאו עץ שנותן פירות", emoji: "🍊", category: "עץ" }
];

/** מחזיר את האתגר של היום באופן קבוע לפי התאריך. */
export function challengeForDate(date = new Date()): Challenge {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return CHALLENGES[dayNumber % CHALLENGES.length];
}

/** מחרוזת תאריך יציבה (YYYY-MM-DD) בזמן מקומי. */
export function dateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
