import { playPop } from "../lib/sound";
import { levelTitle } from "../data/levels";
import type { Challenge } from "../data/challenges";
import type { PlantContent } from "../types";
import type { PublicAccount } from "../lib/auth";

interface HomeProps {
  account: PublicAccount | null;
  level: number;
  stickerCount: number;
  totalPlants: number;
  challenge: Challenge;
  challengeDoneToday: boolean;
  plantOfDay: PlantContent;
  onCapture: () => void;
  onAlbum: () => void;
  onChallenges: () => void;
  onOnline: () => void;
  onEncyclopedia: () => void;
  onPlantOfDay: () => void;
  onGames: () => void;
  onParents: () => void;
  onLogout: () => void;
  onProfile: () => void;
}

export function Home(props: HomeProps) {
  const {
    account,
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

  const navTile =
    "rounded-blob bg-white p-3 text-center shadow-[0_8px_20px_-12px_rgba(20,83,45,0.35)] ring-1 ring-leaf-dark/5 active:scale-95 transition-transform";
  const chip = "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-2xl";
  const albumPct = totalPlants > 0 ? Math.round((stickerCount / totalPlants) * 100) : 0;

  return (
    <div className="relative flex flex-1 flex-col">
      <div aria-hidden="true" className="home-bg" />

      <div className="home-rise flex flex-1 flex-col items-center px-6 pb-10 pt-4">
        {/* זהות המשתמש + יציאה */}
        {account && (
          <div className="flex w-full max-w-xs items-center justify-between">
            <button
              onClick={go(props.onProfile)}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-[0_6px_16px_-10px_rgba(20,83,45,0.5)] ring-1 ring-leaf-dark/5 active:scale-95"
              aria-label="הפרופיל שלי"
            >
              <span className="text-2xl">{account.avatar}</span>
              <span className="font-bold text-leaf-dark">{account.username}</span>
              <span className="rounded-full bg-leaf-light px-2 py-0.5 text-xs font-bold text-leaf-dark">
                {rank.emoji} {rank.name}
              </span>
              <span className="text-xs text-leaf-dark/70">⚙️</span>
            </button>
            <button
              onClick={() => {
                if (confirm("להתנתק מהחשבון?")) props.onLogout();
              }}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-leaf-dark shadow-[0_6px_16px_-10px_rgba(20,83,45,0.5)] ring-1 ring-leaf-dark/5 active:scale-95"
            >
              🚪 יציאה
            </button>
          </div>
        )}

        <div className="relative mt-10 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1 h-24 w-28 -translate-x-1/2 rounded-full bg-sun/30 blur-2xl"
          />
          <div className="relative text-6xl drop-shadow-sm">🌱🔎</div>
          <h1 className="mt-2 text-4xl font-black text-leaf-dark">בלש הצמחים</h1>
          <p className="mt-1 text-lg text-leaf-dark/80">מצלמים צמח — ומגלים מה הוא!</p>
        </div>

        {/* פעולה ראשית — כפתור עם עומק ורוד־אור */}
        <button
          onClick={go(props.onCapture)}
          className="relative mt-6 w-full max-w-xs overflow-hidden rounded-blob bg-gradient-to-b from-leaf to-leaf-dark py-7 text-3xl font-bold text-white shadow-[0_16px_34px_-10px_rgba(21,128,61,0.6)] ring-1 ring-inset ring-white/25 transition active:scale-[0.97] active:shadow-[0_8px_18px_-10px_rgba(21,128,61,0.55)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent"
          />
          <span className="relative flex flex-col items-center gap-1">
            <span className="text-6xl drop-shadow">📷</span>
            צַלְמוּ צמח!
          </span>
        </button>

        {/* רצועת "היום" — אתגר + צמח היום כיחידה מקובצת אחת */}
        <section className="mt-7 w-full max-w-xs">
          <h2 className="mb-2 pr-1 text-sm font-black text-leaf-dark/80">✨ היום</h2>
          <div className="space-y-2.5">
            <button
              onClick={go(props.onChallenges)}
              className="flex w-full items-center gap-3 rounded-blob bg-sun/25 p-4 text-right shadow-[0_10px_22px_-14px_rgba(120,53,15,0.5)] ring-1 ring-amber-900/5 active:scale-95 transition-transform"
            >
              <span className="text-3xl">{challenge.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  {challenge.id === "custom" ? "אתגר מההורים" : "אתגר היום"}
                  {challengeDoneToday && <span className="text-green-700">✓ הושלם</span>}
                </span>
                <span className="mt-0.5 block truncate text-base font-bold text-leaf-dark">
                  {challenge.text}
                </span>
              </span>
              <span className="text-xl text-amber-700/50" aria-hidden="true">
                ‹
              </span>
            </button>

            <button
              onClick={go(props.onPlantOfDay)}
              className="flex w-full items-center gap-3 rounded-blob bg-sky/20 p-4 text-right shadow-[0_10px_22px_-14px_rgba(12,74,110,0.5)] ring-1 ring-sky-900/5 active:scale-95 transition-transform"
            >
              <span className="text-3xl">{plantOfDay.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-sky-800">🌟 צמח היום</span>
                <span className="mt-0.5 block truncate text-base font-bold text-leaf-dark">
                  {plantOfDay.hebrewName}
                </span>
              </span>
              <span className="text-xl text-sky-700/50" aria-hidden="true">
                ‹
              </span>
            </button>
          </div>
        </section>

        {/* ניווט — אריחים עם צ'יפ־אייקון צבעוני לכל אחד */}
        <section className="mt-6 w-full max-w-xs">
          <h2 className="mb-2 pr-1 text-sm font-black text-leaf-dark/80">🧭 עוד</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={go(props.onAlbum)} className={navTile}>
              <div className={`${chip} bg-amber-100`}>📔</div>
              <div className="mt-2 text-sm font-bold text-leaf-dark">האלבום שלי</div>
              <div className="mt-1 text-[11px] font-bold text-leaf-dark/80">
                {stickerCount} מתוך {totalPlants}
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-leaf-light">
                <div
                  className="h-full rounded-full bg-leaf transition-all"
                  style={{ width: `${albumPct}%` }}
                />
              </div>
            </button>
            <button onClick={go(props.onEncyclopedia)} className={navTile}>
              <div className={`${chip} bg-leaf-light`}>📖</div>
              <div className="mt-2 text-sm font-bold text-leaf-dark">אנציקלופדיה</div>
            </button>
            <button onClick={go(props.onGames)} className={navTile}>
              <div className={`${chip} bg-purple-100`}>🎮</div>
              <div className="mt-2 text-sm font-bold text-leaf-dark">משחקים</div>
            </button>
            <button onClick={go(props.onOnline)} className={navTile}>
              <div className={`${chip} bg-sky/20`}>🌍</div>
              <div className="mt-2 text-sm font-bold text-leaf-dark">תחרות אונליין</div>
            </button>
            {account?.isParent && (
              <button onClick={go(props.onParents)} className={`${navTile} col-span-2`}>
                <div className={`${chip} bg-rose-100`}>👪</div>
                <div className="mt-2 text-sm font-bold text-leaf-dark">אזור הורים</div>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
