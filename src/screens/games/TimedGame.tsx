import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { sample, shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";
import type { PlantContent } from "../../types";

const DURATION = 60;

function makeQuestion(plants: PlantContent[]) {
  const target = plants[Math.floor(Math.random() * plants.length)];
  const options = shuffle([target, ...sample(plants.filter((p) => p.id !== target.id), 3)]);
  return { target, options };
}

export function TimedGame({ onBack }: { onBack: () => void }) {
  const plants = useMemo(() => getAllPlants(), []);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => makeQuestion(plants));
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (!running || timeLeft <= 0) {
      if (running && timeLeft <= 0) {
        setRunning(false);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  const start = () => {
    setScore(0);
    setTimeLeft(DURATION);
    setQ(makeQuestion(plants));
    setLocked(false);
    setPicked(null);
    setRunning(true);
  };

  const answer = (p: PlantContent) => {
    if (!running || locked) return;
    setLocked(true);
    setPicked(p.id);
    const correct = p.id === q.target.id;
    if (correct) {
      playSuccess();
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      setScore((s) => s + 1);
    } else {
      playPop();
    }
    setTimeout(
      () => {
        setPicked(null);
        setLocked(false);
        setQ(makeQuestion(plants));
      },
      correct ? 350 : 1000
    );
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">⏱️ מרוץ הצמחים</h2>
        <span className="font-bold text-amber-600">⭐ {score}</span>
      </div>

      {!running ? (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">⏱️</div>
          <p className="text-lg text-leaf-dark">כמה צמחים תזהו ב-60 שניות?</p>
          {timeLeft <= 0 && (
            <div className="text-2xl font-black text-leaf-dark">הזמן נגמר! זיהית {score} 🎉</div>
          )}
          <button onClick={start} className="big-btn bg-leaf">
            {timeLeft <= 0 ? "עוד פעם! 🔄" : "התחלה!"}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-leaf-light">
            <div
              className="h-full rounded-full bg-gradient-to-l from-leaf to-sun transition-all duration-1000"
              style={{ width: `${(timeLeft / DURATION) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm font-bold text-leaf-dark/70">{timeLeft} שניות</div>

          <div className="mx-auto mt-3 h-48 w-48 overflow-hidden rounded-blob shadow-lg">
            <PlantImage plant={q.target} className="h-full w-full" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {q.options.map((o) => {
              const isTarget = o.id === q.target.id;
              const cls = locked
                ? isTarget
                  ? "bg-green-500 text-white"
                  : picked === o.id
                    ? "bg-red-400 text-white"
                    : "bg-white text-leaf-dark opacity-60"
                : "bg-white text-leaf-dark";
              return (
                <button
                  key={o.id}
                  onClick={() => answer(o)}
                  className={`rounded-blob p-3 text-lg font-bold shadow active:scale-95 ${cls}`}
                >
                  {o.hebrewName}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
