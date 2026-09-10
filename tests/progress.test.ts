import { describe, expect, it } from "vitest";
import {
  emptyState,
  levelForPoints,
  POINTS_NEW,
  POINTS_REPEAT,
  recordFind
} from "../src/lib/progress";
import { challengeForDate } from "../src/data/challenges";
import type { PlantCategory, PlantResult, ProgressState } from "../src/types";

function makeResult(collectId: string, category: PlantCategory = "עץ"): PlantResult {
  return {
    hebrewName: "צמח בדיקה",
    emoji: "🌱",
    category,
    scientificName: "Testus plantus",
    facts: ["עובדה"],
    score: 1,
    source: "generic",
    collectId
  };
}

/** משלים את האתגר היומי של תאריך נתון ומחזיר את המצב. */
function completeDay(state: ProgressState, date: Date, seed: string): ProgressState {
  const cat = challengeForDate(date).category ?? "עץ";
  let s = state;
  for (let i = 0; i < 5; i++) {
    const out = recordFind(s, makeResult(`${seed}-${i}`, cat), date);
    s = out.state;
    if (out.challengeCompletedNow) break;
  }
  return s;
}

describe("recordFind", () => {
  it("מוסיף מדבקה חדשה ונקודות על זיהוי ראשון", () => {
    const out = recordFind(emptyState(), makeResult("olive"), new Date(2026, 4, 5));
    expect(out.isNew).toBe(true);
    expect(out.state.stickers["olive"]).toBeTruthy();
    expect(out.state.stickers["olive"].timesFound).toBe(1);
    expect(out.pointsGained).toBeGreaterThanOrEqual(POINTS_NEW);
    expect(out.newBadgeIds).toContain("first-find");
  });

  it("זיהוי חוזר נותן פחות נקודות ומעלה מונה, בלי מדבקה חדשה", () => {
    let s = recordFind(emptyState(), makeResult("olive"), new Date(2026, 4, 5)).state;
    const before = s.points;
    const out = recordFind(s, makeResult("olive"), new Date(2026, 4, 5));
    expect(out.isNew).toBe(false);
    expect(out.state.stickers["olive"].timesFound).toBe(2);
    // ההפרש כולל לכל היותר את נקודות הזיהוי החוזר (האתגר כבר הושלם היום)
    expect(out.state.points - before).toBeLessThanOrEqual(POINTS_REPEAT + 15);
    expect(out.state.points - before).toBeGreaterThanOrEqual(POINTS_REPEAT);
  });

  it("משלים אתגר יומי ומעניק נקודות בונוס פעם אחת ביום", () => {
    const date = new Date(2026, 4, 5);
    const cat = challengeForDate(date).category ?? "עץ";
    const out1 = recordFind(emptyState(), makeResult("a", cat), date);
    // אם האתגר דורש 2 זיהויים, נשלים עוד אחד
    let state = out1.state;
    let completed = out1.challengeCompletedNow;
    if (!completed) {
      const out2 = recordFind(state, makeResult("b", cat), date);
      state = out2.state;
      completed = out2.challengeCompletedNow;
    }
    expect(completed).toBe(true);
    expect(state.lastChallengeDate).toBeTruthy();
    expect(state.challengeStreak).toBe(1);
  });

  it("שומר על רצף אתגרים בימים עוקבים", () => {
    let s = emptyState();
    s = completeDay(s, new Date(2026, 4, 5), "d1");
    expect(s.challengeStreak).toBe(1);
    s = completeDay(s, new Date(2026, 4, 6), "d2");
    expect(s.challengeStreak).toBe(2);
    // דילוג על יום מאפס את הרצף
    s = completeDay(s, new Date(2026, 4, 10), "d3");
    expect(s.challengeStreak).toBe(1);
  });

  it("מעניק תג עונתי לפי חודש המציאה", () => {
    let s = emptyState();
    const april = new Date(2026, 3, 10); // אביב
    for (let i = 0; i < 3; i++) {
      s = recordFind(s, makeResult(`spring-${i}`), april).state;
    }
    expect(s.badges.map((b) => b.id)).toContain("spring-bloom");
  });

  it("מעניק תגי אספן לפי מספר המדבקות", () => {
    let s = emptyState();
    const date = new Date(2026, 4, 5);
    for (let i = 0; i < 5; i++) {
      s = recordFind(s, makeResult(`plant-${i}`), date).state;
    }
    const ids = s.badges.map((b) => b.id);
    expect(ids).toContain("collector-5");
  });
});

describe("levelForPoints", () => {
  it("מחשב רמה כל 50 נקודות", () => {
    expect(levelForPoints(0).level).toBe(1);
    expect(levelForPoints(49).level).toBe(1);
    expect(levelForPoints(50).level).toBe(2);
    expect(levelForPoints(120).level).toBe(3);
  });
});
