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
  "M 140.0 16.2 A 34.5 34.5 0 0 1 206.3 18.6 A 30.7 30.7 0 0 1 242.0 65.6 " +
  "A 30.2 30.2 0 0 1 272.7 115.0 A 30.2 30.2 0 0 1 242.0 164.4 A 30.7 30.7 0 0 1 206.3 211.4 " +
  "A 34.5 34.5 0 0 1 140.0 213.8 A 34.5 34.5 0 0 1 73.7 211.4 A 30.7 30.7 0 0 1 38.0 164.4 " +
  "A 30.2 30.2 0 0 1 7.3 115.0 A 30.2 30.2 0 0 1 38.0 65.6 A 30.7 30.7 0 0 1 73.7 18.6 " +
  "A 34.5 34.5 0 0 1 140.0 16.2 Z";

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
            <span className="cloud-dot" style={{ width: 14, height: 14, left: -24, bottom: "16%" }} />
            <span className="cloud-dot" style={{ width: 9, height: 9, left: -38, bottom: "5%" }} />

            <button onClick={openPopup} className="cloud-content text-center text-base font-bold leading-snug text-leaf-dark">
              🤔 חידה: {plant.facts[0]}
              <span className="mt-1 block text-sm text-purple-600 underline">לחצו לגילוי!</span>
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
