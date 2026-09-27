// תרגום שם מדעי של צמח לשם עברי, בלי מפתח ובלי שרת:
// 1. ויקיפדיה האנגלית → קישור הבין-שפות לערך העברי (הכי אמין: זה בדיוק אותו צמח)
// 2. ויקידאטה → התווית העברית של הטקסון לפי השם המדעי (P225)
// התוצאה נשמרת במטמון מקומי כדי לא לחפש שוב.

const CACHE_PREFIX = "pdk:he:";

/** האם המחרוזת מכילה אותיות עבריות. */
export function hasHebrew(text: string): boolean {
  return /[֐-׿]/.test(text);
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** כותרת הערך העברי המקביל לערך האנגלי של השם המדעי (אם יש). */
export async function heTitleViaEnglishWiki(scientificName: string): Promise<string | null> {
  const data = await getJson(
    "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*" +
      "&redirects=1&prop=langlinks&lllang=he&titles=" +
      encodeURIComponent(scientificName)
  );
  const title: unknown = data?.query?.pages?.[0]?.langlinks?.[0]?.title;
  return typeof title === "string" && hasHebrew(title) ? title : null;
}

/** התווית העברית בוויקידאטה של הטקסון עם השם המדעי הזה (P225). */
export async function heLabelViaWikidata(scientificName: string): Promise<string | null> {
  const search = await getJson(
    "https://www.wikidata.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=1" +
      "&srsearch=" +
      encodeURIComponent(`haswbstatement:P225="${scientificName}"`)
  );
  const id: unknown = search?.query?.search?.[0]?.title;
  if (typeof id !== "string" || !/^Q\d+$/.test(id)) return null;
  const ent = await getJson(
    "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*" +
      "&props=labels&languages=he&ids=" +
      id
  );
  const label: unknown = ent?.entities?.[id]?.labels?.he?.value;
  return typeof label === "string" && hasHebrew(label) ? label : null;
}

export interface HebrewName {
  /** השם העברי להצגה */
  name: string;
  /** כותרת ערך בוויקיפדיה העברית, אם נמצא (בשביל עובדות) */
  wikiTitle?: string;
}

function readCache(key: string): HebrewName | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as HebrewName) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: HebrewName) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* מתעלמים */
  }
}

/** שם עברי לשם מדעי (מין או סוג), או null אם אין תרגום בשום מקור. */
export async function hebrewNameFor(scientificName: string): Promise<HebrewName | null> {
  const key = scientificName.trim().toLowerCase();
  if (!key) return null;
  const cached = readCache(key);
  if (cached) return cached;

  let found: HebrewName | null = null;
  const title = await heTitleViaEnglishWiki(scientificName.trim());
  if (title) {
    // בלי תוספות כמו "(צמח)" בשם שמוצג לילד
    found = { name: title.replace(/\s*\([^)]*\)\s*$/, ""), wikiTitle: title };
  } else {
    const label = await heLabelViaWikidata(scientificName.trim());
    if (label) found = { name: label };
  }
  // שומרים רק הצלחות — כישלון יכול לנבוע מחוסר אינטרנט, ננסה שוב בפעם הבאה
  if (found) writeCache(key, found);
  return found;
}
