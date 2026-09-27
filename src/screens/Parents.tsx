import { useEffect, useState } from "react";
import { levelTitle } from "../data/levels";
import { levelForPoints } from "../lib/progress";
import type { ChildAccount } from "../lib/auth";

interface ParentsProps {
  children: ChildAccount[] | null;
  onRefreshChildren: () => void;
  onLinkChild: (
    username: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDeleteChild: (username: string) => Promise<boolean>;
  onResetChildPassword: (
    username: string,
    newPassword: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const LINK_ERR: Record<string, string> = {
  "child-not-found": "לא נמצא ילד/ה בשם הזה.",
  "wrong-password": "סיסמה שגויה.",
  offline: "אין חיבור לשרת.",
  "online-not-configured": "השרת עדיין לא הוגדר (חסר KV).",
  "server-error": "משהו השתבש, נסו שוב."
};

export function Parents(props: ParentsProps) {
  const [childUser, setChildUser] = useState("");
  const [childPass, setChildPass] = useState("");

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
    <div className="garden-page screen-rise flex flex-1 flex-col gap-6 px-5 pb-12 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">👪 אזור הורים</h2>

      {/* הילדים המקושרים */}
      <section className="rounded-blob bg-white p-5 ring-1 ring-leaf-dark/5 shadow-[0_10px_24px_-14px_rgba(20,83,45,0.4)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-leaf-dark">🧒 הילדים שלי</h3>
          <button onClick={props.onRefreshChildren} className="text-sm font-bold text-leaf underline">
            🔄 רענון
          </button>
        </div>

        <p className="mt-2 rounded-2xl bg-leaf-light/50 p-3 text-sm text-leaf-dark">
          לכל ילד/ה יש חשבון משלו/ה. כשמקשרים חשבון של ילד/ה לחשבון ההורה שלכם, אתם רואים כאן
          מכל מכשיר את ההתקדמות שלו/ה (נקודות, רמה, צמחים ותגים), ויכולים לאפס לו/ה סיסמה שנשכחה
          או למחוק את החשבון. הילד/ה ממשיך/ה לשחק רגיל מהטלפון שלו/ה.
        </p>

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
                    <div className="text-xs text-leaf-dark/80">
                      {rank.emoji} {rank.name} · רמה {level} · גיל {c.age}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-amber-600">⭐ {points}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-leaf-dark/80">
                  <span>📔 {stickers} צמחים</span>
                  <span>🏅 {badges} תגים</span>
                  <button
                    onClick={async () => {
                      const np = prompt(`סיסמה חדשה ל${c.username} (לפחות 4 תווים):`, "");
                      if (np && np.length >= 4) {
                        const res = await props.onResetChildPassword(c.username, np);
                        alert(res.ok ? "הסיסמה עודכנה! ✅" : "לא הצלחנו לעדכן סיסמה.");
                      } else if (np !== null) {
                        alert("הסיסמה קצרה מדי (לפחות 4 תווים).");
                      }
                    }}
                    className="mr-auto rounded-full bg-sky/20 px-3 py-1 font-bold text-sky-700"
                  >
                    🔑 איפוס סיסמה
                  </button>
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
                    className="rounded-full bg-red-100 px-3 py-1 font-bold text-red-600"
                  >
                    🗑️ מחיקה
                  </button>
                </div>
              </div>
            );
          })}
          {props.children && props.children.length === 0 && (
            <p className="text-center text-sm text-leaf-dark/80">
              עדיין לא קישרתם ילדים. הוסיפו למטה עם שם המשתמש והסיסמה שלהם.
            </p>
          )}
          {props.children === null && (
            <p className="text-center text-sm text-leaf-dark/80">טוען... (דורש חיבור לשרת)</p>
          )}
        </div>

        {/* קישור ילד/ה */}
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="text-sm font-bold text-leaf-dark/80">
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

    </div>
  );
}
