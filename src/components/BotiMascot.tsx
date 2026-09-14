import { useState } from "react";
import { PlantImage } from "./PlantImage";
import { getAllPlants } from "../lib/content";
import { playPop, speak } from "../lib/sound";
import type { PlantContent } from "../types";

function randomPlant(): PlantContent {
  const all = getAllPlants();
  return all[Math.floor(Math.random() * all.length)];
}

/** דמות רובוט חמודה ומושקעת של בּוֹטִי. */
function BotiFace({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="botiBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <radialGradient id="botiVisor" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#312e81" />
        </radialGradient>
      </defs>

      {/* אנטנה */}
      <line x1="50" y1="14" x2="50" y2="26" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="50" cy="12" r="5" fill="#34d399" />
      <circle cx="48" cy="10" r="1.6" fill="#fff" />

      {/* אוזניות בצדדים */}
      <rect x="12" y="42" width="12" height="24" rx="6" fill="#4c1d95" />
      <rect x="76" y="42" width="12" height="24" rx="6" fill="#4c1d95" />

      {/* ראש */}
      <rect x="20" y="26" width="60" height="56" rx="20" fill="url(#botiBody)" />
      <rect x="20" y="26" width="60" height="56" rx="20" fill="none" stroke="#5b21b6" strokeWidth="2" />

      {/* ויזור */}
      <rect x="28" y="38" width="44" height="30" rx="15" fill="url(#botiVisor)" />
      {/* עיניים זוהרות */}
      <circle cx="42" cy="53" r="6.5" fill="#22d3ee" />
      <circle cx="58" cy="53" r="6.5" fill="#22d3ee" />
      <circle cx="44" cy="51" r="2" fill="#fff" />
      <circle cx="60" cy="51" r="2" fill="#fff" />
      {/* חיוך קטן מתחת לויזור */}
      <path d="M44 74 Q50 79 56 74" fill="none" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
      {/* לחיים */}
      <circle cx="31" cy="72" r="3.5" fill="#f0abfc" opacity="0.8" />
      <circle cx="69" cy="72" r="3.5" fill="#f0abfc" opacity="0.8" />
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
    setPlant(randomPlant());
    setBubbleOpen(false);
  };

  return (
    <>
      {/* בּוֹטִי מרחף בצד ימין למעלה */}
      <div className="fixed right-2 top-16 z-50 flex items-start gap-2">
        <button
          onClick={() => {
            playPop();
            setBubbleOpen((b) => !b);
          }}
          className="animate-float drop-shadow-xl active:scale-90"
          aria-label="בּוֹטִי"
        >
          <BotiFace />
        </button>

        {bubbleOpen && (
          <div className="relative mt-2 max-w-[190px] rounded-2xl rounded-tr-none bg-white p-3 pt-6 shadow-xl">
            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 text-xs font-bold text-purple-700"
              aria-label="סגירה"
            >
              ✕
            </button>
            <button onClick={openPopup} className="text-right text-sm font-bold text-leaf-dark">
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
            <PlantImage plant={plant} big className="h-44 w-full" />
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
