import { BADGES } from "../data/badges";
import { challengeForDate, dateKey } from "../data/challenges";
import type { ProgressState } from "../types";

interface ChallengesProps {
  state: ProgressState;
  onCapture: () => void;
}

export function Challenges({ state, onCapture }: ChallengesProps) {
  const challenge = challengeForDate();
  const doneToday = state.lastChallengeDate === dateKey();
  const earned = new Set(state.badges.map((b) => b.id));

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">🎯 אתגרים ותגים</h2>

      {/* אתגר יומי */}
      <div className="mt-4 rounded-blob bg-sun/20 p-5 text-center shadow">
        <div className="text-sm font-bold text-amber-700">האתגר של היום</div>
        <div className="mt-2 text-5xl">{challenge.emoji}</div>
        <div className="mt-2 text-xl font-bold text-leaf-dark">{challenge.text}</div>
        <div className="mt-3">
          {doneToday ? (
            <span className="rounded-full bg-green-500 px-4 py-1 font-bold text-white">
              ✓ הושלם! כל הכבוד
            </span>
          ) : (
            <button onClick={onCapture} className="big-btn bg-leaf text-lg">
              📷 קדימה לצלם!
            </button>
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
