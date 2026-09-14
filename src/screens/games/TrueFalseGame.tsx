import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";
import type { PlantContent } from "../../types";

function makeRound(plants: PlantContent[]) {
  const plant = plants[Math.floor(Math.random() * plants.length)];
  const isTrue = Math.random() < 0.5;
  let statement: string;
  if (isTrue) {
    statement = plant.facts[Math.floor(Math.random() * plant.facts.length)];
  } else {
    const other = shuffle(plants.filter((p) => p.id !== plant.id && p.category !== plant.category))[0] ?? plants[0];
    statement = other.facts[Math.floor(Math.random() * other.facts.length)];
  }
  return { plant, statement, isTrue };
}

export function TrueFalseGame({ onBack }: { onBack: () => void }) {
  const plants = useMemo(() => getAllPlants(), []);
  const [round, setRound] = useState(() => makeRound(plants));
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);

  const answer = (guess: boolean) => {
    if (result) return;
    if (guess === round.isTrue) {
      setScore((s) => s + 1);
      setResult("right");
      playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      setResult("wrong");
      playPop();
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">✅ אמת או דמיון</h2>
        <span className="font-bold text-amber-600">⭐ {score}</span>
      </div>

      <div className="mx-auto mt-4 w-full max-w-sm overflow-hidden rounded-blob bg-white shadow-lg">
        <PlantImage plant={round.plant} className="h-40 w-full" />
        <div className="p-4 text-center">
          <div className="text-xl font-black text-leaf-dark">{round.plant.hebrewName}</div>
          <div className="mt-2 rounded-2xl bg-leaf-light/60 p-3 text-lg text-leaf-dark">
            "{round.statement}"
          </div>
          <div className="mt-1 text-sm text-leaf-dark/60">נכון על הצמח הזה?</div>
        </div>
      </div>

      {!result ? (
        <div className="mt-5 flex gap-3">
          <button onClick={() => answer(true)} className="big-btn flex-1 bg-leaf py-4 text-xl">
            ✅ נכון
          </button>
          <button onClick={() => answer(false)} className="big-btn flex-1 bg-red-400 py-4 text-xl">
            ❌ לא נכון
          </button>
        </div>
      ) : (
        <div className="mt-5 text-center">
          <div className={`text-2xl font-black ${result === "right" ? "text-green-600" : "text-red-500"}`}>
            {result === "right" ? "כל הכבוד! 🎉" : "אופס, לא נכון 🙂"}
          </div>
          <div className="mt-1 text-leaf-dark/70">
            {round.isTrue ? "המשפט אכן על הצמח הזה." : "המשפט הוא בעצם על צמח אחר!"}
          </div>
          <button
            onClick={() => {
              setResult(null);
              setRound(makeRound(plants));
            }}
            className="big-btn mt-3 bg-leaf"
          >
            עוד אחד ➡️
          </button>
        </div>
      )}
    </div>
  );
}
