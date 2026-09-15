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

// עיגולי ה"ענן" — נמזגים לצורה חלקה דרך פילטר ה-gooey.
type Puff = { s: number; left?: string; right?: string; top?: string; bottom?: string };
const CLOUD_PUFFS: Puff[] = [
  // קשקושים עליונים
  { left: "3%", top: "-8px", s: 32 },
  { left: "19%", top: "-11px", s: 36 },
  { left: "37%", top: "-12px", s: 38 },
  { left: "55%", top: "-11px", s: 36 },
  { left: "72%", top: "-9px", s: 34 },
  { left: "86%", top: "-5px", s: 28 },
  // קשקושים תחתונים
  { left: "8%", bottom: "-7px", s: 30 },
  { left: "27%", bottom: "-9px", s: 34 },
  { left: "47%", bottom: "-9px", s: 34 },
  { left: "67%", bottom: "-8px", s: 32 },
  { left: "84%", bottom: "-6px", s: 28 },
  // צדדים
  { left: "-7px", top: "28%", s: 26 },
  { left: "-8px", top: "56%", s: 26 },
  { right: "-7px", top: "30%", s: 26 },
  { right: "-8px", top: "58%", s: 26 }
];
function puffStyle({ s, ...pos }: Puff) {
  return { ...pos, width: s, height: s } as const;
}

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
      {/* פילטר gooey — ממזג את עיגולי הענן לצורה חלקה */}
      <svg width={0} height={0} className="absolute" aria-hidden="true">
        <defs>
          <filter id="cloud-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              result="goo"
            />
            {/* קו מתאר: מרחיבים את צורת הענן וצובעים בזהב, ומעליו המילוי */}
            <feMorphology in="goo" operator="dilate" radius="4" result="d" />
            <feFlood floodColor="#e0cb8a" result="oc" />
            <feComposite in="oc" in2="d" operator="in" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="goo" />
            </feMerge>
          </filter>
        </defs>
      </svg>

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
            {/* שכבת הצורה — עיגולים לבנים שנמזגים לענן */}
            <div className="cloud-shape" aria-hidden="true">
              <i className="cloud-body" />
              {CLOUD_PUFFS.map((p, i) => (
                <i key={i} style={puffStyle(p)} />
              ))}
            </div>
            {/* זנב מחשבה לכיוון הדמות */}
            <div className="cloud-tail" aria-hidden="true">
              <i style={{ left: "-14px", top: "-8px", width: 16, height: 16 }} />
              <i style={{ left: "-29px", top: "-1px", width: 10, height: 10 }} />
            </div>

            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-purple-200 text-xs font-bold text-purple-700"
              aria-label="סגירה"
            >
              ✕
            </button>
            <div className="cloud-content">
              <button onClick={openPopup} className="text-right text-sm font-bold text-leaf-dark">
                🤔 חידה: {plant.facts[0]}
                <span className="mt-1 block text-xs text-purple-600 underline">לחצו לגילוי!</span>
              </button>
            </div>
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
