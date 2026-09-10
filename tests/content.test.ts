import { describe, expect, it } from "vitest";
import { findLocalContent, getAllPlants } from "../src/lib/content";
import type { IdentifyCandidate } from "../src/types";

function candidate(scientificName: string, genus = ""): IdentifyCandidate {
  return { scientificName, genus, commonNames: [], score: 0.9 };
}

describe("findLocalContent", () => {
  it("מוצא התאמה מדויקת לפי שם מדעי מלא", () => {
    const c = findLocalContent(candidate("Olea europaea"));
    expect(c?.id).toBe("olive");
    expect(c?.hebrewName).toContain("זַיִת");
  });

  it("מתעלם מאותיות גדולות/קטנות", () => {
    expect(findLocalContent(candidate("olea EUROPAEA"))?.id).toBe("olive");
  });

  it("נופל להתאמה לפי סוג (genus) כשאין התאמה מדויקת", () => {
    // מין שלא קיים במסד, אבל הסוג Citrus כן קיים
    const c = findLocalContent(candidate("Citrus reticulata"));
    expect(c?.genus).toBe("Citrus");
  });

  it("מחזיר null כשאין שום התאמה", () => {
    expect(findLocalContent(candidate("Zzz nonexistus", "Zzz"))).toBeNull();
  });

  it("מזהה את הגבסנית בעברית מהמסד המקומי (במקום שם לטיני)", () => {
    const c = findLocalContent(candidate("Gypsophila paniculata"));
    expect(c?.id).toBe("gypsophila");
    expect(/[֐-׿]/.test(c!.hebrewName)).toBe(true);
  });
});

describe("getAllPlants", () => {
  it("מחזיר רשימה לא ריקה עם שדות תקינים", () => {
    const all = getAllPlants();
    expect(all.length).toBeGreaterThan(20);
    for (const p of all) {
      expect(p.id).toBeTruthy();
      expect(p.hebrewName).toBeTruthy();
      expect(p.facts.length).toBeGreaterThan(0);
    }
  });

  it("לכל הצמחים יש מזהה ייחודי", () => {
    const ids = getAllPlants().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
