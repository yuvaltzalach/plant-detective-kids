import { useEffect, useState } from "react";
import { levelTitle } from "../data/levels";
import { levelForPoints } from "../lib/progress";
import { randomCode, type GroupChallenge } from "../lib/online";
import type { ChildAccount } from "../lib/auth";
import type { AppSettings, CustomChallenge, PlantCategory } from "../types";

export interface OnlineControls {
  code: string | null;
  challenge: GroupChallenge | null;
  join: (raw: string) => void;
  leave: () => void;
  updateGroupChallenge: (c: { text: string; emoji: string; category?: string } | null) => void;
}

interface ParentsProps {
  settings: AppSettings;
  children: ChildAccount[] | null;
  onRefreshChildren: () => void;
  onLinkChild: (
    username: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDeleteChild: (username: string) => Promise<boolean>;
  onSetChallenge: (c: CustomChallenge) => void;
  onClearChallenge: () => void;
  online: OnlineControls;
}

const CATEGORIES: { label: string; value?: PlantCategory }[] = [
  { label: "כל צמח", value: undefined },
  { label: "עץ", value: "עץ" },
  { label: "פרח", value: "פרח" },
  { label: "עשב", value: "עשב" },
  { label: "צמח", value: "צמח" }
];
const EMOJI_CHOICES = ["🎯", "🌻", "🌳", "🌸", "🍎", "🟡", "🔴", "🟣", "🍃", "🐝"];
const LINK_ERR: Record<string, string> = {
  "child-not-found": "לא נמצא ילד/ה בשם הזה.",
  "wrong-password": "סיסמה שגויה.",
  offline: "אין חיבור לשרת.",
  "online-not-configured": "השרת עדיין לא הוגדר (חסר KV).",
  "server-error": "משהו השתבש, נסו שוב."
};

export function Parents(props: ParentsProps) {
  const [text, setText] = useState(props.settings.customChallenge?.text ?? "");
  const [emoji, setEmoji] = useState(props.settings.customChallenge?.emoji ?? "🎯");
  const [category, setCategory] = useState<PlantCategory | undefined>(
    props.settings.customChallenge?.category
  );
  const [childUser, setChildUser] = useState("");
  const [childPass, setChildPass] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [gText, setGText] = useState("");
  const [gEmoji, setGEmoji] = useState("🎯");
  const [gCategory, setGCategory] = useState<PlantCategory | undefined>(undefined);
  const current = props.settings.customChallenge;

  useEffect(() => {
    props.onRefreshChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const linkChild = async () => {
    const res = await props.onLinkChild(childUser.trim(), childPass);
    if (res.ok) {
      setChildUser("");
      setChildPass("");
    } else {
      alert(LINK_ERR[res.error] ?? LINK_ERR["server-error"]);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pb-12 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">👪 אזור הורים</h2>

      {/* הילדים המקושרים */}
      <section className="rounded-blob bg-white p-5 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-leaf-dark">🧒 הילדים שלי</h3>
          <button onClick={props.onRefreshChildren} className="text-sm font-bold text-leaf underline">
            🔄 רענון
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {(props.children ?? []).map((c) => {
            const points = c.progress?.points ?? 0;
            const level = levelForPoints(points).level;
            const rank = levelTitle(level);
            const stickers = Object.keys(c.progress?.stickers ?? {}).length;
            const badges = (c.progress?.badges ?? []).length;
            return (
              <div key={c.username} className="rounded-2xl bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{c.avatar}</span>
                  <div className="flex-1">
                    <div className="font-black text-leaf-dark">{c.username}</div>
                    <div className="text-xs text-leaf-dark/60">
                      {rank.emoji} {rank.name} · רמה {level} · גיל {c.age}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-amber-600">⭐ {points}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-leaf-dark/70">
                  <span>📔 {stickers} צמחים</span>
                  <span>🏅 {badges} תגים</span>
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          `למחוק לצמיתות את החשבון של ${c.username}? כל ההתקדמות תימחק ואי אפשר לבטל.`
                        )
                      ) {
                        const ok = await props.onDeleteChild(c.username);
                        if (!ok) alert("לא הצלחנו למחוק. נסו שוב.");
                      }
                    }}
                    className="mr-auto rounded-full bg-red-100 px-3 py-1 font-bold text-red-600"
                  >
                    🗑️ מחיקת חשבון
                  </button>
                </div>
              </div>
            );
          })}
          {props.children && props.children.length === 0 && (
            <p className="text-center text-sm text-leaf-dark/60">
              עדיין לא קישרתם ילדים. הוסיפו למטה עם שם המשתמש והסיסמה שלהם.
            </p>
          )}
          {props.children === null && (
            <p className="text-center text-sm text-leaf-dark/60">טוען... (דורש חיבור לשרת)</p>
          )}
        </div>

        {/* קישור ילד/ה */}
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="text-sm font-bold text-leaf-dark/70">
            קישור חשבון ילד/ה — הכניסו שם משתמש וסיסמה שלו/ה:
          </div>
          <input
            value={childUser}
            onChange={(e) => setChildUser(e.target.value)}
            placeholder="שם המשתמש של הילד/ה"
            className="mt-2 w-full rounded-2xl border-2 border-leaf-light bg-white p-2 outline-none focus:border-leaf"
          />
          <input
            type="password"
            value={childPass}
            onChange={(e) => setChildPass(e.target.value)}
            placeholder="הסיסמה של הילד/ה"
            className="mt-2 w-full rounded-2xl border-2 border-leaf-light bg-white p-2 outline-none focus:border-leaf"
          />
          <button
            onClick={linkChild}
            disabled={childUser.trim().length < 2 || childPass.length < 4}
            className="big-btn mt-3 w-full bg-leaf py-2 text-base disabled:opacity-40"
          >
            קישור הילד/ה לחשבון שלי
          </button>
        </div>
      </section>

      {/* אתגר אישי (במכשיר הזה) */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-xl font-black text-leaf-dark">🎯 אתגר אישי</h3>
        <p className="mt-1 text-sm text-leaf-dark/70">
          למשל "מצאו פרח עם עלים צהובים". יופיע במקום האתגר היומי במכשיר הזה.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="מצאו פרח עם עלים צהובים"
          rows={2}
          className="mt-3 w-full rounded-2xl border-2 border-leaf-light bg-white p-3 text-lg outline-none focus:border-leaf"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`h-10 w-10 rounded-xl text-2xl ${
                e === emoji ? "bg-leaf-light ring-2 ring-leaf" : "bg-gray-100"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                category === c.value ? "bg-leaf text-white" : "bg-gray-100 text-leaf-dark"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() =>
              props.onSetChallenge({ text: text.trim(), emoji, category, createdAt: Date.now() })
            }
            disabled={!text.trim()}
            className="big-btn flex-1 bg-leaf py-3 text-lg disabled:opacity-40"
          >
            שמירת אתגר
          </button>
          {current && (
            <button
              onClick={() => {
                props.onClearChallenge();
                setText("");
                setEmoji("🎯");
                setCategory(undefined);
              }}
              className="big-btn bg-gray-400 py-3 text-lg"
            >
              ביטול
            </button>
          )}
        </div>
        {current && (
          <div className="mt-3 rounded-2xl bg-leaf-light/60 p-3 text-center font-bold text-leaf-dark">
            אתגר פעיל: {current.emoji} {current.text}
          </div>
        )}
      </section>

      {/* תחרות אונליין */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-xl font-black text-leaf-dark">🏆 תחרות אונליין</h3>
        {!props.online.code ? (
          <>
            <p className="mt-1 text-sm text-leaf-dark/70">
              פתחו קבוצה (קוד לשיתוף) או הצטרפו לקוד קיים — טבלת ניצחונות משותפת בין כולם.
            </p>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="קוד קבוצה"
              maxLength={8}
              className="mt-3 w-full rounded-2xl border-2 border-leaf-light bg-white p-3 text-center text-xl font-black tracking-widest outline-none focus:border-leaf"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => props.online.join(codeInput)}
                disabled={codeInput.trim().length < 3}
                className="big-btn flex-1 bg-leaf py-2 text-base disabled:opacity-40"
              >
                הצטרפות
              </button>
              <button
                onClick={() => props.online.join(randomCode())}
                className="big-btn flex-1 bg-sky py-2 text-base"
              >
                ✨ קבוצה חדשה
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-2 rounded-2xl bg-leaf-light/60 p-3 text-center">
              <div className="text-sm font-bold text-leaf-dark/70">קוד הקבוצה לשיתוף:</div>
              <div className="text-3xl font-black tracking-widest text-leaf-dark">
                {props.online.code}
              </div>
            </div>
            <div className="mt-4 text-sm font-bold text-leaf-dark/70">אתגר לכל הקבוצה:</div>
            <textarea
              value={gText}
              onChange={(e) => setGText(e.target.value)}
              placeholder="מצאו פרח סגול"
              rows={2}
              className="mt-1 w-full rounded-2xl border-2 border-leaf-light p-2 outline-none focus:border-leaf"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  onClick={() => setGEmoji(e)}
                  className={`h-9 w-9 rounded-lg text-xl ${
                    e === gEmoji ? "bg-leaf-light ring-2 ring-leaf" : "bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setGCategory(c.value)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    gCategory === c.value ? "bg-leaf text-white" : "bg-gray-100 text-leaf-dark"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (!gText.trim()) return;
                  props.online.updateGroupChallenge({ text: gText.trim(), emoji: gEmoji, category: gCategory });
                  setGText("");
                }}
                disabled={!gText.trim()}
                className="big-btn flex-1 bg-leaf py-2 text-base disabled:opacity-40"
              >
                קביעת אתגר לקבוצה
              </button>
              <button onClick={props.online.leave} className="big-btn bg-gray-400 py-2 text-base">
                יציאה
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
