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
  onParent: () => void;
}

type Mode = "role" | "children" | "create" | "code";

/** מסך פתיחה: בוחרים אם אני ילד/ה (נכנסים לחשבון) או הורה (ניהול וצפייה). */
export function Login({ players, onSelect, onCreate, onLoginCode, onParent }: LoginProps) {
  const [mode, setMode] = useState<Mode>("role");
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

  // יצירת ילד/ה חדש/ה
  if (mode === "create" || (mode === "children" && players.length === 0)) {
    return (
      <PlayerSetup
        title="חשבון חדש"
        submitLabel="יצירה והתחברות"
        onSubmit={(name, avatar) => onCreate(name, avatar)}
        onCancel={() => setMode(players.length === 0 ? "role" : "children")}
      />
    );
  }

  // מסך בחירת דמות (מי אתה?)
  if (mode === "role") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-8 text-center">
        <div className="text-6xl animate-float">🌱🔎</div>
        <h1 className="mt-2 text-4xl font-black text-leaf-dark">בלש הצמחים</h1>
        <p className="mt-1 text-leaf-dark/70">מי נכנס עכשיו?</p>

        <button
          onClick={() => {
            playPop();
            setMode("children");
          }}
          className="big-btn mt-8 flex w-full max-w-xs flex-col items-center gap-1 bg-gradient-to-b from-leaf to-leaf-dark py-7 text-2xl"
        >
          <span className="text-5xl">🧒</span>
          אני ילד/ה
        </button>

        <button
          onClick={() => {
            playPop();
            onParent();
          }}
          className="big-btn mt-4 flex w-full max-w-xs flex-col items-center gap-1 bg-sky py-7 text-2xl"
        >
          <span className="text-5xl">👪</span>
          אני הורה
        </button>
      </div>
    );
  }

  // כניסה עם קוד
  if (mode === "code") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <div className="text-6xl">🔑</div>
        <h2 className="mt-2 text-2xl font-black text-leaf-dark">כניסה עם קוד אישי</h2>
        <p className="mt-1 text-leaf-dark/70">מכניסים את הקוד כדי לשחק מכל טלפון</p>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setCodeErr(null);
          }}
          placeholder="הקוד שלי"
          maxLength={8}
          className="mt-5 w-full max-w-xs rounded-2xl border-2 border-leaf-light bg-white p-3 text-center text-2xl font-black tracking-widest outline-none focus:border-leaf"
        />
        {codeErr && <div className="mt-2 font-bold text-red-500">{codeErr}</div>}
        <button
          onClick={submitCode}
          disabled={busy || code.trim().length < 4}
          className="big-btn mt-4 w-full max-w-xs bg-leaf disabled:opacity-40"
        >
          {busy ? "מתחבר..." : "כניסה"}
        </button>
        <button onClick={() => setMode("children")} className="mt-4 text-leaf-dark/60 underline">
          חזרה
        </button>
      </div>
    );
  }

  // בחירת חשבון ילד/ה
  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-8">
      <div className="text-center">
        <div className="text-5xl animate-float">🧒</div>
        <h1 className="mt-2 text-3xl font-black text-leaf-dark">מי משחק?</h1>
        <p className="mt-1 text-leaf-dark/70">בחרו את החשבון שלכם</p>
      </div>

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-4">
        {players.map((p) => {
          const rank = levelTitle(levelForPoints(loadProgressFor(p.id).points).level);
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
            setMode("create");
          }}
          className="flex flex-col items-center justify-center rounded-blob border-4 border-dashed border-leaf-light bg-white/50 p-5 text-leaf-dark active:scale-95 transition-transform"
        >
          <span className="text-5xl">➕</span>
          <span className="mt-2 font-bold">חשבון חדש</span>
        </button>
      </div>

      <button onClick={() => setMode("code")} className="mt-6 text-leaf-dark/60 underline">
        🔑 יש לי קוד חשבון
      </button>
      <button onClick={() => setMode("role")} className="mt-3 text-leaf-dark/50 underline">
        חזרה
      </button>
    </div>
  );
}
