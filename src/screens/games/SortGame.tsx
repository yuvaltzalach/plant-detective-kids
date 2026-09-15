import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { sample } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";
import type { PlantCategory } from "../../types";

const CATS: { label: string; value: PlantCategory; emoji: string }[] = [
  { label: "עץ", value: "עץ", emoji: "🌳" },
  { label: "פרח", value: "פרח", emoji: "🌸" },
  { label: "עשב", value: "עשב", emoji: "🌿" },
  { label: "צמח", value: "צמח", emoji: "🪴" }
];

export function SortGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const queue = useMemo(() => sample(getAllPlants(), 8), [seed]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);

  const current = queue[idx];
  const done = idx >= queue.length;

  const choose = (c: PlantCategory) => {
    if (!current) return;
    if (c === current.category) {
      playSuccess();
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      setWrong(null);
      setScore((s) => s + 1);
      if (idx + 1 >= queue.length)
        setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }), 150);
      setIdx((i) => i + 1);
    } else {
      playPop();
      setWrong(c);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">🗂️ מיון צמחים</h2>
        <span className="font-bold text-amber-600">⭐ {score}</span>
      </div>

      {done ? (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🏆</div>
          <div className="text-2xl font-black text-leaf-dark">מיינת {score}/{queue.length}!</div>
          <button
            onClick={() => {
              setIdx(0);
              setScore(0);
              setSeed((s) => s + 1);
            }}
            className="big-btn bg-leaf"
          >
            עוד סבב 🔄
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-center text-leaf-dark/80">לאיזו קבוצה שייך הצמח?</p>
          <div className="mx-auto mt-3 w-56 overflow-hidden rounded-blob bg-white shadow-lg">
            <PlantImage plant={current} className="h-44 w-full" />
            <div className="p-2 text-center text-lg font-black text-leaf-dark">
              {current.hebrewName}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {CATS.map((c) => (
              <button
                key={c.value}
                onClick={() => choose(c.value)}
                className={`rounded-blob py-5 text-xl font-black shadow active:scale-95 ${
                  wrong === c.value ? "bg-red-300" : "bg-white text-leaf-dark"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div className="mt-3 text-center text-sm text-leaf-dark/80">
            {idx + 1} / {queue.length}
          </div>
        </>
      )}
    </div>
  );
}
