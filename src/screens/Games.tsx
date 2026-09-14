import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../components/PlantImage";
import { getAllPlants } from "../lib/content";
import { shuffle } from "../lib/shuffle";
import { playPop, playSuccess } from "../lib/sound";
import { SortGame } from "./games/SortGame";
import { TimedGame } from "./games/TimedGame";
import { MatchGame } from "./games/MatchGame";
import { PuzzleGame } from "./games/PuzzleGame";
import { TrueFalseGame } from "./games/TrueFalseGame";
import type { PlantContent } from "../types";

// ─── חידון "נחשו את הצמח" ─────────────────────────────────────────────
function QuizGame({ onBack }: { onBack: () => void }) {
  const plants = useMemo(() => getAllPlants(), []);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const question = useMemo(() => {
    const target = plants[Math.floor(Math.random() * plants.length)];
    const distractors = shuffle(plants.filter((p) => p.id !== target.id)).slice(0, 3);
    return { target, options: shuffle([target, ...distractors]), fact: target.facts[0] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, plants]);

  const correct = picked === question.target.id;

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
        {correct ? (
          <PlantImage plant={question.target} big className="mx-auto h-44 w-44 rounded-2xl" />
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

// ─── משחק זיכרון (מסך מלא, תמונות + שמות) ─────────────────────────────
interface Card {
  key: number;
  plant: PlantContent;
}

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const cards = useMemo<Card[]>(() => {
    const chosen = shuffle(getAllPlants()).slice(0, 6);
    const deck: Card[] = [];
    chosen.forEach((p, i) => {
      deck.push({ key: i * 2, plant: p });
      deck.push({ key: i * 2 + 1, plant: p });
    });
    return shuffle(deck);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const won = matched.size === 6;

  const flip = (idx: number) => {
    if (busy || flipped.includes(idx) || matched.has(cards[idx].plant.id)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setBusy(true);
      const [x, y] = next;
      if (cards[x].plant.id === cards[y].plant.id) {
        const nm = new Set(matched).add(cards[x].plant.id);
        setTimeout(() => {
          setMatched(nm);
          setFlipped([]);
          setBusy(false);
          if (nm.size === 6) {
            confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
            playSuccess();
          }
        }, 450);
      } else {
        playPop();
        setTimeout(() => {
          setFlipped([]);
          setBusy(false);
        }, 850);
      }
    } else {
      playPop();
    }
  };

  return (
    <div className="flex flex-1 flex-col px-3 pb-6 pt-2">
      <div className="flex items-center justify-between px-2">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">🃏 משחק זיכרון</h2>
        <button
          onClick={() => {
            setMatched(new Set());
            setFlipped([]);
            setBusy(false);
            setSeed((s) => s + 1);
          }}
          className="text-sm font-bold text-leaf underline"
        >
          חדש
        </button>
      </div>

      {won && (
        <div className="mx-2 mt-2 rounded-2xl bg-green-500 p-3 text-center text-lg font-black text-white">
          🎉 ניצחת! כל הכבוד!
        </div>
      )}

      <div className="mt-3 grid flex-1 grid-cols-3 gap-2 content-start">
        {cards.map((c, idx) => {
          const up = flipped.includes(idx) || matched.has(c.plant.id);
          return (
            <button
              key={c.key}
              onClick={() => flip(idx)}
              className="flex flex-col overflow-hidden rounded-2xl shadow active:scale-95"
            >
              {up ? (
                <>
                  <PlantImage plant={c.plant} className="aspect-square w-full" />
                  <span className="bg-white px-1 py-1 text-center text-[11px] font-bold leading-tight text-leaf-dark">
                    {c.plant.hebrewName}
                  </span>
                </>
              ) : (
                <span className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-b from-leaf to-leaf-dark text-4xl">
                  🌱
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Mode = "menu" | "quiz" | "memory" | "sort" | "timed" | "match" | "puzzle" | "truefalse";

const GAMES: { mode: Mode; label: string; emoji: string }[] = [
  { mode: "quiz", label: "נחשו את הצמח", emoji: "🧩" },
  { mode: "memory", label: "משחק זיכרון", emoji: "🃏" },
  { mode: "sort", label: "מיון צמחים", emoji: "🗂️" },
  { mode: "timed", label: "מרוץ הצמחים", emoji: "⏱️" },
  { mode: "match", label: "תמונה לשם", emoji: "🔗" },
  { mode: "puzzle", label: "פאזל תמונה", emoji: "🧩" },
  { mode: "truefalse", label: "אמת או דמיון", emoji: "✅" }
];

export function Games() {
  const [mode, setMode] = useState<Mode>("menu");
  const back = () => setMode("menu");

  if (mode === "quiz") return <QuizGame onBack={back} />;
  if (mode === "memory") return <MemoryGame onBack={back} />;
  if (mode === "sort") return <SortGame onBack={back} />;
  if (mode === "timed") return <TimedGame onBack={back} />;
  if (mode === "match") return <MatchGame onBack={back} />;
  if (mode === "puzzle") return <PuzzleGame onBack={back} />;
  if (mode === "truefalse") return <TrueFalseGame onBack={back} />;

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      <div className="text-center">
        <div className="text-6xl">🎮</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">משחקים</h2>
        <p className="mt-1 text-leaf-dark/70">בואו נשחק ונלמד צמחים!</p>
      </div>
      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.mode}
            onClick={() => setMode(g.mode)}
            className="rounded-blob bg-white py-6 text-lg font-black text-leaf-dark shadow active:scale-95"
          >
            <div className="text-4xl">{g.emoji}</div>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
