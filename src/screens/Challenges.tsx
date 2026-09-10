import confetti from "canvas-confetti";
import { BADGES } from "../data/badges";
import { dateKey, type Challenge } from "../data/challenges";
import { playSuccess } from "../lib/sound";
import type { ProgressState } from "../types";

interface ChallengesProps {
  state: ProgressState;
  challenge: Challenge;
  onCapture: () => void;
  onCompleteManually: () => void;
}

export function Challenges({ state, challenge, onCapture, onCompleteManually }: ChallengesProps) {
  const doneToday = state.lastChallengeDate === dateKey();
  const earned = new Set(state.badges.map((b) => b.id));
  const isCustom = challenge.id === "custom";

  const handleFound = () => {
    onCompleteManually();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    playSuccess();
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">🎯 אתגרים ותגים</h2>

      {/* האתגר הפעיל */}
      <div className="mt-4 rounded-blob bg-sun/20 p-5 text-center shadow">
        <div className="text-sm font-bold text-amber-700">
          {isCustom ? "אתגר מההורים 👪" : "האתגר של היום"}
        </div>
        <div className="mt-2 text-5xl">{challenge.emoji}</div>
        <div className="mt-2 text-xl font-bold text-leaf-dark">{challenge.text}</div>

        <div className="mt-3">
          {doneToday ? (
            <span className="rounded-full bg-green-500 px-4 py-1 font-bold text-white">
              ✓ הושלם! כל הכבוד
            </span>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button onClick={onCapture} className="big-btn bg-leaf text-lg">
                📷 קדימה לצלם!
              </button>
              {/* אתגר טקסט חופשי — הילד/ה מסמן/ת שמצא/ה */}
              {challenge.manual && (
                <button
                  onClick={handleFound}
                  className="rounded-full bg-amber-400 px-6 py-2 text-lg font-bold text-white active:scale-95"
                >
                  ✋ מצאתי!
                </button>
              )}
            </div>
          )}
        </div>

        {state.challengeStreak > 0 && (
          <div className="mt-3 text-lg font-bold text-amber-600">
            🔥 רצף של {state.challengeStreak} ימים!
          </div>
        )}
      </div>

      {/* תגים */}
      <h3 className="mt-6 text-xl font-black text-leaf-dark">התגים שלי</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {BADGES.map((b) => {
          const has = earned.has(b.id);
          return (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-2xl p-3 ${
                has ? "bg-white shadow-md" : "bg-gray-200/60"
              }`}
            >
              <div className={`text-4xl ${has ? "" : "opacity-30 grayscale"}`}>{b.emoji}</div>
              <div>
                <div className={`font-bold ${has ? "text-leaf-dark" : "text-gray-400"}`}>
                  {b.name}
                </div>
                <div className="text-xs text-gray-500">{has ? b.description : "עוד לא הושג"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
