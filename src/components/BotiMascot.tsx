import { useState } from "react";
import { PlantImage } from "./PlantImage";
import { getAllPlants } from "../lib/content";
import { MASCOTS, MascotView, mascotById } from "../data/mascots";
import { playPop, speak } from "../lib/sound";
import type { PlantContent } from "../types";

const MASCOT_KEY = "pdk:mascot";

function randomPlant(): PlantContent {
  const all = getAllPlants();
  return all[Math.floor(Math.random() * all.length)];
}

function loadMascotId(): string {
  try {
    return localStorage.getItem(MASCOT_KEY) ?? "lion";
  } catch {
    return "lion";
  }
}

export function BotiMascot() {
  const [plant, setPlant] = useState<PlantContent>(() => randomPlant());
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [mascotId, setMascotId] = useState<string>(() => loadMascotId());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [jumping, setJumping] = useState(false);

  const currentMascot = mascotById(mascotId);
  const doJump = () => setJumping(true);
  const chooseMascot = (id: string) => {
    setMascotId(id);
    try {
      localStorage.setItem(MASCOT_KEY, id);
    } catch {
      /* מתעלמים */
    }
    setPickerOpen(false);
    doJump();
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

  return (
    <>
      {/* בּוֹטִי מרחף בצד ימין למעלה */}
      <div className="fixed right-2 top-16 z-50 flex items-start gap-2">
        <div className="relative">
          <button
            onClick={() => {
              playPop();
              setBubbleOpen((b) => !b);
              doJump();
            }}
            onAnimationEnd={() => setJumping(false)}
            className={`drop-shadow-xl active:scale-90 ${jumping ? "animate-jump" : "animate-bob"}`}
            aria-label="הדמות שלי"
          >
            <MascotView mascot={currentMascot} />
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            className="absolute -bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow"
            aria-label="החלפת דמות"
          >
            🎨
          </button>
        </div>

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

      {/* בורר דמות */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-sm animate-pop rounded-blob bg-white p-5 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-leaf-dark">בחרו דמות 🐾</h3>
            <div className="mt-4 grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto">
              {MASCOTS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    playPop();
                    chooseMascot(m.id);
                  }}
                  className={`flex flex-col items-center rounded-2xl p-3 ${
                    m.id === mascotId ? "bg-leaf-light ring-4 ring-leaf" : "bg-gray-100"
                  }`}
                >
                  <MascotView mascot={m} size={64} />
                  <span className="mt-1 text-sm font-bold text-leaf-dark">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
