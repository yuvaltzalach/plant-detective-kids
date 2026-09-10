import { useEffect, useState } from "react";
import { playPop, playSuccess } from "../lib/sound";
import { randomCode, type GroupChallenge, type OnlineMember } from "../lib/online";
import type { OnlineStatus } from "../hooks/useOnlineGroup";
import confetti from "canvas-confetti";
import type { Player } from "../types";

interface OnlineGroupProps {
  code: string | null;
  members: OnlineMember[] | null;
  challenge: GroupChallenge | null;
  status: OnlineStatus;
  me: Player | null;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onRefresh: () => void;
  onSetChallenge: (c: { text: string; emoji: string; category?: string } | null) => void;
  onCompleteChallenge: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const EMOJIS = ["🎯", "🌻", "🌳", "🌸", "🟡", "🔴", "🟣", "🍃", "🐝"];
const CATS = [
  { label: "כל צמח", value: undefined as string | undefined },
  { label: "עץ", value: "עץ" },
  { label: "פרח", value: "פרח" },
  { label: "עשב", value: "עשב" },
  { label: "צמח", value: "צמח" }
];

export function OnlineGroup(props: OnlineGroupProps) {
  const { code, members, challenge, status, me } = props;
  const [input, setInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [category, setCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (code) props.onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ── מסך הצטרפות ──
  if (!code) {
    return (
      <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4 text-center">
        <div className="text-6xl animate-float">🌍🏆</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">תחרות אונליין</h2>
        <p className="mt-2 text-leaf-dark/70">
          שחקו יחד עם חברים מכל טלפון! מצטרפים לאותה קבוצה עם קוד, ורואים מי אסף הכי הרבה.
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="קוד קבוצה"
          maxLength={8}
          className="mt-6 w-full max-w-xs rounded-blob border-2 border-leaf-light bg-white px-5 py-4 text-center text-2xl font-black tracking-widest text-leaf-dark outline-none focus:border-leaf"
        />
        <button
          onClick={() => {
            playPop();
            props.onJoin(input);
          }}
          disabled={input.trim().length < 3}
          className="big-btn mt-4 w-full max-w-xs bg-leaf disabled:opacity-40"
        >
          הצטרפות לקבוצה
        </button>
        <div className="mt-6 text-leaf-dark/50">— או —</div>
        <button
          onClick={() => {
            playPop();
            props.onJoin(randomCode());
          }}
          className="big-btn mt-4 w-full max-w-xs bg-sky"
        >
          ✨ פתחו קבוצה חדשה
        </button>
      </div>
    );
  }

  const myDone =
    !!challenge && !!me && (members?.find((m) => m.id === me.id)?.groupDoneAt ?? 0) >= challenge.updatedAt;

  const handleComplete = () => {
    props.onCompleteChallenge();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    playSuccess();
  };

  // ── מסך קבוצה ──
  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">🌍 הקבוצה שלנו</h2>

      <div className="mt-3 rounded-blob bg-leaf-light/60 p-4 text-center">
        <div className="text-sm font-bold text-leaf-dark/70">קוד להצטרפות — שתפו עם חברים:</div>
        <div className="mt-1 text-4xl font-black tracking-widest text-leaf-dark">{code}</div>
      </div>

      {status === "offline" && (
        <div className="mt-4 rounded-2xl bg-amber-100 p-4 text-center font-bold text-amber-800">
          כרגע אי אפשר להתחבר לשרת. בדקו אינטרנט, או שהאונליין עדיין לא הוגדר.
        </div>
      )}

      {/* אתגר קבוצתי */}
      <div className="mt-4 rounded-blob bg-sun/20 p-4 text-center shadow">
        <div className="text-sm font-bold text-amber-700">🎯 אתגר קבוצתי</div>
        {challenge ? (
          <>
            <div className="mt-1 text-2xl">{challenge.emoji}</div>
            <div className="text-lg font-bold text-leaf-dark">{challenge.text}</div>
            {challenge.by && (
              <div className="text-xs text-leaf-dark/50">נקבע ע״י {challenge.by}</div>
            )}
            <div className="mt-2">
              {myDone ? (
                <span className="rounded-full bg-green-500 px-4 py-1 font-bold text-white">
                  ✓ השלמת! כל הכבוד
                </span>
              ) : (
                <button
                  onClick={handleComplete}
                  className="rounded-full bg-amber-400 px-6 py-2 text-lg font-bold text-white active:scale-95"
                >
                  ✋ השלמתי את האתגר!
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-1 text-leaf-dark/60">עדיין אין אתגר קבוצתי</div>
        )}

        <button
          onClick={() => setShowForm((s) => !s)}
          className="mt-3 text-sm font-bold text-leaf underline"
        >
          {showForm ? "סגירה" : challenge ? "שינוי / ביטול אתגר" : "➕ קביעת אתגר לקבוצה"}
        </button>

        {showForm && (
          <div className="mt-3 rounded-2xl bg-white p-3 text-right">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="מצאו פרח סגול"
              rows={2}
              className="w-full rounded-xl border-2 border-leaf-light p-2 outline-none focus:border-leaf"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-9 w-9 rounded-lg text-xl ${
                    e === emoji ? "bg-leaf-light ring-2 ring-leaf" : "bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    category === c.value ? "bg-leaf text-white" : "bg-gray-100 text-leaf-dark"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (!text.trim()) return;
                  props.onSetChallenge({ text: text.trim(), emoji, category });
                  setShowForm(false);
                  setText("");
                }}
                className="big-btn flex-1 bg-leaf py-2 text-base disabled:opacity-40"
                disabled={!text.trim()}
              >
                קביעה לקבוצה
              </button>
              {challenge && (
                <button
                  onClick={() => {
                    props.onSetChallenge(null);
                    setShowForm(false);
                  }}
                  className="big-btn bg-gray-400 py-2 text-base"
                >
                  ביטול אתגר
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* טבלה */}
      {members && members.length > 0 && (
        <div className="mt-4 space-y-3">
          {members.map((m, i) => {
            const isMe = me && m.id === me.id;
            const done = challenge && (m.groupDoneAt ?? 0) >= challenge.updatedAt;
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-blob p-4 shadow ${
                  isMe ? "bg-leaf-light ring-4 ring-leaf" : "bg-white"
                }`}
              >
                <span className="w-8 text-center text-2xl font-black">{MEDALS[i] ?? i + 1}</span>
                <span className="text-4xl">{m.avatar}</span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-leaf-dark">
                    {m.name}
                    {done && <span title="השלים את האתגר"> ✅</span>}
                    {isMe && <span className="mr-2 text-sm text-leaf">‹ אני</span>}
                  </span>
                  <span className="block text-sm text-leaf-dark/60">
                    רמה {m.level} · 📔 {m.stickers} · 🏅 {m.badges}
                  </span>
                </span>
                <span className="text-xl font-black text-amber-600">⭐ {m.points}</span>
              </div>
            );
          })}
        </div>
      )}

      {members && members.length === 0 && status === "ok" && (
        <p className="mt-6 text-center text-leaf-dark/60">
          עדיין אין חברים בקבוצה. שתפו את הקוד וזהו צמח כדי להופיע בטבלה!
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            playPop();
            props.onRefresh();
          }}
          className="big-btn flex-1 bg-sky py-3 text-lg"
        >
          🔄 רענון
        </button>
        <button onClick={props.onLeave} className="big-btn bg-gray-400 py-3 text-lg">
          יציאה
        </button>
      </div>
    </div>
  );
}
