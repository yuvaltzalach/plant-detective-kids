import { playPop } from "../lib/sound";
import { Mascot } from "../components/Mascot";
import { levelTitle } from "../data/levels";
import type { Challenge } from "../data/challenges";
import type { Player, PlantContent } from "../types";

interface HomeProps {
  activePlayer: Player | null;
  playerCount: number;
  level: number;
  stickerCount: number;
  totalPlants: number;
  challenge: Challenge;
  challengeDoneToday: boolean;
  plantOfDay: PlantContent;
  onCapture: () => void;
  onAlbum: () => void;
  onChallenges: () => void;
  onPlayers: () => void;
  onOnline: () => void;
  onEncyclopedia: () => void;
  onPlantOfDay: () => void;
  onGames: () => void;
  onSwitchAccount: () => void;
  onParents: () => void;
}

export function Home(props: HomeProps) {
  const {
    activePlayer,
    level,
    stickerCount,
    totalPlants,
    challenge,
    challengeDoneToday,
    plantOfDay
  } = props;
  const rank = levelTitle(level);
  const go = (fn: () => void) => () => {
    playPop();
    fn();
  };

  const tile = "rounded-blob bg-white p-4 text-center font-bold text-leaf-dark shadow active:scale-95 transition-transform";

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      {/* שחקן/ית פעיל/ה + דרגה */}
      {activePlayer && (
        <button
          onClick={go(props.onSwitchAccount)}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow active:scale-95"
        >
          <span className="text-2xl">{activePlayer.avatar}</span>
          <span className="font-bold text-leaf-dark">{activePlayer.name}</span>
          <span className="rounded-full bg-leaf-light px-2 py-0.5 text-xs font-bold text-leaf-dark">
            {rank.emoji} {rank.name}
          </span>
          <span className="text-sm text-leaf-dark/50">🔄</span>
        </button>
      )}

      <div className="mt-3 text-center">
        <div className="text-6xl animate-float">🌱🔎</div>
        <h1 className="mt-2 text-4xl font-black text-leaf-dark">בלש הצמחים</h1>
        <p className="mt-1 text-lg text-leaf-dark/70">מצלמים צמח — ומגלים מה הוא!</p>
      </div>

      <Mascot />

      <button
        onClick={go(props.onCapture)}
        className="big-btn mt-5 flex w-full max-w-xs flex-col items-center gap-1 bg-gradient-to-b from-leaf to-leaf-dark py-7 text-3xl animate-pop"
      >
        <span className="text-6xl">📷</span>
        צַלְמוּ צמח!
      </button>

      {/* אתגר */}
      <button
        onClick={go(props.onChallenges)}
        className="mt-5 w-full max-w-xs rounded-blob bg-sun/20 p-4 text-right shadow active:scale-95 transition-transform"
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

      {/* צמח היום */}
      <button
        onClick={go(props.onPlantOfDay)}
        className="mt-3 w-full max-w-xs rounded-blob bg-sky/15 p-4 text-right shadow active:scale-95 transition-transform"
      >
        <div className="text-sm font-bold text-sky-700">🌟 צמח היום</div>
        <div className="mt-1 flex items-center gap-2 text-lg font-bold text-leaf-dark">
          <span className="text-3xl">{plantOfDay.emoji}</span>
          {plantOfDay.hebrewName}
        </div>
      </button>

      {/* כפתורים מהירים */}
      <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-3">
        <button onClick={go(props.onAlbum)} className={tile}>
          📔 האלבום שלי
          <div className="text-xs font-normal text-leaf-dark/50">
            {stickerCount} / {totalPlants}
          </div>
        </button>
        <button onClick={go(props.onEncyclopedia)} className={tile}>
          📖 אנציקלופדיה
        </button>
        <button onClick={go(props.onGames)} className={tile}>
          🎮 משחקים
        </button>
        <button onClick={go(props.onOnline)} className={tile}>
          🌍 תחרות אונליין
        </button>
        <button onClick={go(props.onPlayers)} className={`${tile} col-span-2`}>
          🏆 טבלת ניצחונות מקומית
        </button>
      </div>

      <button onClick={go(props.onParents)} className="mt-4 text-leaf-dark/50 underline">
        👪 אזור הורים
      </button>
    </div>
  );
}
