import { describe, expect, it } from "vitest";
import { challengeForDate, seasonOf, type Challenge } from "../src/data/challenges";
import { emptyState, recordFind } from "../src/lib/progress";
import type { PlantCategory, PlantResult } from "../src/types";

function find(collectId: string, category: PlantCategory = "עץ"): PlantResult {
  return {
    hebrewName: "צמח",
    emoji: "🌱",
    category,
    scientificName: "Testus",
    facts: ["x"],
    score: 1,
    source: "generic",
    collectId
  };
}

const day = new Date(2026, 4, 5);

describe("challengeForDate", () => {
  it("אותו תאריך = אותו אתגר (בכל שעה ביום, ולכן בכל המכשירים)", () => {
    const morning = challengeForDate(new Date(2026, 4, 5, 7, 0));
    const night = challengeForDate(new Date(2026, 4, 5, 23, 30));
    expect(morning.id).toBe(night.id);
  });

  it("מתחלף בין ימים ומגוון לאורך חודש", () => {
    const ids = new Set<string>();
    for (let d = 1; d <= 30; d++) ids.add(challengeForDate(new Date(2026, 5, d)).id);
    expect(ids.size).toBeGreaterThan(10);
    expect(challengeForDate(new Date(2026, 5, 1)).id).not.toBe(challengeForDate(new Date(2026, 5, 2)).id);
  });

  it("אתגר עונתי מופיע רק בעונה שלו", () => {
    for (let d = 0; d < 365; d++) {
      const date = new Date(2026, 0, 1 + d);
      const c = challengeForDate(date);
      if (c.seasons) expect(c.seasons).toContain(seasonOf(date));
    }
  });
});

describe("השלמת האתגר היומי", () => {
  it("אתגר קטגוריה נחשב רק בזיהוי מהקטגוריה", () => {
    const c: Challenge = { id: "t", text: "", emoji: "", category: "עץ" };
    expect(recordFind(emptyState(), find("a", "פרח"), day, c).challengeCompletedNow).toBe(false);
    expect(recordFind(emptyState(), find("a", "עץ"), day, c).challengeCompletedNow).toBe(true);
  });

  it("אתגר של כמה זיהויים מושלם רק בזיהוי האחרון", () => {
    const c: Challenge = { id: "t", text: "", emoji: "", count: 3 };
    let s = emptyState();
    const done: boolean[] = [];
    for (const id of ["a", "b", "c"]) {
      const out = recordFind(s, find(id), day, c);
      s = out.state;
      done.push(out.challengeCompletedNow);
    }
    expect(done).toEqual([false, false, true]);
  });

  it("אתגר 'צמח חדש' לא מושלם בצמח שכבר יש באלבום", () => {
    const c: Challenge = { id: "t", text: "", emoji: "", newOnly: true };
    const yesterday = new Date(2026, 4, 4);
    const had = recordFind(emptyState(), find("olive"), yesterday, { id: "x", text: "", emoji: "", category: "פרח" }).state;
    expect(recordFind(had, find("olive"), day, c).challengeCompletedNow).toBe(false);
    expect(recordFind(had, find("fig"), day, c).challengeCompletedNow).toBe(true);
  });

  it("המונה מתאפס ביום חדש", () => {
    const c: Challenge = { id: "t", text: "", emoji: "", count: 2 };
    const s = recordFind(emptyState(), find("a"), new Date(2026, 4, 4), c).state;
    expect(recordFind(s, find("b"), day, c).challengeCompletedNow).toBe(false);
  });
});
