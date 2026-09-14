import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { sample, shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";

export function MatchGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const plants = useMemo(() => sample(getAllPlants(), 4), [seed]);
  const names = useMemo(() => shuffle(plants), [plants]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const pickName = (id: string) => {
    if (!selected || matched.has(id)) return;
    if (id === selected) {
      const nm = new Set(matched).add(id);
      setMatched(nm);
      setSelected(null);
      playSuccess();
      if (nm.size === plants.length) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } else {
      playPop();
      setWrong(id);
      setTimeout(() => setWrong(null), 400);
    }
  };

  const won = matched.size === plants.length;

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">🔗 תמונה לשם</h2>
        <span className="w-6" />
      </div>
      <p className="mt-1 text-center text-leaf-dark/70">בוחרים תמונה ואז את השם שלה</p>

      <div className="mt-4 flex gap-3">
        {/* תמונות */}
        <div className="flex flex-1 flex-col gap-3">
          {plants.map((p) => {
            const isMatched = matched.has(p.id);
            const isSel = selected === p.id;
            return (
              <button
                key={p.id}
                disabled={isMatched}
                onClick={() => {
                  playPop();
                  setSelected(p.id);
                }}
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
            return (
              <button
                key={p.id}
                disabled={isMatched}
                onClick={() => pickName(p.id)}
                className={`flex h-24 items-center justify-center rounded-2xl p-2 text-center text-lg font-bold shadow transition active:scale-95 ${
                  isMatched
                    ? "bg-green-500 text-white"
                    : wrong === p.id
                      ? "bg-red-300 text-leaf-dark"
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
            setSelected(null);
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
