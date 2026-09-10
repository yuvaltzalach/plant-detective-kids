// לוגיקת ההתקדמות הטהורה (בלי React) — קלה לבדיקה ביחידה.
import { BADGES } from "../data/badges";
import { challengeForDate, dateKey } from "../data/challenges";
import type { PlantResult, ProgressState } from "../types";

export const STORAGE_KEY = "plant-detective:v1";
const SCHEMA_VERSION = 1;

export const POINTS_NEW = 10;
export const POINTS_REPEAT = 3;
export const POINTS_CHALLENGE = 15;

export function emptyState(): ProgressState {
  return {
    version: SCHEMA_VERSION,
    points: 0,
    stickers: {},
    badges: [],
    challengeStreak: 0,
    todayCount: 0
  };
}

export function loadState(storage?: Storage): ProgressState {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : undefined);
  if (!store) return emptyState();
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveState(state: ProgressState, storage?: Storage) {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : undefined);
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* אחסון מלא/חסום — מתעלמים בשקט */
  }
}

/** תוצאת רישום זיהוי — משמשת את מסך התוצאה כדי לחגוג. */
export interface FindOutcome {
  state: ProgressState;
  isNew: boolean;
  pointsGained: number;
  newBadgeIds: string[];
  challengeCompletedNow: boolean;
}

function isYesterday(prev: string | undefined, today: string): boolean {
  if (!prev) return false;
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return dateKey(y) === prev;
}

/**
 * רושם זיהוי מוצלח: מוסיף מדבקה/נקודות, מעדכן אתגר יומי ורצף, ומחשב תגים חדשים.
 * פונקציה טהורה — לא נוגעת ב-localStorage (זה באחריות הקורא).
 */
export function recordFind(
  prev: ProgressState,
  result: PlantResult,
  now = new Date()
): FindOutcome {
  const state: ProgressState = {
    ...prev,
    stickers: { ...prev.stickers },
    badges: [...prev.badges]
  };
  const today = dateKey(now);

  // איפוס מונה יומי אם התחלף היום
  if (state.todayDate !== today) {
    state.todayDate = today;
    state.todayCount = 0;
  }

  // מדבקה: חדשה או חוזרת
  const existing = state.stickers[result.collectId];
  const isNew = !existing;
  if (existing) {
    state.stickers[result.collectId] = {
      ...existing,
      timesFound: existing.timesFound + 1
    };
  } else {
    state.stickers[result.collectId] = {
      collectId: result.collectId,
      hebrewName: result.hebrewName,
      emoji: result.emoji,
      category: result.category,
      firstFoundAt: now.getTime(),
      timesFound: 1
    };
  }

  let pointsGained = isNew ? POINTS_NEW : POINTS_REPEAT;
  state.todayCount += 1;

  // אתגר יומי
  const challenge = challengeForDate(now);
  const alreadyDoneToday = state.lastChallengeDate === today;
  let challengeCompletedNow = false;
  if (!alreadyDoneToday) {
    const matches = challenge.category
      ? result.category === challenge.category
      : challenge.id === "two"
        ? state.todayCount >= 2
        : true;
    if (matches) {
      challengeCompletedNow = true;
      pointsGained += POINTS_CHALLENGE;
      state.challengeStreak = isYesterday(state.lastChallengeDate, today)
        ? state.challengeStreak + 1
        : 1;
      state.lastChallengeDate = today;
    }
  }

  state.points = prev.points + pointsGained;

  // תגים חדשים
  const owned = new Set(state.badges.map((b) => b.id));
  const newBadgeIds: string[] = [];
  for (const badge of BADGES) {
    if (!owned.has(badge.id) && badge.check(state)) {
      newBadgeIds.push(badge.id);
      state.badges.push({ id: badge.id, earnedAt: now.getTime() });
    }
  }

  return { state, isNew, pointsGained, newBadgeIds, challengeCompletedNow };
}

/** רמה נגזרת מהנקודות (כל 50 נקודות = רמה). */
export function levelForPoints(points: number): { level: number; toNext: number; inLevel: number } {
  const per = 50;
  const level = Math.floor(points / per) + 1;
  const inLevel = points % per;
  return { level, toNext: per - inLevel, inLevel };
}
