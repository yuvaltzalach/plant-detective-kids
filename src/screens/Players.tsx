import type { LeaderRow } from "../hooks/useProgress";

interface PlayersProps {
  leaderboard: LeaderRow[];
  activeId: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Players({ leaderboard, activeId }: PlayersProps) {
  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">🏆 טבלת הניצחונות</h2>
      <p className="text-center text-leaf-dark/70">כל החשבונות במכשיר הזה</p>

      <div className="mt-5 space-y-3">
        {leaderboard.map((row, i) => {
          const isActive = row.player.id === activeId;
          return (
            <div
              key={row.player.id}
              className={`flex w-full items-center gap-3 rounded-blob p-4 shadow ${
                isActive ? "bg-leaf-light ring-4 ring-leaf" : "bg-white"
              }`}
            >
              <span className="w-8 text-center text-2xl font-black">{MEDALS[i] ?? i + 1}</span>
              <span className="text-4xl">{row.player.avatar}</span>
              <span className="flex-1">
                <span className="block text-lg font-bold text-leaf-dark">
                  {row.player.name}
                  {isActive && <span className="mr-2 text-sm text-leaf">‹ זה אני</span>}
                </span>
                <span className="block text-sm text-leaf-dark/60">
                  רמה {row.level} · 📔 {row.stickers} · 🏅 {row.badges}
                </span>
              </span>
              <span className="text-xl font-black text-amber-600">⭐ {row.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
