import { useState } from "react";
import { PlantImage } from "./PlantImage";
import { getAllPlants } from "../lib/content";
import { MascotView, mascotById } from "../data/mascots";
import { useMascotId } from "../lib/mascotPref";
import { playPop, speak } from "../lib/sound";
import type { PlantContent } from "../types";

function randomPlant(): PlantContent {
  const all = getAllPlants();
  return all[Math.floor(Math.random() * all.length)];
}

// צורת הענן — נתיב SVG של ענן אמיתי (בליטות עגולות בכל ההיקף), viewBox 0 0 280 230.
const CLOUD_PATH =
  "M 140.0 32.3 A 40.0 40.0 0 0 1 211.4 33.6 A 31.6 31.6 0 0 1 242.6 80.6 " +
  "A 31.2 31.2 0 0 1 270.7 128.8 A 34.0 34.0 0 0 1 225.2 169.2 A 34.6 34.6 0 0 1 177.2 207.9 " +
  "A 39.4 39.4 0 0 1 108.2 194.4 A 39.1 39.1 0 0 1 40.2 178.4 A 29.7 29.7 0 0 1 28.3 126.8 " +
  "A 29.5 29.5 0 0 1 19.9 74.8 A 37.0 37.0 0 0 1 79.0 45.4 A 34.9 34.9 0 0 1 140.0 32.3 Z";

export function BotiMascot() {
  const [plant, setPlant] = useState<PlantContent>(() => randomPlant());
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const mascotId = useMascotId();

  const currentMascot = mascotById(mascotId);

  const openPopup = () => {
    playPop();
    setPopupOpen(true);
  };
  const closePopup = () => {
    setPopupOpen(false);
    setPlant(randomPlant());
    setBubbleOpen(false);
  };

  return (
    <>
      {/* בּוֹטִי — קבוע בצד שמאל למעלה, בלי ריחוף. הענן נפתח רק בלחיצה, ומופיע מימין לדמות. */}
      <div className="fixed left-2 top-24 z-50 flex items-center gap-3" dir="ltr">
        <button
          onClick={() => {
            playPop();
            setBubbleOpen((b) => !b);
          }}
          className="shrink-0 drop-shadow-xl active:scale-90"
          aria-label="הדמות שלי"
        >
          <MascotView mascot={currentMascot} size={68} />
        </button>

        {bubbleOpen && (
          <div className="cloud" dir="rtl">
            {/* גוף הענן — נמתח לפי גודל הטקסט, עם קו מתאר בעובי קבוע */}
            <svg
              className="cloud-svg"
              viewBox="0 0 280 230"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
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
            <span className="cloud-dot" style={{ width: 14, height: 14, left: -8, bottom: "22%" }} />
            <span className="cloud-dot" style={{ width: 9, height: 9, left: -20, bottom: "12%" }} />

            <button onClick={openPopup} className="cloud-content text-center text-sm font-bold text-leaf-dark">
              🤔 חידה: {plant.facts[0]}
              <span className="mt-1 block text-xs text-purple-600 underline">לחצו לגילוי!</span>
            </button>
          </div>
        )}
      </div>

      {/* פופ-אפ עם התשובה המפורטת */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5"
          onClick={closePopup}
        >
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
                <button onClick={closePopup} className="big-btn bg-leaf px-6 py-2 text-base">
                  סבבה!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
