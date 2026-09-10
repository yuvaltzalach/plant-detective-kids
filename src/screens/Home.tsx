import { challengeForDate } from "../data/challenges";
import { playPop } from "../lib/sound";

interface HomeProps {
  stickerCount: number;
  totalPlants: number;
  challengeDoneToday: boolean;
  onCapture: () => void;
  onAlbum: () => void;
  onChallenges: () => void;
}

export function Home({
  stickerCount,
  totalPlants,
  challengeDoneToday,
  onCapture,
  onAlbum,
  onChallenges
}: HomeProps) {
  const challenge = challengeForDate();
  const go = (fn: () => void) => () => {
    playPop();
    fn();
  };

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      <div className="mt-2 text-center">
        <div className="text-6xl animate-float">🌱🔎</div>
        <h1 className="mt-2 text-4xl font-black text-leaf-dark">בלש הצמחים</h1>
        <p className="mt-1 text-lg text-leaf-dark/70">מצלמים צמח — ומגלים מה הוא!</p>
      </div>

      <button
        onClick={go(onCapture)}
        className="big-btn mt-8 flex w-full max-w-xs flex-col items-center gap-1 bg-gradient-to-b from-leaf to-leaf-dark py-8 text-3xl animate-pop"
      >
        <span className="text-6xl">📷</span>
        צַלְמוּ צמח!
      </button>

      {/* אתגר היום */}
      <button
        onClick={go(onChallenges)}
        className="mt-6 w-full max-w-xs rounded-blob bg-sun/20 p-4 text-right shadow active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
          <span>אתגר היום</span>
          {challengeDoneToday && <span className="text-green-600">✓ הושלם!</span>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-lg font-bold text-leaf-dark">
          <span className="text-3xl">{challenge.emoji}</span>
          {challenge.text}
        </div>
      </button>

      <button
        onClick={go(onAlbum)}
        className="mt-4 w-full max-w-xs rounded-blob bg-white p-4 text-right shadow active:scale-95 transition-transform"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-leaf-dark">📔 האלבום שלי</span>
          <span className="rounded-full bg-leaf-light px-3 py-1 text-sm font-bold text-leaf-dark">
            {stickerCount} / {totalPlants}
          </span>
        </div>
      </button>
    </div>
  );
}
