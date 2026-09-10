export type PlantCategory = "עץ" | "פרח" | "עשב" | "צמח";

/** רשומת תוכן עברי לצמח (מתוך מסד התוכן המקומי). */
export interface PlantContent {
  id: string;
  hebrewName: string;
  emoji: string;
  category: PlantCategory;
  /** שם מדעי בלטינית (species) */
  scientificName: string;
  /** שם הסוג (genus) — לגיבוי כשאין התאמה מדויקת */
  genus: string;
  /** עובדות קצרות ומהנות לילדים */
  facts: string[];
  /** האם הצמח עלול להיות מזיק (למשל רעיל למגע/אכילה) — להצגת אזהרה ידידותית */
  caution?: string;
}

/** מועמד יחיד שחוזר ממנוע הזיהוי (Pl@ntNet). */
export interface IdentifyCandidate {
  scientificName: string;
  genus: string;
  commonNames: string[];
  /** ציון ביטחון 0..1 */
  score: number;
  imageUrl?: string;
}

/** תוצאת זיהוי מלאה אחרי העשרה לעברית — מה שהמסך מציג. */
export interface PlantResult {
  hebrewName: string;
  emoji: string;
  category: PlantCategory;
  scientificName: string;
  facts: string[];
  caution?: string;
  score: number;
  imageUrl?: string;
  /** מקור התוכן: מסד מקומי / ויקיפדיה / כללי */
  source: "local" | "wikipedia" | "generic";
  /** מזהה יציב לשמירה באלבום (ה-id המקומי, או שם מדעי/סוג) */
  collectId: string;
}

/** מדבקה שנאספה לאלבום. */
export interface CollectedSticker {
  collectId: string;
  hebrewName: string;
  emoji: string;
  category: PlantCategory;
  firstFoundAt: number;
  timesFound: number;
}

export interface EarnedBadge {
  id: string;
  earnedAt: number;
}

/** מצב ההתקדמות של הילד, נשמר ב-localStorage. */
export interface ProgressState {
  version: number;
  points: number;
  stickers: Record<string, CollectedSticker>;
  badges: EarnedBadge[];
  /** תאריך (YYYY-MM-DD) של השלמת האתגר היומי האחרונה */
  lastChallengeDate?: string;
  challengeStreak: number;
  /** תאריך היום שאליו מתייחס המונה, וכמה זיהויים נעשו בו (למעקב אתגר) */
  todayDate?: string;
  todayCount: number;
}

/** משתתף (פרופיל) על המכשיר — לתחרות בין ילדים באותו טלפון. */
export interface Player {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

/** אתגר מותאם שההורה כותב (למשל "מצאו פרח עם עלים צהובים"). */
export interface CustomChallenge {
  text: string;
  emoji: string;
  /** אם ההורה בחר קטגוריה — האתגר יסומן אוטומטית בזיהוי מתאים. אחרת סימון ידני. */
  category?: PlantCategory;
  createdAt: number;
}

/** הגדרות אפליקציה משותפות (לא תלויות משתתף). */
export interface AppSettings {
  customChallenge: CustomChallenge | null;
}
