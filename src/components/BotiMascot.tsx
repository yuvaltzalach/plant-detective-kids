import { useState } from "react";
import { PlantImage } from "./PlantImage";
import { getAllPlants } from "../lib/content";
import { playPop, speak } from "../lib/sound";
import type { PlantContent } from "../types";

function randomPlant(): PlantContent {
  const all = getAllPlants();
  return all[Math.floor(Math.random() * all.length)];
}

/** דמות מצוירת חמודה של בּוֹטִי. */
function BotiFace({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {/* נבט על הראש */}
      <path d="M50 20 C50 8 62 4 70 8 C68 18 58 22 50 22 Z" fill="#22c55e" />
      <path d="M50 22 C50 10 40 4 31 9 C34 19 43 24 50 24 Z" fill="#16a34a" />
      <rect x="48" y="18" width="4" height="14" rx="2" fill="#15803d" />
      {/* גוף/פנים */}
      <circle cx="50" cy="60" r="32" fill="#4ade80" />
      <circle cx="50" cy="60" r="32" fill="none" stroke="#16a34a" strokeWidth="3" />
      {/* לחיים */}
      <circle cx="34" cy="66" r="6" fill="#fca5a5" opacity="0.7" />
      <circle cx="66" cy="66" r="6" fill="#fca5a5" opacity="0.7" />
      {/* עיניים */}
      <circle cx="40" cy="55" r="7" fill="#fff" />
      <circle cx="60" cy="55" r="7" fill="#fff" />
      <circle cx="41" cy="56" r="3.4" fill="#14532d" />
      <circle cx="61" cy="56" r="3.4" fill="#14532d" />
      <circle cx="42.5" cy="54.5" r="1.2" fill="#fff" />
      <circle cx="62.5" cy="54.5" r="1.2" fill="#fff" />
      {/* חיוך */}
      <path d="M40 70 Q50 80 60 70" fill="none" stroke="#14532d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BotiMascot() {
  const [plant, setPlant] = useState<PlantContent>(() => randomPlant());
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  const openPopup = () => {
    playPop();
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setPlant(randomPlant()); // חידה חדשה לפעם הבאה
    setBubbleOpen(false);
  };

  return (
    <>
      {/* בּוֹטִי מרחף בצד */}
      <div className="fixed bottom-24 left-3 z-40 flex items-end gap-2">
        <button
          onClick={() => {
            playPop();
            setBubbleOpen((b) => !b);
          }}
          className="animate-float drop-shadow-lg active:scale-90"
          aria-label="בּוֹטִי"
        >
          <BotiFace />
        </button>

        {bubbleOpen && (
          <div className="relative mb-4 max-w-[200px] rounded-2xl rounded-bl-none bg-white p-3 pt-5 shadow-xl">
            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600"
              aria-label="סגירה"
            >
              ✕
            </button>
            <button onClick={openPopup} className="text-right text-sm font-bold text-leaf-dark">
              🤔 חידה: {plant.facts[0]}
              <span className="mt-1 block text-xs text-leaf underline">לחצו לגילוי!</span>
            </button>
          </div>
        )}
      </div>

      {/* פופ-אפ עם התשובה המפורטת */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={closePopup}
        >
          <div
            className="w-full max-w-sm animate-pop overflow-hidden rounded-blob bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PlantImage plant={plant} big className="h-44 w-full" />
            <div className="p-5 text-center">
              <div className="text-4xl">{plant.emoji}</div>
              <div className="text-sm font-bold text-leaf">זה ה…</div>
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
