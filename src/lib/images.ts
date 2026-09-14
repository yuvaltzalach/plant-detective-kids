// מביא תמונה אמיתית לכל צמח מוויקיפדיה (Wikimedia) בזמן ריצה, עם מטמון.
// משתמש ב-MediaWiki action API עם origin=* (תומך CORS אמין בדפדפן).
import type { PlantContent } from "../types";

const mem = new Map<string, string | null>();

/** מנקה שם עברי לכותרת ויקיפדיה: בלי ניקוד, בלי סוגריים, בלי "עץ " בהתחלה. */
function cleanHe(name: string): string {
  return name
    .replace(/[֑-ׇ]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/^עץ\s+/, "")
    .trim();
}

/** תמונה ממאמר לפי כותרת (prop=pageimages). */
async function imageByTitle(lang: string, title: string): Promise<string | null> {
  try {
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=640&titles=` +
      encodeURIComponent(title);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const key of Object.keys(pages)) {
      const src = pages[key]?.thumbnail?.source;
      if (src) return src as string;
    }
    return null;
  } catch {
    return null;
  }
}

/** תמונה דרך חיפוש (מוצא את המאמר הנכון ואז את התמונה שלו). */
async function imageBySearch(lang: string, query: string): Promise<string | null> {
  try {
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(query)}` +
      `&prop=pageimages&piprop=thumbnail&pithumbsize=640`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const key of Object.keys(pages)) {
      const src = pages[key]?.thumbnail?.source;
      if (src) return src as string;
    }
    return null;
  } catch {
    return null;
  }
}

/** מגדיל תמונת Wikimedia (מחליף את רוחב התמונה הממוזערת). */
export function upscale(url: string, px = 640): string {
  return url.replace(/\/\d+px-/, `/${px}px-`);
}

/** מחזיר URL של תמונת הצמח (או null אם לא נמצאה). ממטמן בזיכרון וב-localStorage. */
export async function resolvePlantImage(plant: PlantContent): Promise<string | null> {
  if (mem.has(plant.id)) return mem.get(plant.id) ?? null;
  try {
    const cached = localStorage.getItem(`pdk:img:${plant.id}`);
    if (cached) {
      mem.set(plant.id, cached);
      return cached;
    }
  } catch {
    /* מתעלמים */
  }

  const he = cleanHe(plant.hebrewName);
  let url =
    (await imageByTitle("en", plant.scientificName)) ||
    (await imageByTitle("he", he)) ||
    (await imageBySearch("he", he || plant.scientificName)) ||
    (await imageBySearch("en", plant.scientificName));

  mem.set(plant.id, url);
  if (url) {
    try {
      localStorage.setItem(`pdk:img:${plant.id}`, url);
    } catch {
      /* מתעלמים */
    }
  }
  return url;
}
