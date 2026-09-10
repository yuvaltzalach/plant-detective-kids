import { useState } from "react";
import { PlayerSetup } from "../components/PlayerSetup";
import { levelTitle } from "../data/levels";
import { playPop } from "../lib/sound";
import { loadProgressFor } from "../lib/players";
import { levelForPoints } from "../lib/progress";
import type { Player } from "../types";

interface LoginProps {
  players: Player[];
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string) => void;
}

/** מסך כניסה בסגנון "מי משחק היום?" — כל ילד/ה בוחר/ת את החשבון שלו/ה. */
export function Login({ players, onSelect, onCreate }: LoginProps) {
  const [adding, setAdding] = useState(false);

  if (adding || players.length === 0) {
    return (
      <PlayerSetup
        title="ילד/ה חדש/ה"
        submitLabel="יצירת חשבון"
        onSubmit={(name, avatar) => {
          onCreate(name, avatar);
          setAdding(false);
        }}
        onCancel={players.length > 0 ? () => setAdding(false) : undefined}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-8">
      <div className="text-center">
        <div className="text-6xl animate-float">🌱🔎</div>
        <h1 className="mt-2 text-3xl font-black text-leaf-dark">מי משחק היום?</h1>
        <p className="mt-1 text-leaf-dark/70">בחרו את החשבון שלכם</p>
      </div>

      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-4">
        {players.map((p) => {
          const st = loadProgressFor(p.id);
          const rank = levelTitle(levelForPoints(st.points).level);
          return (
            <button
              key={p.id}
              onClick={() => {
                playPop();
                onSelect(p.id);
              }}
              className="flex flex-col items-center rounded-blob bg-white p-5 shadow-lg active:scale-95 transition-transform"
            >
              <span className="text-6xl">{p.avatar}</span>
              <span className="mt-2 text-xl font-black text-leaf-dark">{p.name}</span>
              <span className="mt-1 rounded-full bg-leaf-light px-3 py-0.5 text-xs font-bold text-leaf-dark">
                {rank.emoji} {rank.name}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => {
            playPop();
            setAdding(true);
          }}
          className="flex flex-col items-center justify-center rounded-blob border-4 border-dashed border-leaf-light bg-white/50 p-5 text-leaf-dark active:scale-95 transition-transform"
        >
          <span className="text-5xl">➕</span>
          <span className="mt-2 font-bold">ילד/ה חדש/ה</span>
        </button>
      </div>
    </div>
  );
}
