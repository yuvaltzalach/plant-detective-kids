import { beforeEach, describe, expect, it } from "vitest";
import {
  addPlayer,
  ensureActivePlayer,
  getActivePlayerId,
  loadProgressFor,
  removePlayer,
  saveProgressFor
} from "../src/lib/players";
import { emptyState, recordFind } from "../src/lib/progress";
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
