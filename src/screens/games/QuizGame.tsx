import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { sample, shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";
import type { PlantContent } from "../../types";

export function QuizGame({ onBack }: { onBack: () => void }) {
  const plants = useMemo(() => getAllPlants(), []);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const question = useMemo(() => {
    const target = plants[Math.floor(Math.random() * plants.length)];
    const options = shuffle([target, ...sample(plants.filter((p) => p.id !== target.id), 3)]);
    return { target, options, fact: target.facts[0] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, plants]);

  const answer = (p: PlantContent) => {
    if (picked) return;
    setPicked(p.id);
    if (p.id === question.target.id) {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      playSuccess();
      setScore((s) => s + 1);
    } else {
      playPop();
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">🧩 נחשו את הצמח</h2>
        <span className="font-bold text-amber-600">⭐ {score}</span>
      </div>

      <div className="mt-4 rounded-blob bg-white p-6 text-center shadow">
        {/* גם בטעות וגם בהצלחה — חושפים את תמונת הצמח */}
        {picked ? (
          <PlantImage plant={question.target} className="mx-auto h-44 w-44 rounded-2xl" />
        ) : (
          <div className="text-7xl">{question.target.emoji}</div>
        )}
        <div className="mt-3 flex items-start justify-center gap-2 text-lg text-leaf-dark">
          <span>💡</span>
          <span>{question.fact}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {question.options.map((o) => {
          const isTarget = o.id === question.target.id;
          const chosen = picked === o.id;
          const cls = picked
            ? isTarget
              ? "bg-green-500 text-white"
              : chosen
                ? "bg-red-400 text-white"
                : "bg-white text-leaf-dark"
            : "bg-white text-leaf-dark";
          return (
            <button
              key={o.id}
              onClick={() => answer(o)}
              className={`rounded-blob p-4 text-xl font-bold shadow active:scale-95 ${cls}`}
            >
              {o.hebrewName}
            </button>
          );
        })}
      </div>

      {picked && (
        <button
          onClick={() => {
            setPicked(null);
            setRound((r) => r + 1);
          }}
          className="big-btn mt-5 self-center bg-leaf"
        >
          שאלה הבאה ➡️
        </button>
      )}
    </div>
  );
}
