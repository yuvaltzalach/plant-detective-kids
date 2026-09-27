import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// עדכון אוטומטי: כשיש גרסה חדשה באתר, הדף נטען מחדש מיד (במקום להמשיך להציג גרסה ישנה
// מהמטמון עד שסוגרים את האפליקציה לגמרי). בנוסף בודקים עדכון כל שעה ובכל חזרה לאפליקציה.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => void registration.update().catch(() => undefined);
    setInterval(check, 60 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  }
});
void updateSW;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
