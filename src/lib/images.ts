// מביא תמונה אמיתית לכל צמח מוויקיפדיה (Wikimedia) בזמן ריצה, עם מטמון.
// משתמש ב-MediaWiki action API עם origin=* (תומך CORS אמין בדפדפן).
//
// כדי שהתמונה תתאים באמת לשם הצמח:
// - מחפשים קודם לפי כותרת מפורשת (wikiTitle) או השם המדעי המלא בוויקיפדיה האנגלית.
// - כל תוצאה נבדקת לפי התיאור הקצר של הערך ("Species of plant" וכו') — כך לא נקבל
//   בטעות תמונה של אל יווני (Adonis), רימון-יד או דף פירושונים.
// - מדלגים על מפות תפוצה ואיורי SVG.
import type { PlantContent } from "../types";

// גרסת מטמון — הועלתה כדי לנקות תמונות שגויות שנשמרו בעבר במכשירים.
const CACHE_PREFIX = "pdk:img3:";
const mem = new Map<string, string | null>();

const PLANT_WORDS_EN =
  /plant|tree|shrub|flower|herb|grass|genus|species|palm|cactus|vine|succulent|fruit|vegetable|cultivar|weed|conifer|fern|lily|orchid|bulb|legume|cereal|crop|spice|climber|moss|iris|rose/i;
const PLANT_WORDS_HE = /צמח|עץ|שיח|פרח|סוג|מין|משפחה|דגן|פרי|ירק|עשב|גיאופיט|תבלין/;
const BAD_FILE = /map|distribution|range|locator|\.svg|\.gif|diagram|illustration|herbarium|logo|flag|coat[_ ]of[_ ]arms/i;

interface WikiPage {
  thumbnail?: { source: string };
  pageimage?: string;
  description?: string;
  pageprops?: { disambiguation?: string };
  missing?: string;
}

function pickImage(page: WikiPage | undefined, lang: "en" | "he"): string | null {
  if (!page || page.missing !== undefined) return null;
  if (page.pageprops && "disambiguation" in page.pageprops) return null;
  const src = page.thumbnail?.source;
  if (!src) return null;
  if (BAD_FILE.test(page.pageimage ?? "") || BAD_FILE.test(src)) return null;
  const desc = page.description ?? "";
  // אם יש תיאור — הוא חייב להיות של צמח. אם אין תיאור בכלל, מקבלים (ערכי מינים רבים בלי תיאור).
  if (desc && !(lang === "en" ? PLANT_WORDS_EN : PLANT_WORDS_HE).test(desc)) return null;
  return src;
}

const PROPS = "&prop=pageimages|description|pageprops&piprop=thumbnail|name&pithumbsize=640&ppprop=disambiguation";

/** תמונה ממאמר לפי כותרת מדויקת. */
async function imageByTitle(lang: "en" | "he", title: string): Promise<string | null> {
  if (!title) return null;
  try {
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*` +
      `&redirects=1${PROPS}&titles=` +
      encodeURIComponent(title);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    const page: WikiPage | undefined = data?.query?.pages?.[0];
    return pickImage(page, lang);
  } catch {
    return null;
  }
}

/** תמונה דרך חיפוש בשם המדעי בלבד (מסוננת לפי תיאור צמח). */
async function imageBySearch(query: string): Promise<string | null> {
  try {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*` +
      `&generator=search&gsrlimit=3&gsrsearch=${encodeURIComponent(query)}${PROPS}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages: (WikiPage & { index?: number })[] = data?.query?.pages ?? [];
    pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const p of pages) {
      const src = pickImage(p, "en");
      if (src) return src;
    }
    return null;
  } catch {
    return null;
  }
}

/** מנקה שם עברי לכותרת ויקיפדיה: בלי ניקוד ובלי סוגריים. */
function cleanHe(name: string): string {
  return name
    .replace(/[֑-ׇ]/g, "")
    .replace(/\([^)]*\)/g, "")
    .trim();
}

/** סדר הניסיונות לתמונה של צמח — מהמדויק ביותר לכללי. */
export function imageLookupOrder(plant: PlantContent): { lang: "en" | "he"; title: string }[] {
  const out: { lang: "en" | "he"; title: string }[] = [];
  if (plant.wikiTitle) out.push({ lang: "en", title: plant.wikiTitle });
  out.push({ lang: "en", title: plant.scientificName });
  // השם העברי המלא (למשל "כלנית מצויה") — רק אם הוא לא מילה כללית אחת שעלולה להיות דו-משמעית
  const he = cleanHe(plant.hebrewName);
  if (he.includes(" ")) out.push({ lang: "he", title: he });
  if (plant.genus && plant.genus !== plant.scientificName) {
    out.push({ lang: "en", title: `${plant.genus} (plant)` });
    out.push({ lang: "en", title: plant.genus });
  }
  return out;
}

/** מחזיר URL של תמונת הצמח (או null אם לא נמצאה). ממטמן בזיכרון וב-localStorage. */
export async function resolvePlantImage(plant: PlantContent): Promise<string | null> {
  if (mem.has(plant.id)) return mem.get(plant.id) ?? null;
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + plant.id);
    if (cached) {
      mem.set(plant.id, cached);
      return cached;
    }
  } catch {
    /* מתעלמים */
  }

  let url: string | null = null;
  for (const step of imageLookupOrder(plant)) {
    url = await imageByTitle(step.lang, step.title);
    if (url) break;
  }
  if (!url) url = await imageBySearch(`"${plant.scientificName}"`);

  mem.set(plant.id, url);
  if (url) {
    try {
      localStorage.setItem(CACHE_PREFIX + plant.id, url);
    } catch {
      /* מתעלמים */
    }
  }
  return url;
}
