import { useMemo, useState } from "react";
import { PlayerSetup } from "../components/PlayerSetup";
import { levelTitle } from "../data/levels";
import { randomCode, type GroupChallenge } from "../lib/online";
import type { LeaderRow } from "../hooks/useProgress";
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
  children: LeaderRow[];
  onSetChallenge: (c: CustomChallenge) => void;
  onClearChallenge: () => void;
  onCreatePlayer: (name: string, avatar: string) => void;
  onEditPlayer: (id: string, name: string, avatar: string) => void;
  onDeletePlayer: (id: string) => void;
  onResetChild: (id: string) => void;
  onLinkCloud: (id: string) => Promise<string | null>;
  onRefreshChild: (id: string) => void;
  onAddChildByCode: (code: string) => Promise<"ok" | "not-found" | "offline">;
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

function Gate({ onPass }: { onPass: () => void }) {
  const [a] = useState(() => 3 + Math.floor(Math.random() * 7));
  const [b] = useState(() => 3 + Math.floor(Math.random() * 7));
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="text-6xl">🔒</div>
      <h2 className="text-2xl font-black text-leaf-dark">אזור הורים</h2>
      <p className="text-leaf-dark/70">כדי להיכנס, פתרו את התרגיל:</p>
      <div className="text-3xl font-black text-leaf-dark">
        {a} × {b} = ?
      </div>
      <input
        inputMode="numeric"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setErr(false);
        }}
        className={`w-40 rounded-blob border-2 bg-white px-4 py-3 text-center text-2xl font-bold outline-none ${
          err ? "border-red-400" : "border-leaf-light focus:border-leaf"
        }`}
      />
      {err && <div className="font-bold text-red-500">לא נכון, נסו שוב 🙂</div>}
      <button onClick={() => (Number(val) === a * b ? onPass() : setErr(true))} className="big-btn bg-leaf">
        כניסה
      </button>
    </div>
  );
}

