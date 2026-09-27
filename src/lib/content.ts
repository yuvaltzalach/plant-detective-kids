import plantsData from "../data/plants.he.json";
import { hasHebrew, hebrewNameFor } from "./hebrewName";
import type {
  IdentifyCandidate,
  PlantCategory,
  PlantContent,
  PlantResult
} from "../types";

const PLANTS = plantsData as PlantContent[];

/** מנרמל שם מדעי להשוואה: אותיות קטנות, בלי סימן הכלאה (×) ובלי רווחים כפולים. */
function normSci(name: string): string {
  return name.toLowerCase().replace(/×/g, " ").replace(/\s+x\s+/g, " ").replace(/\s+/g, " ").trim();
}

// אינדקסים לחיפוש מהיר לפי שם מדעי מלא ולפי סוג (genus)
const byScientific = new Map<string, PlantContent>();
const byGenus = new Map<string, PlantContent[]>();
for (const p of PLANTS) {
  byScientific.set(normSci(p.scientificName), p);
  const g = p.genus.toLowerCase();
  byGenus.set(g, [...(byGenus.get(g) ?? []), p]);
}

function genusOf(candidate: IdentifyCandidate): string {
  const sci = candidate.scientificName?.toLowerCase().trim() ?? "";
  return (candidate.genus || sci.split(/\s+/)[0] || "").toLowerCase().trim();
}

/** כל הצמחים במסד המקומי — משמש להצגת האלבום עם המשבצות הריקות. */
export function getAllPlants(): PlantContent[] {
  return PLANTS;
}

/** התאמה מדויקת לפי השם המדעי (כולל תת-מין/זן או שם מחבר שנוספו לו). */
function findExactLocal(candidate: IdentifyCandidate): PlantContent | null {
  const sci = normSci(candidate.scientificName ?? "");
  if (sci && byScientific.has(sci)) return byScientific.get(sci)!;
  // Pl@ntNet לפעמים מחזיר גם תת-מין/זן ("Olea europaea subsp. ...") — משווים לפי שתי המילים הראשונות
  const binomial = sci.split(" ").slice(0, 2).join(" ");
  if (binomial && byScientific.has(binomial)) return byScientific.get(binomial)!;
  return null;
}

/** חיפוש תוכן עברי מקומי עבור מועמד זיהוי. מחזיר null אם אין התאמה. */
export function findLocalContent(candidate: IdentifyCandidate): PlantContent | null {
  const exact = findExactLocal(candidate);
  if (exact) return exact;

  // התאמה לפי הסוג (genus) — רק כשיש במסד מין אחד בלבד מהסוג הזה. אם יש כמה מינים
  // (למשל כמה סוגי אלון), הצגת אחד מהם הייתה נותנת שם לא נכון לצמח שצולם.
  const same = byGenus.get(genusOf(candidate));
  if (same && same.length === 1) return same[0];

  return null;
}

/** נציג מהסוג כשיש כמה מינים — משמש רק כגיבוי אחרון, אחרי שוויקיפדיה לא עזרה. */
function genusFallback(candidate: IdentifyCandidate): PlantContent | null {
  return byGenus.get(genusOf(candidate))?.[0] ?? null;
}

function toResultFromLocal(local: PlantContent, candidate: IdentifyCandidate): PlantResult {
  return {
    hebrewName: local.hebrewName,
    emoji: local.emoji,
    category: local.category,
    scientificName: local.scientificName,
    facts: local.facts,
    caution: local.caution,
    score: candidate.score,
    imageUrl: candidate.imageUrl,
    source: "local",
    collectId: local.id
  };
}

/** מפצל טקסט לחתיכות קצרות שמשמשות כ"עובדות". */
function splitToFacts(text: string, max = 3): string[] {
  return text
    .replace(/\([^)]*\)/g, "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, max);
}

interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  type?: string;
}

async function fetchWikipedia(title: string): Promise<WikiSummary | null> {
  try {
    const url =
      "https://he.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(title.replace(/\s+/g, "_"));
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    if (!data.extract || data.type === "disambiguation") return null;
    return data;
  } catch {
    return null;
  }
}

