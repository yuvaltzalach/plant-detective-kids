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
  onLoginCode: (code: string) => Promise<"ok" | "not-found" | "offline">;
}

/** מסך כניסה בסגנון "מי משחק היום?" — כל ילד/ה בוחר/ת את החשבון שלו/ה. */
export function Login({ players, onSelect, onCreate, onLoginCode }: LoginProps) {
  const [adding, setAdding] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitCode = async () => {
    setBusy(true);
    setCodeErr(null);
    const res = await onLoginCode(code);
    setBusy(false);
    if (res === "not-found") setCodeErr("קוד לא נמצא. בדקו שהקלדתם נכון 🙂");
    else if (res === "offline") setCodeErr("אין חיבור לשרת (או שהאונליין לא הוגדר).");
  };

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

      {/* התחברות עם קוד חשבון (ממכשיר אחר) */}
      <div className="mt-8 w-full max-w-sm text-center">
        {!showCode ? (
          <button
            onClick={() => setShowCode(true)}
            className="text-leaf-dark/60 underline"
          >
            🔑 יש לי קוד חשבון (התחברות ממכשיר אחר)
          </button>
        ) : (
          <div className="rounded-blob bg-white p-4 shadow">
            <div className="font-bold text-leaf-dark">התחברות עם קוד אישי</div>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setCodeErr(null);
              }}
              placeholder="הקוד שלי"
              maxLength={8}
              className="mt-3 w-full rounded-2xl border-2 border-leaf-light bg-white p-3 text-center text-xl font-black tracking-widest outline-none focus:border-leaf"
            />
            {codeErr && <div className="mt-2 font-bold text-red-500">{codeErr}</div>}
            <button
              onClick={submitCode}
              disabled={busy || code.trim().length < 4}
              className="big-btn mt-3 w-full bg-leaf py-3 text-lg disabled:opacity-40"
            >
              {busy ? "מתחבר..." : "כניסה"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
