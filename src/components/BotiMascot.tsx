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
      <div className="fixed left-2 top-28 z-50 flex items-center gap-3" dir="ltr">
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
          <div className="relative" dir="rtl">
            <span className="cloud-tail" aria-hidden="true" />
            <div className="thought-cloud max-w-[190px] p-3 pt-6">
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
