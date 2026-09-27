import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getAllPlants } from "../lib/content";
import { hasHebrew, hebrewNameFor } from "../lib/hebrewName";
import { levelTitle } from "../data/levels";
import { shareAlbumImage } from "../lib/share";
import { playPop } from "../lib/sound";
import { getStickerPhoto } from "../lib/photos";
import type { Player, ProgressState } from "../types";

interface AlbumProps {
  state: ProgressState;
  player: Player | null;
  points: number;
  level: number;
  username: string;
  onCapture: () => void;
  onOpenSticker: (collectId: string) => void;
  onDeleteStickers: (collectIds: string[]) => void;
}

const LONG_PRESS_MS = 500;

export function Album(props: AlbumProps) {
  const { state, player, points, level, username, onCapture } = props;
  // מצב בחירה מרובה (נכנסים בלחיצה ארוכה על מדבקה)
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const cancelPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const startPress = (id: string) => {
    longPressed.current = false;
    cancelPress();
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      navigator.vibrate?.(30);
      setSelected((sel) => new Set(sel ?? []).add(id));
    }, LONG_PRESS_MS);
  };

  const tap = (id: string) => {
    if (longPressed.current) {
      // הלחיצה הארוכה כבר בחרה את המדבקה — לא פותחים אותה
      longPressed.current = false;
      return;
    }
    if (selected) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next.size ? next : null);
      return;
    }
    playPop();
    props.onOpenSticker(id);
  };

  const deleteSelected = () => {
    if (!selected?.size) return;
    if (!confirm(`למחוק ${selected.size} מדבקות מהאלבום? הנקודות שקיבלתם עליהן יורדו.`)) return;
    props.onDeleteStickers([...selected]);
    setSelected(null);
  };
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

      {collectedCount > 0 && !selected && (
        <p className="mt-3 text-center text-xs text-leaf-dark/70">
          לחיצה על מדבקה — לפרטים · לחיצה ארוכה — לבחירה ומחיקה
        </p>
      )}

      {/* פס הבחירה מוצג מחוץ לעמוד (portal) — אנימציית הכניסה של העמוד משתמשת ב-transform,
          ובתוכה fixed נצמד לעמוד ולא למסך */}
      {selected &&
        createPortal(
        <div className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-md items-center gap-2 rounded-blob bg-white p-3 shadow-xl ring-2 ring-leaf">
          <span className="flex-1 font-black text-leaf-dark">נבחרו {selected.size}</span>
          <button
            onClick={() => setSelected(new Set(found.map((f) => f.collectId)))}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-leaf-dark"
          >
            בחירת הכל
          </button>
          <button onClick={deleteSelected} className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white">
            🗑️ מחיקה
          </button>
          <button onClick={() => setSelected(null)} className="rounded-full bg-gray-300 px-3 py-1.5 text-sm font-bold">
            ביטול
          </button>
        </div>,
          document.body
        )}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {found.map((sticker) => {
          const p = byId.get(sticker.collectId);
          const photo = getStickerPhoto(username, sticker.collectId);
          const isSelected = !!selected?.has(sticker.collectId);
          return (
            <button
              key={sticker.collectId}
              onClick={() => tap(sticker.collectId)}
              onPointerDown={() => startPress(sticker.collectId)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerCancel={cancelPress}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative flex aspect-square select-none flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-2 text-center shadow-md transition active:scale-95 ${
                isSelected ? "ring-4 ring-leaf" : ""
              }`}
              style={{ WebkitTouchCallout: "none" }}
            >
              {photo ? (
                <>
                  <img src={photo} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-1 text-xs font-bold leading-tight text-white">
                    {p ? p.hebrewName : <HebrewStickerName name={sticker.hebrewName} collectId={sticker.collectId} />}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl">{p?.emoji ?? sticker.emoji}</div>
                  <div className="mt-1 text-xs font-bold leading-tight text-leaf-dark">
                    {p ? p.hebrewName : <HebrewStickerName name={sticker.hebrewName} collectId={sticker.collectId} />}
                  </div>
                </>
              )}
              {sticker.timesFound > 1 && (
                <div className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 text-[10px] font-bold text-amber-600">
                  ×{sticker.timesFound}
                </div>
              )}
              {selected && (
                <div
                  className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-sm font-black text-white shadow ${
                    isSelected ? "bg-leaf" : "bg-black/30"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </div>
              )}
            </button>
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

      {!selected && (
        <button
          onClick={onCapture}
          className="big-btn fixed bottom-5 left-1/2 -translate-x-1/2 bg-leaf text-xl shadow-xl"
        >
          📷 {collectedCount === 0 ? "צַלְמוּ צמח ראשון" : "צַלְמוּ עוד צמח"}
        </button>
      )}
    </div>
  );
}

/**
 * מדבקות ישנות נשמרו לפעמים עם שם באנגלית/לטינית (לפני שהיה תרגום). מציגים אותן בעברית:
 * מתרגמים את השם המדעי, ועד שיש תרגום — "צמח מסתורי" ולא אנגלית.
 */
function HebrewStickerName({ name, collectId }: { name: string; collectId: string }) {
  const [he, setHe] = useState<string | null>(hasHebrew(name) ? name : null);

  useEffect(() => {
    if (hasHebrew(name) || !collectId.startsWith("sci:")) return;
    let cancelled = false;
    void hebrewNameFor(collectId.slice(4)).then((r) => {
      if (!cancelled && r) setHe(r.name);
    });
    return () => {
      cancelled = true;
    };
  }, [name, collectId]);

  return <>{he ?? "צמח מסתורי"}</>;
}
