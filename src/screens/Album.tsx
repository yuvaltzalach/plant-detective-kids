import { getAllPlants } from "../lib/content";
import { levelTitle } from "../data/levels";
import { shareAlbumImage } from "../lib/share";
import { playPop } from "../lib/sound";
import type { Player, ProgressState } from "../types";

interface AlbumProps {
  state: ProgressState;
  player: Player | null;
  points: number;
  level: number;
  onCapture: () => void;
}

export function Album({ state, player, points, level, onCapture }: AlbumProps) {
  const plants = getAllPlants();
  const byId = new Map(plants.map((p) => [p.id, p]));

  // המדבקות שנאספו — החדשה ביותר למעלה (כולל צמחים שזוהו מוויקיפדיה ואינם במסד)
  const found = Object.values(state.stickers).sort((a, b) => b.firstFoundAt - a.firstFoundAt);
  // אחריהן המשבצות של הצמחים שעוד לא נמצאו
  const missing = plants.filter((p) => !state.stickers[p.id]);
  const collectedCount = found.length;

  const handleShare = () => {
    playPop();
    void shareAlbumImage({
      player,
      points,
      level,
      levelTitle: levelTitle(level).name,
      stickers: Object.values(state.stickers)
    });
  };

  return (
    <div className="garden-page garden-page--album screen-rise flex flex-1 flex-col px-5 pb-24 pt-2">
      <div className="relative text-center">
        <div className="title-glow" aria-hidden="true" />
        <h2 className="relative text-3xl font-black text-leaf-dark">📔 האלבום שלי</h2>
        <p className="text-leaf-dark/80">
          אספת {collectedCount} מדבקות! {collectedCount >= plants.length ? "🏆 מדהים!" : "קדימה למצוא עוד 🌿"}
        </p>
        {collectedCount > 0 && (
          <button
            onClick={handleShare}
            className="mt-3 rounded-full bg-sky px-5 py-2 font-bold text-white shadow active:scale-95"
          >
            📤 שיתוף האלבום כתמונה
          </button>
        )}
      </div>

      {collectedCount === 0 && (
        <div className="mt-4 rounded-blob bg-leaf-light/70 p-5 text-center">
          <div className="text-5xl">🌱</div>
          <p className="mt-2 text-lg font-black text-leaf-dark">האלבום עוד ריק!</p>
          <p className="mt-1 text-sm font-bold text-leaf-dark/80">
            כל צמח שתצלמו יהפוך למדבקה כאן. בואו נמצא את הראשון!
          </p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {found.map((sticker) => {
          const p = byId.get(sticker.collectId);
          return (
            <div
              key={sticker.collectId}
              className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white p-2 text-center shadow-md animate-pop"
            >
              <div className="text-4xl">{p?.emoji ?? sticker.emoji}</div>
              <div className="mt-1 text-xs font-bold leading-tight text-leaf-dark">
                {p?.hebrewName ?? sticker.hebrewName}
              </div>
              {sticker.timesFound > 1 && (
                <div className="text-[10px] text-amber-600">×{sticker.timesFound}</div>
              )}
            </div>
          );
        })}

        {missing.map((p) => (
          <div
            key={p.id}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-gray-200/60 p-2 text-center"
          >
            <div className="text-4xl opacity-30 grayscale">❓</div>
            <div className="mt-1 text-xs font-bold leading-tight text-gray-500">עוד לא נמצא</div>
          </div>
        ))}
      </div>

      <button
        onClick={onCapture}
        className="big-btn fixed bottom-5 left-1/2 -translate-x-1/2 bg-leaf text-xl shadow-xl"
      >
        📷 {collectedCount === 0 ? "צַלְמוּ צמח ראשון" : "צַלְמוּ עוד צמח"}
      </button>
    </div>
  );
}
