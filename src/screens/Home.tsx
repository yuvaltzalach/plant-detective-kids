import { useState } from "react";
import { playPop } from "../lib/sound";
import { Mascot } from "../components/Mascot";
import { AVATARS } from "../lib/players";
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
  onUpdateAvatar: (avatar: string) => void;
  onChangeUsername: (name: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const RENAME_ERR: Record<string, string> = {
  exists: "השם כבר תפוס.",
  "bad-username": "שם לא תקין.",
  offline: "אין חיבור לשרת.",
  "server-error": "משהו השתבש."
};

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
  const [editAvatar, setEditAvatar] = useState(false);
  const go = (fn: () => void) => () => {
    playPop();
    fn();
  };

  const tile = "rounded-blob bg-white p-4 text-center font-bold text-leaf-dark shadow active:scale-95 transition-transform";

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      {/* זהות המשתמש + יציאה */}
      {account && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow">
              <button
                onClick={() => setEditAvatar((v) => !v)}
                className="relative text-2xl active:scale-90"
                aria-label="שינוי דמות"
              >
                {account.avatar}
                <span className="absolute -bottom-1 -left-1 text-[10px]">✏️</span>
              </button>
              <button
                onClick={async () => {
                  const name = prompt("שם משתמש חדש:", account.username);
                  if (name && name.trim() && name.trim() !== account.username) {
                    const res = await props.onChangeUsername(name.trim());
                    if (!res.ok) alert(RENAME_ERR[res.error] ?? RENAME_ERR["server-error"]);
                  }
                }}
                className="font-bold text-leaf-dark underline decoration-dotted"
              >
                {account.username}
              </button>
              <span className="rounded-full bg-leaf-light px-2 py-0.5 text-xs font-bold text-leaf-dark">
                {rank.emoji} {rank.name}
              </span>
            </div>
            <button
              onClick={() => {
                if (confirm("להתנתק מהחשבון?")) props.onLogout();
              }}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-leaf-dark shadow active:scale-95"
            >
              🚪 יציאה
            </button>
          </div>

          {editAvatar && (
            <div className="mt-2 grid grid-cols-6 gap-2 rounded-2xl bg-white p-3 shadow">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    playPop();
                    props.onUpdateAvatar(av);
                    setEditAvatar(false);
                  }}
                  className={`aspect-square rounded-xl text-2xl ${
                    av === account.avatar ? "bg-leaf-light ring-2 ring-leaf" : "bg-gray-100"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          )}
        </div>
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
        {account?.isParent && (
          <button onClick={go(props.onParents)} className={`${tile} col-span-2`}>
            👪 אזור הורים
          </button>
        )}
      </div>
    </div>
  );
}
