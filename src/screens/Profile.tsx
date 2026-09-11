import { useState } from "react";
import { PasswordInput } from "../components/PasswordInput";
import { AVATARS } from "../lib/players";
import { playPop } from "../lib/sound";
import type { PublicAccount } from "../lib/auth";

interface ProfileProps {
  account: PublicAccount;
  onChangeUsername: (name: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  onUpdateProfile: (fields: {
    age?: number;
    password?: string;
    avatar?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const ERR: Record<string, string> = {
  exists: "השם כבר תפוס.",
  "bad-username": "שם לא תקין.",
  "bad-age": "גיל לא תקין.",
  "weak-password": "סיסמה קצרה מדי (לפחות 4).",
  offline: "אין חיבור לשרת.",
  "server-error": "משהו השתבש."
};

function Note({ msg }: { msg: { kind: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <div
      className={`mt-2 rounded-xl p-2 text-center text-sm font-bold ${
        msg.kind === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {msg.text}
    </div>
  );
}

export function Profile({ account, onChangeUsername, onUpdateProfile }: ProfileProps) {
  const [name, setName] = useState(account.username);
  const [age, setAge] = useState(String(account.age));
  const [password, setPassword] = useState("");
  const [nameMsg, setNameMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [ageMsg, setAgeMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const saveName = async () => {
    setNameMsg(null);
    const res = await onChangeUsername(name.trim());
    setNameMsg(res.ok ? { kind: "ok", text: "השם עודכן ✅" } : { kind: "err", text: ERR[res.error] ?? ERR["server-error"] });
  };
  const saveAge = async () => {
    setAgeMsg(null);
    const res = await onUpdateProfile({ age: Number(age) });
    setAgeMsg(res.ok ? { kind: "ok", text: "הגיל עודכן ✅" } : { kind: "err", text: ERR[res.error] ?? ERR["server-error"] });
  };
  const savePass = async () => {
    setPassMsg(null);
    const res = await onUpdateProfile({ password });
    if (res.ok) {
      setPassword("");
      setPassMsg({ kind: "ok", text: "הסיסמה עודכנה ✅" });
    } else {
      setPassMsg({ kind: "err", text: ERR[res.error] ?? ERR["server-error"] });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-12 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">
        {account.avatar} הפרופיל שלי
      </h2>

      {/* דמות */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-lg font-black text-leaf-dark">הדמות שלי</h3>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => {
                playPop();
                void onUpdateProfile({ avatar: a });
              }}
              className={`aspect-square rounded-xl text-2xl ${
                a === account.avatar ? "bg-leaf-light ring-4 ring-leaf" : "bg-gray-100"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      {/* שם */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-lg font-black text-leaf-dark">שם משתמש</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="mt-2 w-full rounded-2xl border-2 border-leaf-light bg-white px-4 py-3 text-lg outline-none focus:border-leaf"
        />
        <button
          onClick={saveName}
          disabled={name.trim().length < 2 || name.trim() === account.username}
          className="big-btn mt-3 w-full bg-leaf py-2 text-base disabled:opacity-40"
        >
          שמירת שם
        </button>
        <Note msg={nameMsg} />
      </section>

      {/* גיל */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-lg font-black text-leaf-dark">גיל</h3>
        <p className="text-xs text-leaf-dark/60">מעל 16 = חשבון הורה (עם אזור ניהול).</p>
        <input
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          maxLength={3}
          className="mt-2 w-full rounded-2xl border-2 border-leaf-light bg-white px-4 py-3 text-lg outline-none focus:border-leaf"
        />
        <button
          onClick={saveAge}
          disabled={Number(age) < 3 || Number(age) === account.age}
          className="big-btn mt-3 w-full bg-leaf py-2 text-base disabled:opacity-40"
        >
          שמירת גיל
        </button>
        <Note msg={ageMsg} />
      </section>

      {/* סיסמה */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-lg font-black text-leaf-dark">שינוי סיסמה</h3>
        <div className="mt-2">
          <PasswordInput value={password} onChange={setPassword} placeholder="סיסמה חדשה" />
        </div>
        <button
          onClick={savePass}
          disabled={password.length < 4}
          className="big-btn mt-3 w-full bg-leaf py-2 text-base disabled:opacity-40"
        >
          עדכון סיסמה
        </button>
        <Note msg={passMsg} />
      </section>
    </div>
  );
}
