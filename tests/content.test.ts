import { describe, expect, it } from "vitest";
import { findLocalContent, getAllPlants } from "../src/lib/content";
import { imageLookupOrder } from "../src/lib/images";
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

  it("נופל להתאמה לפי סוג (genus) כשיש במסד מין אחד בלבד מהסוג", () => {
    // מין שלא קיים במסד, אבל הסוג Punica קיים עם מין יחיד
    const c = findLocalContent(candidate("Punica protopunica"));
    expect(c?.id).toBe("pomegranate");
  });

  it("לא מנחש מין אחר כשיש כמה מינים מאותו סוג", () => {
    // יש כמה מיני אלון במסד — לא נציג שם של אלון אחר לצמח שצולם
    expect(findLocalContent(candidate("Quercus robur"))).toBeNull();
  });

  it("מתאים שמות עם סימן הכלאה ועם שם המחבר", () => {
    expect(findLocalContent(candidate("Citrus paradisi"))?.id).toBe("grapefruit");
    expect(findLocalContent(candidate("Olea europaea L."))?.id).toBe("olive");
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

  it("יש 500 צמחים, כל אחד עם קטגוריה תקינה ושלוש עובדות", () => {
    const all = getAllPlants();
    expect(all.length).toBe(500);
    for (const p of all) {
      expect(["עץ", "פרח", "עשב", "צמח"]).toContain(p.category);
      expect(p.facts.length).toBe(3);
      expect(p.scientificName.split(" ")[0]).toBe(p.genus);
    }
  });

  it("אין שני צמחים עם אותו שם מדעי או אותו שם עברי", () => {
    const all = getAllPlants();
    const sci = all.map((p) => p.scientificName.toLowerCase());
    const he = all.map((p) => p.hebrewName.replace(/[\u0591-\u05C7]/g, ""));
    expect(new Set(sci).size).toBe(sci.length);
    expect(new Set(he).size).toBe(he.length);
  });

  it("לכל הצמחים יש מזהה ייחודי", () => {
    const ids = getAllPlants().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("imageLookupOrder", () => {
  const byId = (id: string) => getAllPlants().find((p) => p.id === id)!;

  it("מעדיף כותרת ויקיפדיה מפורשת כשהשם המדעי דו-משמעי", () => {
    // "Adonis" לבד הוא ערך על האל היווני — לכן יש כותרת מפורשת
    expect(imageLookupOrder(byId("adonis"))[0]).toEqual({ lang: "en", title: "Adonis (plant)" });
  });

  it("מתחיל מהשם המדעי המלא ולא מחיפוש כללי", () => {
    expect(imageLookupOrder(byId("anemone"))[0]).toEqual({ lang: "en", title: "Anemone coronaria" });
  });

  it("לא מחפש בוויקיפדיה העברית לפי מילה בודדת דו-משמעית (כמו 'רימון')", () => {
    const steps = imageLookupOrder(byId("pomegranate"));
    expect(steps.some((s) => s.lang === "he" && s.title === "רימון")).toBe(false);
  });
});
