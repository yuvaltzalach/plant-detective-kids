// עדכוני גרסה של האפליקציה (PWA).
// גרסה חדשה מורדת ברקע, אבל מוחלת (רענון הדף) רק כשהמשתמש במסך הבית — לעולם לא באמצע
// צילום/זיהוי/משחק. קודם הרענון קרה מיד בחזרה מאפליקציית המצלמה, והתמונה הלכה לאיבוד.
import { registerSW } from "virtual:pwa-register";

let updateReady = false;
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;
const listeners = new Set<() => void>();

export function initAppUpdates() {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateReady = true;
      listeners.forEach((l) => l());
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // בדיקה תקופתית בלבד (לא בכל חזרה לאפליקציה — זה בדיוק הרגע שחוזרים מהמצלמה)
      setInterval(() => void registration.update().catch(() => undefined), 60 * 60 * 1000);
    }
  });
}

/** מחיל גרסה חדשה אם הורדה — לקרוא רק כשהמשתמש במסך הבית. */
export function applyUpdateIfReady() {
  if (updateReady && applyUpdate) void applyUpdate(true);
}

export function onUpdateReady(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
