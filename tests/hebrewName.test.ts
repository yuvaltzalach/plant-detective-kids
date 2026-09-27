import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enrichToResult } from "../src/lib/content";
import type { IdentifyCandidate } from "../src/types";

type Routes = Record<string, unknown>;

/** fetch מדומה: מחזיר JSON לפי קטע מה-URL. */
function mockFetch(routes: Routes) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const u = decodeURIComponent(String(url));
      for (const [part, body] of Object.entries(routes)) {
        if (u.endsWith(part)) return new Response(JSON.stringify(body), { status: 200 });
      }
      return new Response("{}", { status: 404 });
    })
  );
}

const candidate = (scientificName: string, commonNames: string[] = []): IdentifyCandidate => ({
  scientificName,
  genus: scientificName.split(" ")[0],
  commonNames,
  score: 0.8
});

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("enrichToResult — תמיד שם בעברית", () => {
  it("מתרגם דרך הקישור מוויקיפדיה האנגלית לעברית, עם עובדות מהערך העברי", async () => {
    mockFetch({
      "titles=Bellis annua": { query: { pages: [{ langlinks: [{ lang: "he", title: "חיננית קטנה" }] }] } },
      "summary/חיננית_קטנה": { title: "חיננית קטנה", extract: "חיננית קטנה היא צמח חד-שנתי ממשפחת המורכבים. היא פורחת בחורף." }
    });
    const r = await enrichToResult(candidate("Bellis annua", ["Annual daisy"]));
    expect(r.hebrewName).toBe("חיננית קטנה");
    expect(r.source).toBe("wikipedia");
    expect(r.facts[0]).toContain("חד-שנתי");
  });

  it("משתמש בתווית העברית של ויקידאטה כשאין ערך בוויקיפדיה", async () => {
    mockFetch({
      "haswbstatement:P225=\"Silene colorata\"": { query: { search: [{ title: "Q123" }] } },
      "ids=Q123": { entities: { Q123: { labels: { he: { value: "ציפורנית מגוונת" } } } } }
    });
    const r = await enrichToResult(candidate("Silene colorata", ["Showy catchfly"]));
    expect(r.hebrewName).toBe("ציפורנית מגוונת");
  });

  it("בלי תרגום למין — נותן את שם הסוג בעברית", async () => {
    mockFetch({
      "titles=Zzzia": { query: { pages: [{ langlinks: [{ lang: "he", title: "זזיה" }] }] } }
    });
    const r = await enrichToResult(candidate("Zzzia unknownii", ["Weird plant"]));
    expect(r.hebrewName).toBe("מין של זזיה");
  });

  it("אף פעם לא מציג שם באנגלית או לטינית", async () => {
    mockFetch({});
    const r = await enrichToResult(candidate("Zzzia unknownii", ["Weird plant"]));
    expect(r.hebrewName).toBe("צמח מסתורי");
    expect(/[A-Za-z]/.test(r.hebrewName)).toBe(false);
  });

  it("מעדיף שם עברי שהגיע ממנוע הזיהוי כשאין תרגום אחר", async () => {
    mockFetch({});
    const r = await enrichToResult(candidate("Zzzia unknownii", ["Weird plant", "צמח מוזר"]));
    expect(r.hebrewName).toBe("צמח מוזר");
  });
});
