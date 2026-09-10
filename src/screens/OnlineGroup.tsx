import { useEffect, useState } from "react";
import { playPop } from "../lib/sound";
import { randomCode, type OnlineMember } from "../lib/online";
import type { OnlineStatus } from "../hooks/useOnlineGroup";
import type { Player } from "../types";

interface OnlineGroupProps {
  code: string | null;
  members: OnlineMember[] | null;
  status: OnlineStatus;
  me: Player | null;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onRefresh: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function OnlineGroup({
  code,
  members,
  status,
  me,
  onJoin,
  onLeave,
  onRefresh
}: OnlineGroupProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (code) onRefresh();
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
            onJoin(input);
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
            onJoin(randomCode());
          }}
          className="big-btn mt-4 w-full max-w-xs bg-sky"
        >
          ✨ פתחו קבוצה חדשה
        </button>
      </div>
    );
  }

  // ── מסך קבוצה + טבלה ──
  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">🌍 הקבוצה שלנו</h2>

      <div className="mt-3 rounded-blob bg-leaf-light/60 p-4 text-center">
        <div className="text-sm font-bold text-leaf-dark/70">קוד להצטרפות — שתפו עם חברים:</div>
        <div className="mt-1 text-4xl font-black tracking-widest text-leaf-dark">{code}</div>
      </div>

      {status === "offline" && (
        <div className="mt-4 rounded-2xl bg-amber-100 p-4 text-center font-bold text-amber-800">
          כרגע אי אפשר להתחבר לשרת. בדקו חיבור לאינטרנט, או שהאונליין עדיין לא הוגדר.
        </div>
      )}

      {members && members.length > 0 && (
        <div className="mt-4 space-y-3">
          {members.map((m, i) => {
            const isMe = me && m.id === me.id;
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
            onRefresh();
          }}
          className="big-btn flex-1 bg-sky py-3 text-lg"
        >
          🔄 רענון
        </button>
        <button onClick={onLeave} className="big-btn bg-gray-400 py-3 text-lg">
          יציאה
        </button>
      </div>
    </div>
  );
}
