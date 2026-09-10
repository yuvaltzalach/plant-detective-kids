import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { getAllPlants } from "../lib/content";
import { playPop, playSuccess } from "../lib/sound";
import type { PlantContent } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── חידון "נחשו את הצמח" ─────────────────────────────────────────────
function QuizGame({ onBack }: { onBack: () => void }) {
  const plants = useMemo(() => getAllPlants(), []);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const question = useMemo(() => {
    const target = plants[Math.floor(Math.random() * plants.length)];
    const distractors = shuffle(plants.filter((p) => p.id !== target.id)).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    const fact = target.facts[Math.floor(Math.random() * target.facts.length)];
    return { target, options, fact };
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
        <div className="text-7xl">{question.target.emoji}</div>
        <div className="mt-3 flex items-start justify-center gap-2 text-lg text-leaf-dark">
          <span>💡</span>
          <span>{question.fact}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {question.options.map((o) => {
          const isTarget = o.id === question.target.id;
          const chosen = picked === o.id;
          const show = picked
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
              className={`rounded-blob p-4 text-xl font-bold shadow active:scale-95 ${show}`}
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

// ─── משחק זיכרון ──────────────────────────────────────────────────────
interface Card {
  key: number;
  emoji: string;
  pair: string;
}

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(0);
  const cards = useMemo<Card[]>(() => {
    const uniqueByEmoji = Array.from(
      new Map(getAllPlants().map((p) => [p.emoji, p])).values()
    );
    const chosen = shuffle(uniqueByEmoji).slice(0, 6);
    const deck: Card[] = [];
    chosen.forEach((p, i) => {
      deck.push({ key: i * 2, emoji: p.emoji, pair: p.id });
      deck.push({ key: i * 2 + 1, emoji: p.emoji, pair: p.id });
    });
    return shuffle(deck);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const won = matched.size === 6 && cards.length > 0;

  const flip = (idx: number) => {
    if (busy || flipped.includes(idx)) return;
    const card = cards[idx];
    if (matched.has(card.pair)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setBusy(true);
      const [a, b] = next;
      if (cards[a].pair === cards[b].pair) {
        const nm = new Set(matched);
        nm.add(cards[a].pair);
        setTimeout(() => {
          setMatched(nm);
          setFlipped([]);
          setBusy(false);
          if (nm.size === 6) {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            playSuccess();
          }
        }, 400);
      } else {
        playPop();
        setTimeout(() => {
          setFlipped([]);
          setBusy(false);
        }, 800);
      }
    } else {
      playPop();
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
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
        <div className="mt-3 rounded-2xl bg-green-500 p-3 text-center text-lg font-black text-white">
          🎉 ניצחת! כל הכבוד!
        </div>
      )}

      <div className="mt-4 grid grid-cols-4 gap-3">
        {cards.map((c, idx) => {
          const isUp = flipped.includes(idx) || matched.has(c.pair);
          return (
            <button
              key={c.key}
              onClick={() => flip(idx)}
              className={`relative flex aspect-square items-center justify-center rounded-2xl text-4xl shadow transition ${
                isUp ? "bg-white" : "bg-leaf"
              }`}
            >
              <span className={isUp ? "" : "opacity-0"}>{c.emoji}</span>
              {!isUp && <span className="absolute text-2xl">🌱</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── תפריט המשחקים ────────────────────────────────────────────────────
export function Games() {
  const [mode, setMode] = useState<"menu" | "quiz" | "memory">("menu");

  if (mode === "quiz") return <QuizGame onBack={() => setMode("menu")} />;
  if (mode === "memory") return <MemoryGame onBack={() => setMode("menu")} />;

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      <div className="text-center">
        <div className="text-6xl animate-float">🎮</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">משחקים</h2>
        <p className="mt-1 text-leaf-dark/70">בואו נשחק ונלמד צמחים!</p>
      </div>

      <button
        onClick={() => setMode("quiz")}
        className="big-btn mt-6 w-full max-w-xs bg-gradient-to-b from-leaf to-leaf-dark py-6 text-2xl"
      >
        🧩 נחשו את הצמח
      </button>
      <button
        onClick={() => setMode("memory")}
        className="big-btn mt-4 w-full max-w-xs bg-sky py-6 text-2xl"
      >
        🃏 משחק זיכרון
      </button>
    </div>
  );
}
