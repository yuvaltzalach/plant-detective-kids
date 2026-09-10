import { getAllPlants } from "../lib/content";
import type { ProgressState } from "../types";

interface AlbumProps {
  state: ProgressState;
  onCapture: () => void;
}

export function Album({ state, onCapture }: AlbumProps) {
  const plants = getAllPlants();
  const localIds = new Set(plants.map((p) => p.id));

  // מדבקות שנאספו אך אינן במסד המקומי (מוויקיפדיה וכו')
  const extras = Object.values(state.stickers).filter((s) => !localIds.has(s.collectId));
  const collectedCount = Object.keys(state.stickers).length;

  return (
    <div className="flex flex-1 flex-col px-5 pb-24 pt-2">
      <div className="text-center">
        <h2 className="text-3xl font-black text-leaf-dark">📔 האלבום שלי</h2>
        <p className="text-leaf-dark/70">
          אספת {collectedCount} מדבקות! {collectedCount >= plants.length ? "🏆 מדהים!" : "קדימה למצוא עוד 🌿"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {plants.map((p) => {
          const sticker = state.stickers[p.id];
          const has = !!sticker;
          return (
            <div
              key={p.id}
              className={`flex aspect-square flex-col items-center justify-center rounded-2xl p-2 text-center transition ${
                has ? "bg-white shadow-md animate-pop" : "bg-gray-200/60"
              }`}
            >
              <div className={`text-4xl ${has ? "" : "opacity-30 grayscale"}`}>
                {has ? p.emoji : "❓"}
              </div>
              <div
                className={`mt-1 text-xs font-bold leading-tight ${
                  has ? "text-leaf-dark" : "text-gray-400"
                }`}
              >
                {has ? p.hebrewName : "עוד לא נמצא"}
              </div>
              {has && sticker.timesFound > 1 && (
                <div className="text-[10px] text-amber-600">×{sticker.timesFound}</div>
              )}
            </div>
          );
        })}

        {extras.map((s) => (
          <div
            key={s.collectId}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white p-2 text-center shadow-md animate-pop"
          >
            <div className="text-4xl">{s.emoji}</div>
            <div className="mt-1 text-xs font-bold leading-tight text-leaf-dark">
              {s.hebrewName}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onCapture}
        className="big-btn fixed bottom-5 left-1/2 -translate-x-1/2 bg-leaf text-xl shadow-xl"
      >
        📷 צַלְמוּ עוד צמח
      </button>
    </div>
  );
}
