import { playPop } from "../lib/sound";
import type { Challenge } from "../data/challenges";
import type { Player } from "../types";

interface HomeProps {
  activePlayer: Player | null;
  playerCount: number;
  stickerCount: number;
  totalPlants: number;
  challenge: Challenge;
  challengeDoneToday: boolean;
  onCapture: () => void;
  onAlbum: () => void;
  onChallenges: () => void;
  onPlayers: () => void;
  onParents: () => void;
}

export function Home({
  activePlayer,
  playerCount,
  stickerCount,
  totalPlants,
  challenge,
  challengeDoneToday,
  onCapture,
  onAlbum,
  onChallenges,
  onPlayers,
  onParents
}: HomeProps) {
  const go = (fn: () => void) => () => {
    playPop();
    fn();
  };

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      {/* שחקן/ית פעיל/ה */}
      {activePlayer && (
        <button
          onClick={go(onPlayers)}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow active:scale-95"
        >
          <span className="text-2xl">{activePlayer.avatar}</span>
          <span className="font-bold text-leaf-dark">{activePlayer.name}</span>
          {playerCount > 1 && <span className="text-sm text-leaf-dark/50">🔄 החלפה</span>}
        </button>
      )}

      <div className="mt-3 text-center">
        <div className="text-6xl animate-float">🌱🔎</div>
        <h1 className="mt-2 text-4xl font-black text-leaf-dark">בלש הצמחים</h1>
        <p className="mt-1 text-lg text-leaf-dark/70">מצלמים צמח — ומגלים מה הוא!</p>
      </div>

      <button
        onClick={go(onCapture)}
        className="big-btn mt-6 flex w-full max-w-xs flex-col items-center gap-1 bg-gradient-to-b from-leaf to-leaf-dark py-8 text-3xl animate-pop"
      >
        <span className="text-6xl">📷</span>
        צַלְמוּ צמח!
      </button>

      {/* אתגר (יומי או מותאם על-ידי הורה) */}
      <button
        onClick={go(onChallenges)}
        className="mt-6 w-full max-w-xs rounded-blob bg-sun/20 p-4 text-right shadow active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
          <span>{challenge.id === "custom" ? "אתגר מההורים" : "אתגר היום"}</span>
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

      <div className="mt-4 flex w-full max-w-xs gap-3">
        <button
          onClick={go(onPlayers)}
          className="flex-1 rounded-blob bg-white p-4 text-center font-bold text-leaf-dark shadow active:scale-95"
        >
          🏆 טבלת ניצחונות
        </button>
        <button
          onClick={go(onParents)}
          className="rounded-blob bg-white px-4 py-4 text-center font-bold text-leaf-dark shadow active:scale-95"
        >
          👪
        </button>
      </div>
    </div>
  );
}
