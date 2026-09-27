import { BADGES } from "../data/badges";
import { dateKey, type Challenge } from "../data/challenges";
import type { ProgressState } from "../types";

interface ChallengesProps {
  state: ProgressState;
  challenge: Challenge;
  onCapture: () => void;
}

export function Challenges({ state, challenge, onCapture }: ChallengesProps) {
  const doneToday = state.lastChallengeDate === dateKey();
  const earned = new Set(state.badges.map((b) => b.id));
  const need = challenge.count ?? 1;
  const progress = state.todayDate === dateKey() ? (state.todayChallengeCount ?? 0) : 0;

  return (
    <div className="garden-page garden-page--challenges screen-rise flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="relative">
        <div className="title-glow" aria-hidden="true" />
        <h2 className="relative text-center text-3xl font-black text-leaf-dark">
          🎯 אתגרים ותגים
        </h2>
      </div>

      {/* האתגר הפעיל */}
      <div className="mt-4 rounded-blob bg-sun/20 p-5 text-center ring-1 ring-amber-900/5 shadow-[0_10px_24px_-14px_rgba(120,53,15,0.45)]">
        <div className="text-sm font-bold text-amber-700">
          האתגר של היום · אותו אתגר לכל החברים
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
              {need > 1 && (
                <span className="text-sm font-bold text-leaf-dark/80">
                  התקדמות: {Math.min(progress, need)} מתוך {need}
                </span>
              )}
              <button onClick={onCapture} className="big-btn bg-leaf text-lg">
                📷 קדימה לצלם!
              </button>
              <span className="text-xs text-leaf-dark/70">האתגר מסומן לבד כשהאפליקציה מזהה צמח מתאים</span>
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
      <h3 className="mt-6 text-xl font-black text-leaf-dark">
        התגים שלי{" "}
        <span className="text-base text-leaf-dark/80">
          ({earned.size} מתוך {BADGES.length})
        </span>
      </h3>
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
                <div className={`font-bold ${has ? "text-leaf-dark" : "text-gray-500"}`}>
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
