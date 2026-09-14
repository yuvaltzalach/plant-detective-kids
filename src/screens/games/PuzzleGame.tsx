import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { getAllPlants } from "../../lib/content";
import { resolvePlantImage } from "../../lib/images";
import { sample, shuffle } from "../../lib/shuffle";
import { playPop, playSuccess } from "../../lib/sound";
import type { PlantContent } from "../../types";

const SIZE = 3;
const N = SIZE * SIZE;

function scrambled(): number[] {
  let order = shuffle([...Array(N).keys()]);
  // לוודא שזה לא כבר פתור
  if (order.every((v, i) => v === i)) order = scrambled();
  return order;
}

export function PuzzleGame({ onBack }: { onBack: () => void }) {
  const [plant, setPlant] = useState<PlantContent | null>(null);
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  const [order, setOrder] = useState<number[]>(() => scrambled());
  const [sel, setSel] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  // בוחר צמח עם תמונה זמינה
  useEffect(() => {
    let cancelled = false;
    setUrl(undefined);
    (async () => {
      for (const p of sample(getAllPlants(), 8)) {
        const u = await resolvePlantImage(p);
        if (cancelled) return;
        if (u) {
          setPlant(p);
          setUrl(u);
          setOrder(scrambled());
          setSel(null);
          return;
        }
      }
      if (!cancelled) setUrl(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const solved = order.every((v, i) => v === i);

  const tap = (slot: number) => {
    if (solved) return;
    if (sel === null) {
      playPop();
      setSel(slot);
      return;
    }
    const next = [...order];
    [next[sel], next[slot]] = [next[slot], next[sel]];
    setSel(null);
    setOrder(next);
    if (next.every((v, i) => v === i)) {
      playSuccess();
      confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
    } else {
      playPop();
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-2xl">⬅️</button>
        <h2 className="text-2xl font-black text-leaf-dark">🧩 פאזל תמונה</h2>
        <button onClick={() => setAttempt((a) => a + 1)} className="text-sm font-bold text-leaf underline">
          חדש
        </button>
      </div>

      {url === undefined && <p className="mt-10 text-center text-leaf-dark/60">טוען תמונה...</p>}
      {url === null && (
        <p className="mt-10 text-center text-leaf-dark/60">צריך חיבור לאינטרנט לתמונות 🌐</p>
      )}

      {url && plant && (
        <>
          <p className="mt-2 text-center text-leaf-dark/70">
            סדרו את התמונה של ה{plant.hebrewName} — הקישו על שני חלקים כדי להחליף
          </p>
          <div className="mx-auto mt-4 grid w-72 grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-lg">
            {order.map((tile, slot) => {
              const col = tile % SIZE;
              const row = Math.floor(tile / SIZE);
              return (
                <button
                  key={slot}
                  onClick={() => tap(slot)}
                  className={`aspect-square rounded-md bg-cover ${
                    sel === slot ? "ring-4 ring-leaf" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${url})`,
                    backgroundSize: `${SIZE * 100}% ${SIZE * 100}%`,
                    backgroundPosition: `${col * 50}% ${row * 50}%`
                  }}
                  aria-label={`חלק ${slot + 1}`}
                />
              );
            })}
          </div>

          {solved && (
            <div className="mt-5 text-center">
              <div className="text-2xl font-black text-leaf-dark">🎉 סידרת! זה ה{plant.hebrewName}</div>
              <button onClick={() => setAttempt((a) => a + 1)} className="big-btn mt-3 bg-leaf">
                פאזל חדש 🔄
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
