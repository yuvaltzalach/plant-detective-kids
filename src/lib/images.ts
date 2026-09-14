// מביא תמונה אמיתית לכל צמח מוויקיפדיה (Wikimedia) בזמן ריצה, עם מטמון.
// רץ בדפדפן של המשתמש (לא בבנייה), ולכן ניגש לוויקיפדיה בלי בעיה.
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

async function wikiThumb(lang: string, title: string): Promise<string | null> {
  try {
    const url =
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/` +
      encodeURIComponent(title.replace(/\s+/g, "_"));
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (data?.type === "disambiguation") return null;
    return data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
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

  let url = await wikiThumb("en", plant.scientificName);
  if (!url) url = await wikiThumb("he", cleanHe(plant.hebrewName));

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
