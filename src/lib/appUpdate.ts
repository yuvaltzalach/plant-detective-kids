// עדכוני גרסה של האפליקציה (PWA).
// ה-service worker החדש משתלט מיד כשהוא מותקן (skipWaiting + clientsClaim), כך שאין גרסה
// "תקועה" שמחכה עד שסוגרים את כל החלונות. אבל רענון הדף עצמו קורה רק כשהמשתמש במסך הבית —
// לעולם לא באמצע צילום, זיהוי או משחק (אחרת הצילום הולך לאיבוד).
import { registerSW } from "virtual:pwa-register";

let updateReady = false;
let waitingUpdate: ((reload?: boolean) => Promise<void>) | null = null;
const listeners = new Set<() => void>();

function markReady() {
  updateReady = true;
  listeners.forEach((l) => l());
}

export function initAppUpdates() {
  const sw = navigator.serviceWorker;
  if (!sw) return;
  const hadController = !!sw.controller;
  // גרסה חדשה השתלטה (ולא ההתקנה הראשונה) — צריך לרענן כדי לטעון את הקוד החדש
  sw.addEventListener("controllerchange", () => {
    if (hadController) markReady();
  });

  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      // גרסה שממתינה (למשל מתקופת המעבר) — נחיל אותה בהזדמנות הבטוחה הבאה
      waitingUpdate = update;
      markReady();
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => void registration.update().catch(() => undefined), 60 * 60 * 1000);
    }
  });
}

/** מחיל גרסה חדשה אם יש — לקרוא רק כשהמשתמש במסך הבית. */
export function applyUpdateIfReady() {
  if (!updateReady) return;
  updateReady = false;
  if (waitingUpdate) void waitingUpdate(true);
  else window.location.reload();
}

export function onUpdateReady(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/**
 * "עדכון לגרסה האחרונה" ידני: מוחק את ה-service worker ואת כל המטמון ומרענן.
 * ההתחברות וההתקדמות לא נמחקות (הן ב-localStorage ובשרת).
 */
export async function forceLatestVersion() {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = (await caches?.keys()) ?? [];
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    /* מתעלמים — בכל מקרה מרעננים */
  }
  window.location.reload();
}

export const APP_VERSION: string = __APP_VERSION__;
