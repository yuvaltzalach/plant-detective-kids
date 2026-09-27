import type { PlantCategory } from "../types";

export interface Challenge {
  id: string;
  text: string;
  emoji: string;
  /** אם מוגדר — רק זיהוי של צמח מהקטגוריה הזו נחשב. */
  category?: PlantCategory;
  /** כמה זיהויים (שעומדים בתנאי) צריך היום כדי להשלים. ברירת מחדל: 1 */
  count?: number;
  /** רק צמח שעוד לא נמצא אף פעם (מדבקה חדשה) נחשב */
  newOnly?: boolean;
  /** עונות שבהן האתגר מתאים (0=חורף, 1=אביב, 2=קיץ, 3=סתיו). בלי ערך — כל השנה */
  seasons?: number[];
}

// כל האתגרים מאומתים אוטומטית בזיהוי תמונה — אין צורך שמישהו יכתוב אותם או יסמן ידנית.
const CHALLENGES: Challenge[] = [
  { id: "any", text: "מצאו וזהו צמח כלשהו היום", emoji: "🔍" },
  { id: "two", text: "זהו שני צמחים היום", emoji: "✌️", count: 2 },
  { id: "three", text: "משימת בלשים: זהו שלושה צמחים היום!", emoji: "🕵️", count: 3 },
  { id: "new", text: "מצאו צמח חדש שעוד אין לכם באלבום", emoji: "✨", newOnly: true },
  { id: "new2", text: "הוסיפו היום שתי מדבקות חדשות לאלבום", emoji: "📔", newOnly: true, count: 2 },
  { id: "tree", text: "מצאו עץ גדול וגבוה", emoji: "🌳", category: "עץ" },
  { id: "tree-fruit", text: "מצאו עץ שנותן פירות", emoji: "🍊", category: "עץ" },
  { id: "tree-street", text: "צלמו עץ שגדל ברחוב או בשכונה", emoji: "🏘️", category: "עץ" },
  { id: "tree2", text: "זהו שני עצים שונים", emoji: "🌲", category: "עץ", count: 2 },
  { id: "flower", text: "מצאו פרח צבעוני", emoji: "🌸", category: "פרח" },
  { id: "flower-yellow", text: "מצאו פרח צהוב או אדום", emoji: "🌻", category: "פרח" },
  { id: "flower-garden", text: "מצאו פרח בגינה או בעציץ", emoji: "🪴", category: "פרח" },
  { id: "flower2", text: "זהו שני פרחים שונים", emoji: "💐", category: "פרח", count: 2 },
  { id: "flower-spring", text: "פריחת אביב! מצאו פרח בר בשדה", emoji: "🌼", category: "פרח", seasons: [1] },
  { id: "flower-winter", text: "מצאו פרח שפורח בחורף (כמו רקפת או כלנית)", emoji: "🌺", category: "פרח", seasons: [0] },
  { id: "herb", text: "מצאו עשב ריחני", emoji: "🌿", category: "עשב" },
  { id: "herb-kitchen", text: "מצאו צמח תבלין (נענע, בזיליקום, רוזמרין...)", emoji: "🧑‍🍳", category: "עשב" },
  { id: "plant", text: "מצאו צמח בית, ירק או שיח", emoji: "🪴", category: "צמח" },
  { id: "tree-autumn", text: "מצאו עץ שהעלים שלו מחליפים צבע", emoji: "🍂", category: "עץ", seasons: [3] },
  { id: "summer-shade", text: "מצאו עץ שנותן צל בקיץ החם", emoji: "☀️", category: "עץ", seasons: [2] }
];

/** עונה לפי חודש: דצמבר-פברואר חורף, מרץ-מאי אביב, יוני-אוגוסט קיץ, ספטמבר-נובמבר סתיו. */
export function seasonOf(date: Date): number {
  return Math.floor(((date.getMonth() + 1) % 12) / 3);
}

/** מספר היום לפי התאריך המקומי — כך כל המכשירים (באותו אזור זמן) מקבלים אותו אתגר. */
function localDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/**
 * מחזיר את האתגר של היום. נקבע אוטומטית לפי התאריך בלבד, ולכן זהה בכל המכשירים
 * בלי שרת ובלי שהורה צריך לכתוב אותו. אתגרים עונתיים מופיעים רק בעונה המתאימה.
 */
export function challengeForDate(date = new Date()): Challenge {
  const season = seasonOf(date);
  const pool = CHALLENGES.filter((c) => !c.seasons || c.seasons.includes(season));
  const day = localDayNumber(date);
  // ערבוב קבוע (ולא לפי הסדר ברשימה) כדי שלא יחזרו אותם סוגי אתגרים ברצף
  return pool[(day * 7 + 3) % pool.length];
}

/** מחרוזת תאריך יציבה (YYYY-MM-DD) בזמן מקומי. */
export function dateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
