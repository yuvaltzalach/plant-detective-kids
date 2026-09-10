import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { BadgeToast } from "../components/BadgeToast";
import { SpeakButton } from "../components/SpeakButton";
import { playBadge, playSuccess } from "../lib/sound";
import type { FindOutcome } from "../lib/progress";
import type { PlantResult } from "../types";

interface ResultProps {
  result: PlantResult;
  record: (r: PlantResult) => FindOutcome;
  onCapture: () => void;
  onAlbum: () => void;
}

function celebrate() {
  const opts = { spread: 70, startVelocity: 40, particleCount: 80, origin: { y: 0.6 } };
  confetti({ ...opts, angle: 60 });
  confetti({ ...opts, angle: 120 });
}

export function Result({ result, record, onCapture, onAlbum }: ResultProps) {
  const done = useRef(false);
  const [outcome, setOutcome] = useState<FindOutcome | null>(null);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const o = record(result);
    setOutcome(o);
    celebrate();
    playSuccess();
    if (o.newBadgeIds.length) {
      setShowBadges(true);
      setTimeout(playBadge, 700);
    }
  }, [record, result]);

  const speakText = `${result.hebrewName}. ${result.facts.join(" ")}`;

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-2">
      <div className="w-full max-w-md animate-pop rounded-blob bg-white p-5 shadow-xl">
        {result.imageUrl && (
          <img
            src={result.imageUrl}
            alt={result.hebrewName}
            className="mb-4 h-48 w-full rounded-2xl object-cover"
          />
        )}

        <div className="text-center">
          <div className="text-6xl">{result.emoji}</div>
          <h2 className="mt-1 text-3xl font-black text-leaf-dark">{result.hebrewName}</h2>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-leaf-light px-3 py-0.5 font-bold text-leaf-dark">
              {result.category}
            </span>
            {result.score > 0 && (
              <span className="text-gray-400">ביטחון {Math.round(result.score * 100)}%</span>
            )}
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {result.facts.map((fact, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-2xl bg-leaf-light/60 p-3 text-lg text-leaf-dark"
            >
              <span>💡</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>

        {result.caution && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-100 p-3 text-amber-800">
            <span className="text-xl">⚠️</span>
            <span className="font-bold">{result.caution}</span>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <SpeakButton text={speakText} />
        </div>
      </div>

      {/* פסקול הצלחה: מדבקה + נקודות */}
      {outcome && (
        <div className="mt-5 flex flex-col items-center gap-1 text-center animate-pop">
          <div className="text-xl font-black text-leaf-dark">
            {outcome.isNew ? "🎉 מדבקה חדשה לאלבום!" : "👍 כבר יש לך את זה — כל הכבוד!"}
          </div>
          <div className="text-lg font-bold text-amber-600">+{outcome.pointsGained} נקודות ⭐</div>
          {outcome.challengeCompletedNow && (
            <div className="text-lg font-bold text-green-600">✓ השלמת את אתגר היום! 🔥</div>
          )}
        </div>
      )}

      <div className="mt-6 flex w-full max-w-md gap-3">
        <button onClick={onCapture} className="big-btn flex-1 bg-leaf text-xl">
          📷 עוד צמח!
        </button>
        <button onClick={onAlbum} className="big-btn flex-1 bg-sky text-xl">
          📔 לאלבום
        </button>
      </div>

      {showBadges && outcome && (
        <BadgeToast badgeIds={outcome.newBadgeIds} onClose={() => setShowBadges(false)} />
      )}
    </div>
  );
}
