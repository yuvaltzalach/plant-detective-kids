import plantsData from "../data/plants.he.json";
import type {
  IdentifyCandidate,
  PlantCategory,
  PlantContent,
  PlantResult
} from "../types";

const PLANTS = plantsData as PlantContent[];

// אינדקסים לחיפוש מהיר לפי שם מדעי מלא ולפי סוג (genus)
const byScientific = new Map<string, PlantContent>();
const byGenus = new Map<string, PlantContent>();
for (const p of PLANTS) {
  byScientific.set(p.scientificName.toLowerCase(), p);
  if (!byGenus.has(p.genus.toLowerCase())) {
    byGenus.set(p.genus.toLowerCase(), p);
  }
}

/** כל הצמחים במסד המקומי — משמש להצגת האלבום עם המשבצות הריקות. */
export function getAllPlants(): PlantContent[] {
  return PLANTS;
}

/** חיפוש תוכן עברי מקומי עבור מועמד זיהוי. מחזיר null אם אין התאמה. */
export function findLocalContent(candidate: IdentifyCandidate): PlantContent | null {
  const sci = candidate.scientificName?.toLowerCase().trim() ?? "";
  if (sci && byScientific.has(sci)) return byScientific.get(sci)!;

  // התאמה לפי המילה הראשונה של השם המדעי (הסוג)
  const genusFromSci = sci.split(/\s+/)[0];
  const genus = (candidate.genus || genusFromSci || "").toLowerCase().trim();
  if (genus && byGenus.has(genus)) return byGenus.get(genus)!;

  return null;
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

/**
 * מחפש בוויקיפדיה העברית ומחזיר את כותרת הערך המתאים ביותר.
 * כך מוצאים את הערך העברי (למשל "גבסנית מכבדית") גם משם לטיני (Gypsophila paniculata).
 */
async function searchWikipediaTitle(query: string): Promise<string | null> {
  try {
    const url =
      "https://he.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&origin=*&srsearch=" +
      encodeURIComponent(query);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.query?.search?.[0]?.title ?? null;
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

/**
 * הופך מועמד זיהוי לתוצאה מלאה בעברית:
 * 1. מסד תוכן מקומי (הכי ידידותי לילדים)
 * 2. ויקיפדיה בעברית (גיבוי דינמי)
 * 3. טקסט כללי ידידותי
 */
function toResultFromWiki(wiki: WikiSummary, candidate: IdentifyCandidate): PlantResult {
  const facts = splitToFacts(wiki.extract);
  return {
    hebrewName: wiki.title,
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

/** האם המחרוזת מכילה אותיות עבריות (כדי לא להציג שם לטיני כ"שם עברי"). */
function hasHebrew(text: string): boolean {
  return /[֐-׿]/.test(text);
}

export async function enrichToResult(candidate: IdentifyCandidate): Promise<PlantResult> {
  const local = findLocalContent(candidate);
  if (local) return toResultFromLocal(local, candidate);

  // 1) ניסיון ישיר לפי שמות עבריים ואז לפי השם המדעי
  const titles = [...(candidate.commonNames ?? []), candidate.scientificName].filter(Boolean);
  for (const title of titles) {
    const wiki = await fetchWikipedia(title);
    if (wiki) return toResultFromWiki(wiki, candidate);
  }

  // 2) חיפוש בוויקיפדיה העברית — מוצא את הערך העברי גם מהשם הלטיני
  const searchQuery = candidate.scientificName || candidate.commonNames?.[0] || "";
  if (searchQuery) {
    const foundTitle = await searchWikipediaTitle(searchQuery);
    if (foundTitle) {
      const wiki = await fetchWikipedia(foundTitle);
      if (wiki) return toResultFromWiki(wiki, candidate);
    }
  }

  // 3) גיבוי אחרון — מעדיפים שם נפוץ בעברית; אם אין, מציגים את השם הלטיני
  const hebrewCommon = (candidate.commonNames ?? []).find(hasHebrew);
  const friendlyName =
    hebrewCommon || candidate.commonNames?.[0] || candidate.scientificName || "צמח מסתורי";
  return {
    hebrewName: friendlyName,
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
