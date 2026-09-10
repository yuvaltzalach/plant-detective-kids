import { beforeEach, describe, expect, it } from "vitest";
import {
  activeChallenge,
  addPlayer,
  ensureActivePlayer,
  getActivePlayerId,
  loadProgressFor,
  removePlayer,
  saveProgressFor
} from "../src/lib/players";
import {
  completeChallengeManually,
  emptyState,
  recordFind
} from "../src/lib/progress";
import type { PlantResult } from "../src/types";

function makeResult(collectId: string): PlantResult {
  return {
    hebrewName: "בדיקה",
    emoji: "🌱",
    category: "פרח",
    scientificName: "Testus",
    facts: ["x"],
    score: 1,
    source: "generic",
    collectId
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("players store", () => {
  it("יוצר משתתף פעיל כברירת מחדל", () => {
    const players = ensureActivePlayer();
    expect(players.length).toBe(1);
    expect(getActivePlayerId()).toBe(players[0].id);
  });

  it("שומר התקדמות נפרדת לכל משתתף", () => {
    const a = addPlayer("א", "🦊");
    const b = addPlayer("ב", "🐼");
    saveProgressFor(a.id, recordFind(emptyState(), makeResult("olive")).state);
    expect(loadProgressFor(a.id).points).toBeGreaterThan(0);
    expect(loadProgressFor(b.id).points).toBe(0);
  });

  it("מחיקת משתתף מוחקת גם את ההתקדמות שלו", () => {
    const a = addPlayer("א", "🦊");
    addPlayer("ב", "🐼");
    saveProgressFor(a.id, recordFind(emptyState(), makeResult("rose")).state);
    removePlayer(a.id);
    expect(loadProgressFor(a.id).points).toBe(0);
  });
});

describe("custom parent challenge", () => {
  it("אתגר טקסט חופשי לא מסומן אוטומטית בזיהוי", () => {
    const challenge = activeChallenge({
      customChallenge: { text: "מצאו פרח צהוב", emoji: "🟡", createdAt: 0 }
    });
    expect(challenge.manual).toBe(true);
    const out = recordFind(emptyState(), makeResult("x"), new Date(2026, 4, 5), challenge);
    expect(out.challengeCompletedNow).toBe(false);
  });

  it("סימון ידני משלים את האתגר ומעניק נקודות", () => {
    const out = completeChallengeManually(emptyState(), new Date(2026, 4, 5));
    expect(out.challengeCompletedNow).toBe(true);
    expect(out.pointsGained).toBeGreaterThan(0);
    expect(out.state.challengeStreak).toBe(1);
  });

  it("אתגר מותאם עם קטגוריה מסומן אוטומטית בזיהוי מתאים", () => {
    const challenge = activeChallenge({
      customChallenge: { text: "מצאו עץ", emoji: "🌳", category: "עץ", createdAt: 0 }
    });
    expect(challenge.manual).toBeFalsy();
    const tree = { ...makeResult("y"), category: "עץ" as const };
    const out = recordFind(emptyState(), tree, new Date(2026, 4, 5), challenge);
    expect(out.challengeCompletedNow).toBe(true);
  });
});
