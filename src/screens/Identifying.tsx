import { useEffect, useRef, useState } from "react";
import { enrichToResult } from "../lib/content";
import { identifyImage } from "../lib/identify";
import type { PlantResult } from "../types";

interface IdentifyingProps {
  imageDataUrl: string;
  onResult: (result: PlantResult) => void;
  onRetry: () => void;
}

const CHEERS = [
  "מסתכל טוב טוב על העלים... 🍃",
  "בודק את הצבעים... 🎨",
  "מחפש במאגר הצמחים... 🔎",
  "כמעט מצאתי... ✨"
];

export function Identifying({ imageDataUrl, onResult, onRetry }: IdentifyingProps) {
  const [error, setError] = useState<string | null>(null);
  const [cheer, setCheer] = useState(CHEERS[0]);
  const started = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCheer((c) => CHEERS[(CHEERS.indexOf(c) + 1) % CHEERS.length]);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const candidates = await identifyImage(imageDataUrl);
        if (!candidates.length) {
          setError("לא הצלחתי לזהות את הצמח 🤔 נסו לצלם קרוב יותר לעלה או לפרח.");
          return;
        }
        const best = candidates[0];
        best.imageUrl = best.imageUrl ?? imageDataUrl;
        const result = await enrichToResult(best);
        onResult(result);
      } catch (e) {
        setError(
          e instanceof Error && e.message
            ? `אופס, משהו השתבש: ${e.message}`
            : "אופס, לא הצלחנו לזהות כרגע. ננסה שוב?"
        );
      }
    })();
  }, [imageDataUrl, onResult]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="text-6xl">🌧️</div>
        <p className="text-xl font-bold text-leaf-dark">{error}</p>
        <button onClick={onRetry} className="big-btn bg-leaf">
          🔄 ננסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="relative">
        <img
          src={imageDataUrl}
          alt="הצמח שצולם"
          className="h-52 w-52 rounded-blob object-cover shadow-lg"
        />
        <div className="absolute -bottom-4 -left-4 text-5xl animate-wiggle">🔎</div>
      </div>
      <div className="flex items-end gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="text-4xl animate-grow"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            🌱
          </span>
        ))}
      </div>
      <p className="text-xl font-bold text-leaf-dark">{cheer}</p>
    </div>
  );
}
