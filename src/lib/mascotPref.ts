// בחירת הדמות (בּוֹטִי) — משותפת בין המסך הראשי (BotiMascot) לפרופיל.
// שמור ב-localStorage עם מנגנון subscribe פשוט כדי ששני הרכיבים יתעדכנו יחד.
import { useSyncExternalStore } from "react";

const MASCOT_KEY = "pdk:mascot";
const DEFAULT_ID = "puppy-photo";

const listeners = new Set<() => void>();

export function getMascotId(): string {
  try {
    return localStorage.getItem(MASCOT_KEY) ?? DEFAULT_ID;
  } catch {
    return DEFAULT_ID;
  }
}

export function setMascotId(id: string) {
  try {
    localStorage.setItem(MASCOT_KEY, id);
  } catch {
    /* מתעלמים */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Hook שמחזיר את מזהה הדמות הנוכחי ומתעדכן כשמישהו משנה אותו. */
export function useMascotId(): string {
  return useSyncExternalStore(subscribe, getMascotId, () => DEFAULT_ID);
}