const GENERIC_FACTS = [
  "כל הכבוד! מצאת צמח מעניין 🌿",
  "כדאי להסתכל טוב על העלים, הפרחים והצבעים שלו.",
  "אפשר לצלם אותו שוב מזווית אחרת כדי ללמוד עוד."
];

function collectIdFor(candidate: IdentifyCandidate): string {
  const sci = candidate.scientificName?.toLowerCase().trim();
  return sci ? `sci:${sci}` : `name:${candidate.commonNames[0] ?? "unknown"}`;
}

/** תוצאה מוויקיפדיה העברית. `name` — השם העברי שיוצג (לא כותרת באנגלית). */
function toResultFromWiki(wiki: WikiSummary, candidate: IdentifyCandidate, name: string): PlantResult {
  const facts = splitToFacts(wiki.extract);
  return {
    hebrewName: name,
    emoji: "🌿",
    category: "צמח" as PlantCategory,
    scientificName: candidate.scientificName,
    facts: facts.length ? facts : GENERIC_FACTS,
    score: candidate.score,
    imageUrl: candidate.imageUrl ?? wiki.thumbnail?.source,
    source: "wikipedia",
    collectId: collectIdFor(candidate)
  };
}

function genericResult(candidate: IdentifyCandidate, name: string): PlantResult {
  return {
    hebrewName: name,
    emoji: "🌱",
    category: "צמח",
    scientificName: candidate.scientificName,
    facts: GENERIC_FACTS,
    score: candidate.score,
    imageUrl: candidate.imageUrl,
    source: "generic",
    collectId: collectIdFor(candidate)
  };
}

/** ערך בוויקיפדיה העברית — רק אם הכותרת שלו בעברית (לא דף באנגלית שנמצא בטעות). */
async function hebrewWiki(title: string): Promise<WikiSummary | null> {
  const wiki = await fetchWikipedia(title);
  return wiki && hasHebrew(wiki.title) ? wiki : null;
}

/**
 * הופך מועמד זיהוי לתוצאה מלאה — תמיד עם שם בעברית (לעולם לא אנגלית):
 * 1. מסד התוכן המקומי — התאמה מדויקת (500 צמחים, הכי ידידותי לילדים)
 * 2. תרגום השם המדעי לעברית (ויקיפדיה האנגלית ← הערך העברי, או ויקידאטה) + עובדות מוויקיפדיה
 * 3. צמח קרוב מאותו סוג במסד המקומי
 * 4. שם הסוג בעברית ("מין של אלון")
 * 5. "צמח מסתורי"
 */
export async function enrichToResult(candidate: IdentifyCandidate): Promise<PlantResult> {
  const local = findExactLocal(candidate);
  if (local) return toResultFromLocal(local, candidate);

  const sci = candidate.scientificName?.trim() ?? "";
  const hebrewCommon = (candidate.commonNames ?? []).find(hasHebrew);

  // 2) תרגום השם המדעי
  const he = sci ? await hebrewNameFor(sci) : null;
  if (he) {
    const wiki = he.wikiTitle ? await hebrewWiki(he.wikiTitle) : await hebrewWiki(he.name);
    return wiki ? toResultFromWiki(wiki, candidate, he.name) : genericResult(candidate, he.name);
  }

  // 2ב) שם עברי שהגיע ממנוע הזיהוי, או ערך עברי שמפנה מהשם הלטיני
  for (const title of [hebrewCommon, sci].filter((t): t is string => !!t)) {
    const wiki = await hebrewWiki(title);
    if (wiki) return toResultFromWiki(wiki, candidate, wiki.title);
  }

  // 3) צמח קרוב מאותו סוג במסד המקומי
  const sibling = genusFallback(candidate);
  if (sibling) return toResultFromLocal(sibling, candidate);

  if (hebrewCommon) return genericResult(candidate, hebrewCommon);

  // 4) לפחות שם הסוג בעברית
  const genus = candidate.genus?.trim() || sci.split(/\s+/)[0];
  const heGenus = genus ? await hebrewNameFor(genus) : null;
  if (heGenus) return genericResult(candidate, `מין של ${heGenus.name}`);

  // 5) גיבוי אחרון — בלי שמות באנגלית
  return genericResult(candidate, "צמח מסתורי");
}
