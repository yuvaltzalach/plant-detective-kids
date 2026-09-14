import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../../components/PlantImage";
import { getAllPlants } from "../../lib/content";
import { shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";
import type { PlantContent } from "../../types";

interface Card {
  key: number;
  plant: PlantContent;
}

export function MemoryGame({ onBack }: { onBack: () => void }) {
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
        // קונפטי בכל זוג שמצליחים!
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.5 } });
        playSuccess();
        setTimeout(() => {
          setMatched(nm);
          setFlipped([]);
          setBusy(false);
          if (nm.size === 6) confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
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
