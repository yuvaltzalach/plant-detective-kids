import { useState } from "react";
import { PlantImage } from "./PlantImage";
import { getAllPlants } from "../lib/content";
import { playPop, speak } from "../lib/sound";
import type { PlantContent } from "../types";

// ההתנהגות המשותפת של בּוֹטִי: חידה על צמח אקראי בענן-מחשבה, ופופ-אפ עם התשובה.
// משמשת גם את הדמות הצפה (BotiMascot) וגם את הכלבלב הגדול במסך הבית.

function randomPlant(): PlantContent {
  const all = getAllPlants();
  return all[Math.floor(Math.random() * all.length)];
}

export function useBotiRiddle() {
  const [plant, setPlant] = useState<PlantContent>(() => randomPlant());
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const toggleBubble = () => {
    playPop();
    setBubbleOpen((b) => !b);
  };
  const openPopup = () => {
    playPop();
    setPopupOpen(true);
  };
  const closePopup = () => {
    setPopupOpen(false);
    setPlant(randomPlant());
    setBubbleOpen(false);
  };

  return { plant, bubbleOpen, popupOpen, toggleBubble, openPopup, closePopup };
}

// צורת הענן — נתיב SVG של ענן אמיתי (בליטות עגולות בכל ההיקף), viewBox 0 0 280 230.
const CLOUD_PATH =
  "M 140.0 16.2 A 34.5 34.5 0 0 1 206.3 18.6 A 30.7 30.7 0 0 1 242.0 65.6 " +
  "A 30.2 30.2 0 0 1 272.7 115.0 A 30.2 30.2 0 0 1 242.0 164.4 A 30.7 30.7 0 0 1 206.3 211.4 " +
  "A 34.5 34.5 0 0 1 140.0 213.8 A 34.5 34.5 0 0 1 73.7 211.4 A 30.7 30.7 0 0 1 38.0 164.4 " +
  "A 30.2 30.2 0 0 1 7.3 115.0 A 30.2 30.2 0 0 1 38.0 65.6 A 30.7 30.7 0 0 1 73.7 18.6 " +
  "A 34.5 34.5 0 0 1 140.0 16.2 Z";

// מיקום בועות המחשבה הקטנות — לכיוון הדמות.
const DOTS = {
  left: [
    { width: 14, height: 14, left: -24, bottom: "16%" },
    { width: 9, height: 9, left: -38, bottom: "5%" }
  ],
  right: [
    { width: 14, height: 14, right: -14, bottom: "6%" },
    { width: 9, height: 9, right: -26, bottom: "-6%" }
  ]
} as const;

/** ענן-מחשבה עם החידה. dotsSide — מאיזה צד יוצאות הבועות לכיוון הדמות. */
export function RiddleCloud({
  plant,
  onOpen,
  dotsSide = "left",
  className = ""
}: {
  plant: PlantContent;
  onOpen: () => void;
  dotsSide?: keyof typeof DOTS;
  className?: string;
}) {
  return (
    <div className={`cloud ${className}`} dir="rtl">
      {/* גוף הענן — נמתח לפי גודל הטקסט, עם קו מתאר בעובי קבוע */}
      <svg className="cloud-svg" viewBox="0 0 280 230" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={CLOUD_PATH}
          fill="#fff"
          stroke="#7cc79a"
          strokeWidth="4"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={CLOUD_PATH}
          fill="none"
          stroke="#c9ecd6"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* בועות מחשבה עגולות לכיוון הדמות */}
      {DOTS[dotsSide].map((style, i) => (
        <span key={i} className="cloud-dot" style={style} />
      ))}

      <button onClick={onOpen} className="cloud-content text-center text-base font-bold leading-snug text-leaf-dark">
        🤔 חידה: {plant.facts[0]}
        <span className="mt-1 block text-sm text-purple-600 underline">לחצו לגילוי!</span>
      </button>
    </div>
  );
}

/** פופ-אפ עם התשובה המפורטת. */
export function RiddlePopup({ plant, onClose }: { plant: PlantContent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div
        className="w-full max-w-sm animate-pop overflow-hidden rounded-blob bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PlantImage plant={plant} className="h-44 w-full" />
        <div className="p-5 text-center">
          <div className="text-4xl">{plant.emoji}</div>
          <div className="text-sm font-bold text-purple-600">זה ה…</div>
          <h3 className="text-2xl font-black text-leaf-dark">{plant.hebrewName}</h3>
          <ul className="mt-3 space-y-1.5 text-right">
            {plant.facts.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-leaf-dark">
                <span>💡</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => speak(`${plant.hebrewName}. ${plant.facts.join(" ")}`)}
              className="rounded-full bg-sky/20 px-4 py-2 font-bold text-sky-700"
            >
              🔊 הקראה
            </button>
            <button onClick={onClose} className="big-btn bg-leaf px-6 py-2 text-base">
              מעולה, הבנתי!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
