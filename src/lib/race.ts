// "מרוץ משימות" — תחרות קבוצתית בין מכשירים: רצף משימות זהה לכולם, נקודות על כל
// תשובה נכונה (עם בונוס מהירות), ובונוס למי שמסיים ראשון. לוגיקה טהורה — נבדקת בטסטים.
import { sample, shuffle } from "./shuffle";
import type { PlantCategory, PlantContent } from "../types";

export type Mission =
  /** רואים תמונה — בוחרים את השם הנכון */
  | { kind: "pic"; plantId: string; options: string[] }
  /** רואים שם — בוחרים את התמונה הנכונה */
  | { kind: "name"; plantId: string; options: string[] }
  /** נכון או לא נכון: עובדה על הצמח */
  | { kind: "tf"; plantId: string; statement: string; isTrue: boolean }
  /** לאיזו קבוצה שייך הצמח: עץ / פרח / עשב / צמח */
  | { kind: "cat"; plantId: string }
  /** משימת שטח: לצאת, למצוא ולצלם צמח (מאומת בזיהוי התמונה) */
  | { kind: "hunt"; category?: PlantCategory; text: string; emoji: string };

export interface Race {
  id: string;
  missions: Mission[];
  by?: string;
  startedAt: number;
  endedAt?: number;
}

export interface RaceResult {
  id: string;
  name: string;
  avatar: string;
  score: number;
  done: number;
  total: number;
  finishedAt?: number;
  updatedAt: number;
}

export interface RankedResult extends RaceResult {
  /** מקום בסיום (1 = סיים ראשון), רק למי שסיים */
  finishPlace?: number;
  finishBonus: number;
  totalPoints: number;
}

export const CATEGORIES: PlantCategory[] = ["עץ", "פרח", "עשב", "צמח"];

export const POINTS_CORRECT = 100;
export const MAX_SPEED_BONUS = 50;
/** אחרי כמה שניות בונוס המהירות מתאפס */
export const SPEED_WINDOW_SEC = 20;
export const POINTS_HUNT = 150;
export const FINISH_BONUS = [60, 40, 20];

/** הניקוד המקסימלי למשימה — משמש גם את השרת לבדיקת סבירות. */
export const MAX_POINTS_PER_MISSION = Math.max(POINTS_CORRECT + MAX_SPEED_BONUS, POINTS_HUNT);

export function pointsForAnswer(correct: boolean, seconds: number): number {
  if (!correct) return 0;
  const left = Math.max(0, SPEED_WINDOW_SEC - seconds) / SPEED_WINDOW_SEC;
  return POINTS_CORRECT + Math.round(MAX_SPEED_BONUS * left);
}

const HUNTS: { category?: PlantCategory; text: string; emoji: string }[] = [
  { category: "עץ", text: "צאו ומצאו עץ וצלמו אותו!", emoji: "🌳" },
  { category: "פרח", text: "מצאו פרח וצלמו אותו!", emoji: "🌸" },
  { category: "עשב", text: "מצאו עשב או תבלין וצלמו אותו!", emoji: "🌿" },
  { text: "צלמו צמח כלשהו שעוד לא הכרתם!", emoji: "📷" }
];

function pickOthers(plants: PlantContent[], target: PlantContent, n: number): PlantContent[] {
  const others = plants.filter((p) => p.id !== target.id && p.hebrewName !== target.hebrewName);
  // מעדיפים מסיחים מאותה קטגוריה כדי שהשאלה לא תהיה קלה מדי
  const same = others.filter((p) => p.category === target.category);
  const pool = same.length >= n ? same : others;
  return sample(pool, n);
}

function makeQuestion(kind: "pic" | "name" | "tf" | "cat", target: PlantContent, plants: PlantContent[]): Mission {
  if (kind === "pic" || kind === "name") {
    const options = shuffle([target, ...pickOthers(plants, target, 3)]).map((p) => p.id);
    return { kind, plantId: target.id, options };
  }
  if (kind === "tf") {
    const isTrue = Math.random() < 0.5;
    const source = isTrue
      ? target
      : (shuffle(plants.filter((p) => p.category !== target.category))[0] ?? target);
    const statement = source.facts[Math.floor(Math.random() * source.facts.length)];
    return { kind: "tf", plantId: target.id, statement, isTrue: source.id === target.id };
  }
  return { kind: "cat", plantId: target.id };
}

/**
 * מייצר רצף משימות למרוץ. המכשיר שפותח את המרוץ מייצר את הרשימה ושומר אותה בשרת,
 * כך שכל המשתתפים מקבלים בדיוק את אותן משימות באותו סדר.
 */
export function generateMissions(
  plants: PlantContent[],
  count: number,
  withHunts: boolean
): Mission[] {
  const n = Math.max(3, Math.min(20, Math.round(count)));
  const targets = sample(plants, n);
  const kinds: ("pic" | "name" | "tf" | "cat")[] = ["pic", "name", "tf", "cat"];
  const missions: Mission[] = targets.map((t, i) => makeQuestion(kinds[i % kinds.length], t, plants));
  const shuffled = shuffle(missions);

  if (withHunts) {
    // משימת צילום אחת לכל 5 משימות, מפוזרות לאורך המרוץ (לא בהתחלה)
    const hunts = Math.max(1, Math.floor(n / 5));
    const picked = sample(HUNTS, hunts);
    picked.forEach((h, i) => {
      const at = Math.min(n - 1, Math.floor(((i + 1) * n) / (hunts + 1)));
      shuffled[at] = { kind: "hunt", ...h };
    });
  }
  return shuffled;
}

/** האם משימת צילום הצליחה לפי קטגוריית הצמח שזוהה. */
export function huntSucceeded(mission: Extract<Mission, { kind: "hunt" }>, found: PlantCategory): boolean {
  return !mission.category || mission.category === found;
}

/**
 * מדרג את התוצאות: סה"כ נקודות (כולל בונוס סיום לפי סדר הסיום) — מהגבוה לנמוך.
 * בשוויון — מי שסיים קודם, ואז מי שהתקדם יותר.
 */
export function rankResults(results: RaceResult[]): RankedResult[] {
  const finishers = results
    .filter((r) => r.finishedAt)
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));
  const placeOf = new Map(finishers.map((r, i) => [r.id, i + 1]));

  return results
    .map((r) => {
      const finishPlace = placeOf.get(r.id);
      const finishBonus = finishPlace ? (FINISH_BONUS[finishPlace - 1] ?? 0) : 0;
      return { ...r, finishPlace, finishBonus, totalPoints: r.score + finishBonus };
    })
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        (a.finishedAt ?? Infinity) - (b.finishedAt ?? Infinity) ||
        b.done - a.done
    );
}

/** המרוץ הסתיים: נסגר ידנית, או שכל חברי הקבוצה (שמופיעים בטבלה) סיימו. */
export function isRaceOver(race: Race, results: RaceResult[], memberIds: string[]): boolean {
  if (race.endedAt) return true;
  if (memberIds.length === 0) return false;
  const finished = new Set(results.filter((r) => r.finishedAt).map((r) => r.id));
  return memberIds.every((id) => finished.has(id));
}
