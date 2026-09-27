import { useEffect, useState } from "react";
import { PlantImage } from "../components/PlantImage";
import { hebrewDetailsFor } from "../lib/content";
import { hasHebrew } from "../lib/hebrewName";
import { getStickerPhoto } from "../lib/photos";
import { speak } from "../lib/sound";
import type { CollectedSticker, PlantContent } from "../types";

interface StickerDetailProps {
  sticker: CollectedSticker;
  /** הצמח מהמסד המקומי, אם זה צמח מוכר */
  plant?: PlantContent;
  username: string;
  onDelete: () => void;
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

/** דף מדבקה באלבום: התמונה שצילמתי, שם, מתי מצאתי ועובדות. */
export function StickerDetail({ sticker, plant, username, onDelete }: StickerDetailProps) {
  const photo = getStickerPhoto(username, sticker.collectId);
  const [extra, setExtra] = useState<{ name: string; facts: string[] } | null>(null);

  // צמח שאינו במסד — מביאים שם ועובדות מוויקיפדיה העברית
  useEffect(() => {
    if (plant || !sticker.collectId.startsWith("sci:")) return;
    let cancelled = false;
    void hebrewDetailsFor(sticker.collectId.slice(4)).then((d) => {
      if (!cancelled) setExtra(d);
    });
    return () => {
      cancelled = true;
    };
  }, [plant, sticker.collectId]);

  const name =
    plant?.hebrewName ?? (hasHebrew(sticker.hebrewName) ? sticker.hebrewName : extra?.name ?? "צמח מסתורי");
  const facts = plant?.facts ?? (extra?.facts.length ? extra.facts : []);
  const category = plant?.category ?? sticker.category;

  return (
    <div className="screen-rise flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-blob bg-white ring-1 ring-leaf-dark/5 shadow-[0_20px_44px_-18px_rgba(20,83,45,0.5)]">
        {photo ? (
          <div className="relative">
            <img src={photo} alt={name} className="h-64 w-full object-cover" />
            <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">
              📷 הצילום שלי
            </span>
          </div>
        ) : plant ? (
          <PlantImage plant={plant} className="h-56 w-full" />
        ) : (
          <div className="flex h-40 items-center justify-center bg-leaf-light text-7xl">{sticker.emoji}</div>
        )}

        <div className="p-5 text-center">
          <div className="text-5xl">{plant?.emoji ?? sticker.emoji}</div>
          <h2 className="mt-1 text-3xl font-black text-leaf-dark">{name}</h2>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-leaf-light px-3 py-0.5 font-bold text-leaf-dark">{category}</span>
            {plant && <span className="text-gray-500">{plant.scientificName}</span>}
          </div>

          <div className="mt-3 rounded-2xl bg-sun/20 p-3 text-sm font-bold text-amber-800">
            🗓️ נמצא לראשונה ב-{formatDate(sticker.firstFoundAt)}
            {sticker.timesFound > 1 && ` · מצאת אותו ${sticker.timesFound} פעמים`}
          </div>

          {facts.length > 0 && (
            <ul className="mt-4 space-y-2 text-right">
              {facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 rounded-2xl bg-leaf-light/60 p-3 text-lg text-leaf-dark">
                  <span>💡</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          )}

          {plant?.caution && (
            <div className="mt-3 rounded-2xl bg-amber-100 p-3 text-right font-bold text-amber-800">
              ⚠️ {plant.caution}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => speak(`${name}. ${facts.join(" ")}`)}
              className="inline-flex items-center gap-2 rounded-full bg-sky/20 px-5 py-3 text-lg font-bold text-sky-700 active:scale-95"
            >
              🔊 הקריאו לי
            </button>
            <button
              onClick={() => {
                if (confirm(`למחוק את "${name}" מהאלבום?`)) onDelete();
              }}
              className="rounded-full bg-red-100 px-5 py-3 text-lg font-bold text-red-600 active:scale-95"
            >
              🗑️ מחיקה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