export function Parents(props: ParentsProps) {
  const [passed, setPassed] = useState(false);
  const [mode, setMode] = useState<
    { kind: "menu" } | { kind: "add" } | { kind: "edit"; id: string }
  >({ kind: "menu" });

  const current = props.settings.customChallenge;
  const [text, setText] = useState(current?.text ?? "");
  const [emoji, setEmoji] = useState(current?.emoji ?? "🎯");
  const [category, setCategory] = useState<PlantCategory | undefined>(current?.category);

  // תחרות אונליין
  const [codeInput, setCodeInput] = useState("");
  const [gText, setGText] = useState("");
  const [gEmoji, setGEmoji] = useState("🎯");
  const [gCategory, setGCategory] = useState<PlantCategory | undefined>(undefined);
  const [watchCode, setWatchCode] = useState("");

  const editing = useMemo(
    () => (mode.kind === "edit" ? props.children.find((c) => c.player.id === mode.id)?.player : undefined),
    [mode, props.children]
  );

  if (!passed) return <Gate onPass={() => setPassed(true)} />;

  if (mode.kind === "add") {
    return (
      <PlayerSetup
        title="ילד/ה חדש/ה"
        submitLabel="הוספה"
        onSubmit={(name, avatar) => {
          props.onCreatePlayer(name, avatar);
          setMode({ kind: "menu" });
        }}
        onCancel={() => setMode({ kind: "menu" })}
      />
    );
  }

  if (mode.kind === "edit" && editing) {
    return (
      <PlayerSetup
        title="עריכת ילד/ה"
        submitLabel="שמירה"
        initialName={editing.name}
        initialAvatar={editing.avatar}
        onSubmit={(name, avatar) => {
          props.onEditPlayer(editing.id, name, avatar);
          setMode({ kind: "menu" });
        }}
        onCancel={() => setMode({ kind: "menu" })}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pb-12 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">👪 אזור הורים</h2>

      {/* לוח הילדים */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-xl font-black text-leaf-dark">🧒 הילדים שלי</h3>
        <p className="mt-1 text-sm text-leaf-dark/70">צפייה בהתקדמות וניהול החשבונות.</p>

        <div className="mt-3 space-y-3">
          {props.children.map((c) => {
            const rank = levelTitle(c.level);
            return (
              <div key={c.player.id} className="rounded-2xl bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{c.player.avatar}</span>
                  <div className="flex-1">
                    <div className="font-black text-leaf-dark">{c.player.name}</div>
                    <div className="text-xs text-leaf-dark/60">
                      {rank.emoji} {rank.name} · רמה {c.level}
                    </div>
                  </div>
                  <div className="text-left text-sm font-bold text-amber-600">⭐ {c.points}</div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-leaf-dark/70">
                  <span>📔 {c.stickers} צמחים</span>
                  <span>🏅 {c.badges} תגים</span>
                  {c.player.cloudCode && (
                    <span>🔑 <b className="tracking-widest">{c.player.cloudCode}</b></span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {c.player.cloudCode && (
                    <button
                      onClick={() => props.onRefreshChild(c.player.id)}
                      className="rounded-full bg-sky/20 px-3 py-1.5 text-sm font-bold text-sky-700"
                    >
                      🔄 רענון
                    </button>
                  )}
                  <button
                    onClick={() => setMode({ kind: "edit", id: c.player.id })}
                    className="rounded-full bg-gray-200 px-3 py-1.5 text-sm font-bold text-leaf-dark"
                  >
                    ✏️ עריכה
                  </button>
                  {!c.player.cloudCode && (
                    <button
                      onClick={async () => {
                        const code = await props.onLinkCloud(c.player.id);
                        if (code)
                          alert(
                            `נוצר חשבון אונליין ל${c.player.name}!\nקוד אישי: ${code}\nמתחברים איתו מכל טלפון.`
                          );
                        else alert("לא הצלחנו ליצור חשבון (אולי האונליין לא הוגדר).");
                      }}
                      className="rounded-full bg-leaf/15 px-3 py-1.5 text-sm font-bold text-leaf-dark"
                    >
                      ☁️ חשבון אונליין
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`לאפס את ההתקדמות של ${c.player.name}?`))
                        props.onResetChild(c.player.id);
                    }}
                    className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700"
                  >
                    ♻️ איפוס
                  </button>
                  <button
                    onClick={() => {
                      if (props.children.length <= 1) {
                        alert("צריך להשאיר לפחות ילד/ה אחד/ת.");
                        return;
                      }
                      if (confirm(`למחוק את ${c.player.name} ואת כל ההתקדמות?`))
                        props.onDeletePlayer(c.player.id);
                    }}
                    className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setMode({ kind: "add" })}
          className="big-btn mt-4 w-full bg-sky py-3 text-lg"
        >
          ➕ הוספת ילד/ה חדש/ה
        </button>

        {/* הוספת ילד/ה לצפייה לפי קוד (משחק בטלפון אחר) */}
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="text-sm font-bold text-leaf-dark/70">
            צפייה בילד/ה שמשחק/ת בטלפון אחר — הכניסו את הקוד האישי שלו/ה:
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={watchCode}
              onChange={(e) => setWatchCode(e.target.value.toUpperCase())}
              placeholder="קוד ילד/ה"
              maxLength={8}
              className="flex-1 rounded-2xl border-2 border-leaf-light bg-white p-2 text-center font-black tracking-widest outline-none focus:border-leaf"
            />
            <button
              onClick={async () => {
                const res = await props.onAddChildByCode(watchCode);
                if (res === "ok") setWatchCode("");
                else if (res === "not-found") alert("קוד לא נמצא.");
                else alert("אין חיבור לשרת (או שהאונליין לא הוגדר).");
              }}
              disabled={watchCode.trim().length < 4}
              className="big-btn bg-leaf py-2 text-base disabled:opacity-40"
            >
              הוספה
            </button>
          </div>
        </div>
      </section>

      {/* אתגר אישי (במכשיר הזה) */}
      <section className="rounded-blob bg-white p-5 shadow">
        <h3 className="text-xl font-black text-leaf-dark">🎯 אתגר אישי לילדים</h3>
        <p className="mt-1 text-sm text-leaf-dark/70">
          למשל: "מצאו פרח עם עלים צהובים". יופיע לילדים במקום האתגר היומי (במכשיר הזה).
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
              פתחו קבוצה (קוד לשיתוף) או הצטרפו לקוד קיים. כל ילד/ה בטלפון שלו/ה יופיע/תופיע בטבלה.
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
                  props.online.updateGroupChallenge({
                    text: gText.trim(),
                    emoji: gEmoji,
                    category: gCategory
                  });
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
            {props.online.challenge && (
              <div className="mt-3 rounded-2xl bg-leaf-light/60 p-3 text-center font-bold text-leaf-dark">
                אתגר פעיל: {props.online.challenge.emoji} {props.online.challenge.text}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
