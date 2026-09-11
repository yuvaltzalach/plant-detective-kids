import { useState } from "react";
import { AVATARS } from "../lib/players";
import { PasswordInput } from "../components/PasswordInput";
import { playPop } from "../lib/sound";
import type { AuthResult, ForgotInfo } from "../lib/auth";

interface AuthProps {
  onSignup: (username: string, age: number, password: string, avatar: string) => Promise<AuthResult>;
  onLogin: (username: string, password: string) => Promise<AuthResult>;
  onForgot: (username: string) => Promise<ForgotInfo | null>;
}

const ERRORS: Record<string, string> = {
  exists: "שם המשתמש כבר תפוס, בחרו אחר.",
  "weak-password": "הסיסמה קצרה מדי (לפחות 4 תווים).",
  "bad-username": "שם משתמש לא תקין.",
  "bad-age": "בבקשה הכניסו גיל תקין.",
  "not-found": "שם משתמש או סיסמה שגויים.",
  "wrong-password": "שם משתמש או סיסמה שגויים.",
  offline: "אין חיבור לשרת (ייתכן שהאונליין לא הוגדר עדיין).",
  "online-not-configured": "השרת עדיין לא הוגדר (חסר KV).",
  "server-error": "משהו השתבש, נסו שוב."
};

export function Auth({ onSignup, onLogin, onForgot }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    const res =
      mode === "signup"
        ? await onSignup(username.trim(), Number(age), password, avatar)
        : await onLogin(username.trim(), password);
    setBusy(false);
    if (!res.ok) setErr(ERRORS[res.error] ?? ERRORS["server-error"]);
  };

  const checkForgot = async () => {
    setBusy(true);
    setForgotMsg(null);
    const info = await onForgot(username.trim());
    setBusy(false);
    if (!info) setForgotMsg("אין חיבור לשרת. נסו שוב מאוחר יותר.");
    else if (!info.exists) setForgotMsg("לא נמצא משתמש בשם הזה 🤔");
    else if (info.hasParent)
      setForgotMsg("בקשו מההורה שלכם לאפס לכם את הסיסמה — באזור ההורים יש כפתור 'איפוס סיסמה' 👪");
    else
      setForgotMsg(
        "אין שחזור אוטומטי לחשבון הזה (אין הורה מקושר). אפשר לבקש שהורה יקשר את החשבון ואז יאפס, או להירשם מחדש."
      );
  };

  // מסך שכחתי סיסמה
  if (mode === "forgot") {
    return (
      <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-8">
        <div className="text-6xl">🔑</div>
        <h2 className="mt-2 text-2xl font-black text-leaf-dark">שכחתי סיסמה</h2>
        <p className="mt-1 text-center text-leaf-dark/70">הכניסו את שם המשתמש</p>
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setForgotMsg(null);
          }}
          placeholder="שם משתמש"
          maxLength={24}
          className="mt-5 w-full max-w-xs rounded-2xl border-2 border-leaf-light bg-white px-4 py-3 text-lg outline-none focus:border-leaf"
        />
        <button
          onClick={checkForgot}
          disabled={busy || username.trim().length < 2}
          className="big-btn mt-4 w-full max-w-xs bg-leaf disabled:opacity-40"
        >
          {busy ? "בודק..." : "בדיקה"}
        </button>
        {forgotMsg && (
          <div className="mt-4 w-full max-w-xs rounded-2xl bg-sun/20 p-4 text-center font-bold text-leaf-dark">
            {forgotMsg}
          </div>
        )}
        <button onClick={() => setMode("login")} className="mt-5 text-leaf-dark/60 underline">
          חזרה לכניסה
        </button>
      </div>
    );
  }

  const canSubmit =
    username.trim().length >= 2 && password.length >= 4 && (mode === "login" || Number(age) >= 3);

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-8">
      <div className="text-center">
        <div className="text-6xl animate-float">🌱🔎</div>
        <h1 className="mt-2 text-4xl font-black text-leaf-dark">בלש הצמחים</h1>
        <p className="mt-1 text-leaf-dark/70">{mode === "signup" ? "יוצרים חשבון פעם אחת" : "כניסה לחשבון"}</p>
      </div>

      <div className="mt-6 flex w-full max-w-xs rounded-full bg-white p-1 shadow">
        <button
          onClick={() => {
            setMode("login");
            setErr(null);
          }}
          className={`flex-1 rounded-full py-2 font-bold ${
            mode === "login" ? "bg-leaf text-white" : "text-leaf-dark"
          }`}
        >
          כניסה
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setErr(null);
          }}
          className={`flex-1 rounded-full py-2 font-bold ${
            mode === "signup" ? "bg-leaf text-white" : "text-leaf-dark"
          }`}
        >
          חשבון חדש
        </button>
      </div>

      <div className="mt-5 w-full max-w-xs space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="שם משתמש"
          maxLength={24}
          className="w-full rounded-2xl border-2 border-leaf-light bg-white px-4 py-3 text-lg outline-none focus:border-leaf"
        />

        {mode === "signup" && (
          <input
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="גיל"
            maxLength={3}
            className="w-full rounded-2xl border-2 border-leaf-light bg-white px-4 py-3 text-lg outline-none focus:border-leaf"
          />
        )}

        <PasswordInput value={password} onChange={setPassword} />

        {mode === "signup" && (
          <div>
            <div className="mb-1 text-sm font-bold text-leaf-dark/70">בחרו דמות:</div>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    playPop();
                    setAvatar(a);
                  }}
                  className={`aspect-square rounded-xl text-2xl ${
                    a === avatar ? "bg-leaf-light ring-4 ring-leaf" : "bg-white"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-leaf-dark/50">
              עד גיל 16 — חשבון ילד/ה. מעל 16 — חשבון הורה (עם אזור ניהול).
            </p>
          </div>
        )}

        {err && <div className="rounded-2xl bg-red-100 p-3 text-center font-bold text-red-600">{err}</div>}

        <button onClick={submit} disabled={!canSubmit || busy} className="big-btn w-full bg-leaf disabled:opacity-40">
          {busy ? "רגע..." : mode === "signup" ? "יצירת חשבון" : "כניסה"}
        </button>

        {mode === "login" && (
          <button
            onClick={() => {
              setMode("forgot");
              setErr(null);
              setForgotMsg(null);
            }}
            className="w-full text-center text-leaf-dark/60 underline"
          >
            שכחתי סיסמה
          </button>
        )}
      </div>
    </div>
  );
}
