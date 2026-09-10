import { useState } from "react";
import { speak } from "../lib/sound";

const LINES = [
  "בואו נמצא צמח חדש היום! 🌿",
  "אתם בלשי צמחים אמיתיים! 🔎",
  "כל צמח הוא הרפתקה חדשה!",
  "אולי מסתתר פרח בגינה?",
  "כל הכבוד על האוסף! 🏆",
  "מוכנים לצלם? 📷",
  "שמתם לב לצבעים של העלים?"
];

/** בּוֹטִי — דמות מנחה ידידותית שמעודדת ומדברת בלחיצה. */
export function Mascot() {
  const [line, setLine] = useState(() => LINES[Math.floor(Math.random() * LINES.length)]);

  const talk = () => {
    const next = LINES[Math.floor(Math.random() * LINES.length)];
    setLine(next);
    speak(next);
  };

  return (
    <button
      onClick={talk}
      className="mt-4 flex w-full max-w-xs items-center gap-2 text-right active:scale-95 transition-transform"
      aria-label="בוטי מדבר"
    >
      <span className="text-4xl animate-float">🌱</span>
      <span className="relative flex-1 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-leaf-dark shadow">
        <span className="text-leaf">בּוֹטִי:</span> {line}
        <span className="mr-1 text-leaf-dark/40">🔊</span>
      </span>
    </button>
  );
}
