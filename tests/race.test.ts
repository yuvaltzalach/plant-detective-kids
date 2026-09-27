import { describe, expect, it } from "vitest";
import { getAllPlants } from "../src/lib/content";
import {
  MAX_POINTS_PER_MISSION,
  POINTS_CORRECT,
  generateMissions,
  huntSucceeded,
  isRaceOver,
  pointsForAnswer,
  rankResults,
  type Race,
  type RaceResult
} from "../src/lib/race";

const plants = getAllPlants();
const byId = new Map(plants.map((p) => [p.id, p]));

function result(id: string, score: number, done: number, finishedAt?: number): RaceResult {
  return { id, name: id, avatar: "🌱", score, done, total: 5, finishedAt, updatedAt: 0 };
}

describe("generateMissions", () => {
  it("מייצר רצף משימות באורך המבוקש, עם צמחים שקיימים במסד", () => {
    const missions = generateMissions(plants, 10, false);
    expect(missions).toHaveLength(10);
    for (const m of missions) {
      expect(m.kind).not.toBe("hunt");
      if ("plantId" in m) expect(byId.has(m.plantId)).toBe(true);
    }
  });

  it("בשאלות בחירה — התשובה הנכונה תמיד בין 4 האפשרויות, בלי כפילויות", () => {
    for (let i = 0; i < 20; i++) {
      for (const m of generateMissions(plants, 10, false)) {
        if (m.kind === "pic" || m.kind === "name") {
          expect(m.options).toHaveLength(4);
          expect(m.options).toContain(m.plantId);
          expect(new Set(m.options).size).toBe(4);
        }
      }
    }
  });

  it("כולל משימת צילום אחת לכל 5 משימות, לא בהתחלה", () => {
    const missions = generateMissions(plants, 10, true);
    const hunts = missions.map((m, i) => ({ m, i })).filter(({ m }) => m.kind === "hunt");
    expect(hunts).toHaveLength(2);
    expect(hunts.every(({ i }) => i > 0)).toBe(true);
  });

  it("מגביל את מספר המשימות בין 3 ל-20", () => {
    expect(generateMissions(plants, 1, false)).toHaveLength(3);
    expect(generateMissions(plants, 99, false)).toHaveLength(20);
  });
});

describe("pointsForAnswer", () => {
  it("תשובה שגויה = 0, תשובה מהירה מקבלת בונוס, איטית רק את הבסיס", () => {
    expect(pointsForAnswer(false, 1)).toBe(0);
    expect(pointsForAnswer(true, 0)).toBe(MAX_POINTS_PER_MISSION);
    expect(pointsForAnswer(true, 60)).toBe(POINTS_CORRECT);
    expect(pointsForAnswer(true, 5)).toBeGreaterThan(pointsForAnswer(true, 15));
  });
});

describe("huntSucceeded", () => {
  it("בודק שהצמח שצולם מהקטגוריה המבוקשת", () => {
    const hunt = { kind: "hunt" as const, category: "עץ" as const, text: "", emoji: "" };
    expect(huntSucceeded(hunt, "עץ")).toBe(true);
    expect(huntSucceeded(hunt, "פרח")).toBe(false);
    expect(huntSucceeded({ ...hunt, category: undefined }, "פרח")).toBe(true);
  });
});

describe("rankResults", () => {
  it("מדרג לפי נקודות כולל בונוס למי שסיים ראשון", () => {
    const ranked = rankResults([
      result("slow", 500, 5, 2000),
      result("fast", 480, 5, 1000),
      result("mid", 300, 3)
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["fast", "slow", "mid"]);
    expect(ranked[0].finishPlace).toBe(1);
    expect(ranked[0].totalPoints).toBe(540);
    expect(ranked[1].totalPoints).toBe(540);
    expect(ranked[2].finishPlace).toBeUndefined();
  });
});

describe("isRaceOver", () => {
  const race: Race = { id: "r", missions: [], startedAt: 0 };
  it("נגמר כשכל חברי הקבוצה סיימו או כשנסגר ידנית", () => {
    const results = [result("a", 1, 5, 10), result("b", 1, 2)];
    expect(isRaceOver(race, results, ["a", "b"])).toBe(false);
    expect(isRaceOver(race, results, ["a"])).toBe(true);
    expect(isRaceOver({ ...race, endedAt: 5 }, results, ["a", "b"])).toBe(true);
  });
});
