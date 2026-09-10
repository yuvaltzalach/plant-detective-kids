// לוגיקת ההתקדמות הטהורה (בלי React) — קלה לבדיקה ביחידה.
import { BADGES } from "../data/badges";
import { challengeForDate, dateKey, type Challenge } from "../data/challenges";
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

function getStore(storage?: Storage): Storage | undefined {
  return storage ?? (typeof localStorage !== "undefined" ? localStorage : undefined);
}

/** טוען מצב התקדמות ממפתח אחסון כלשהו (משמש גם לפר-משתתף). */
export function loadStateFrom(key: string, storage?: Storage): ProgressState {
  const store = getStore(storage);
  if (!store) return emptyState();
  try {
    const raw = store.getItem(key);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveStateTo(key: string, state: ProgressState, storage?: Storage) {
  const store = getStore(storage);
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(state));
  } catch {
    /* אחסון מלא/חסום — מתעלמים בשקט */
  }
}

export function loadState(storage?: Storage): ProgressState {
  return loadStateFrom(STORAGE_KEY, storage);
}

export function saveState(state: ProgressState, storage?: Storage) {
  saveStateTo(STORAGE_KEY, state, storage);
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

/** מסמן את האתגר של היום כהושלם: נקודות בונוס + עדכון רצף. משנה את state במקום. */
function applyChallengeCompletion(state: ProgressState, today: string): number {
  state.challengeStreak = isYesterday(state.lastChallengeDate, today)
    ? state.challengeStreak + 1
    : 1;
  state.lastChallengeDate = today;
  return POINTS_CHALLENGE;
}

/** מוסיף לרשימת התגים כל תג חדש שהושג, ומחזיר את המזהים החדשים. */
function grantNewBadges(state: ProgressState, at: number): string[] {
  const owned = new Set(state.badges.map((b) => b.id));
  const newBadgeIds: string[] = [];
  for (const badge of BADGES) {
    if (!owned.has(badge.id) && badge.check(state)) {
      newBadgeIds.push(badge.id);
      state.badges.push({ id: badge.id, earnedAt: at });
    }
  }
  return newBadgeIds;
}

/**
 * רושם זיהוי מוצלח: מוסיף מדבקה/נקודות, מעדכן את האתגר הפעיל ורצף, ומחשב תגים חדשים.
 * `challenge` הוא האתגר הפעיל (יומי או מותאם על-ידי הורה). פונקציה טהורה.
 */
export function recordFind(
  prev: ProgressState,
  result: PlantResult,
  now = new Date(),
  challenge: Challenge = challengeForDate(now)
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

  // האתגר הפעיל
  const alreadyDoneToday = state.lastChallengeDate === today;
  let challengeCompletedNow = false;
  if (!alreadyDoneToday) {
    // אתגר עם סימון ידני (טקסט חופשי של הורה) לא מסומן אוטומטית על-ידי זיהוי
    const matches = challenge.manual
      ? false
      : challenge.category
        ? result.category === challenge.category
        : challenge.id === "two"
          ? state.todayCount >= 2
          : true;
    if (matches) {
      challengeCompletedNow = true;
      pointsGained += applyChallengeCompletion(state, today);
    }
  }

  state.points = prev.points + pointsGained;
  const newBadgeIds = grantNewBadges(state, now.getTime());

  return { state, isNew, pointsGained, newBadgeIds, challengeCompletedNow };
}

/** סימון ידני של השלמת אתגר (למשל אתגר טקסט חופשי של הורה). פונקציה טהורה. */
export function completeChallengeManually(
  prev: ProgressState,
  now = new Date()
): FindOutcome {
  const state: ProgressState = {
    ...prev,
    stickers: { ...prev.stickers },
    badges: [...prev.badges]
  };
  const today = dateKey(now);
  if (state.lastChallengeDate === today) {
    return { state, isNew: false, pointsGained: 0, newBadgeIds: [], challengeCompletedNow: false };
  }
  const pointsGained = applyChallengeCompletion(state, today);
  state.points = prev.points + pointsGained;
  const newBadgeIds = grantNewBadges(state, now.getTime());
  return { state, isNew: false, pointsGained, newBadgeIds, challengeCompletedNow: true };
}

/** רמה נגזרת מהנקודות (כל 50 נקודות = רמה). */
export function levelForPoints(points: number): { level: number; toNext: number; inLevel: number } {
  const per = 50;
  const level = Math.floor(points / per) + 1;
  const inLevel = points % per;
  return { level, toNext: per - inLevel, inLevel };
}
