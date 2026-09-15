import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { sample, shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";

type Side = "photo" | "name";

export function MatchGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const plants = useMemo(() => sample(getAllPlants(), 4), [seed]);
  const names = useMemo(() => shuffle(plants), [plants]);
  const [sel, setSel] = useState<{ id: string; side: Side } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const won = matched.size === plants.length;

  const tap = (id: string, side: Side) => {
    if (matched.has(id)) return;
    playPop();
    if (!sel) {
      setSel({ id, side });
      return;
    }
    if (sel.side === side) {
      // בחירה מחדש מאותו צד
      setSel({ id, side });
      return;
    }
    // צד נגדי — בודקים התאמה
    if (sel.id === id) {
      const nm = new Set(matched).add(id);
      setMatched(nm);
      setSel(null);
      playSuccess();
      confetti({ particleCount: 55, spread: 60, origin: { y: 0.5 } });
      if (nm.size === plants.length)
        setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }), 150);
    } else {
      setWrong(id);
      setSel(null);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">🔗 תמונה לשם</h2>
        <span className="w-6" />
      </div>
      <p className="mt-1 text-center text-leaf-dark/80">בוחרים תמונה ואז שם — או שם ואז תמונה</p>

      <div className="mt-4 flex gap-3">
        {/* תמונות */}
        <div className="flex flex-1 flex-col gap-3">
          {plants.map((p) => {
            const isMatched = matched.has(p.id);
            const isSel = sel?.side === "photo" && sel.id === p.id;
            return (
              <button
                key={p.id}
                disabled={isMatched}
                onClick={() => tap(p.id, "photo")}
                className={`overflow-hidden rounded-2xl shadow transition ${
                  isMatched ? "opacity-40" : isSel ? "ring-4 ring-leaf" : ""
                }`}
              >
                <PlantImage plant={p} className="h-24 w-full" />
              </button>
            );
          })}
        </div>
        {/* שמות */}
        <div className="flex flex-1 flex-col gap-3">
          {names.map((p) => {
            const isMatched = matched.has(p.id);
            const isSel = sel?.side === "name" && sel.id === p.id;
            return (
              <button
                key={p.id}
                disabled={isMatched}
                onClick={() => tap(p.id, "name")}
                className={`flex h-24 items-center justify-center rounded-2xl p-2 text-center text-lg font-bold shadow transition active:scale-95 ${
                  isMatched
                    ? "bg-green-500 text-white"
                    : wrong === p.id
                      ? "bg-red-300 text-leaf-dark"
                      : isSel
                        ? "bg-leaf-light ring-4 ring-leaf text-leaf-dark"
                        : "bg-white text-leaf-dark"
                }`}
              >
                {p.hebrewName}
              </button>
            );
          })}
        </div>
      </div>

      {won && (
        <button
          onClick={() => {
            setMatched(new Set());
            setSel(null);
            setSeed((s) => s + 1);
          }}
          className="big-btn mt-6 self-center bg-leaf"
        >
          🎉 כל הכבוד! עוד סבב
        </button>
      )}
    </div>
  );
}
