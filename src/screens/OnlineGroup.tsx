import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { getAllPlants } from "../lib/content";
import { playPop, playSuccess } from "../lib/sound";
import { randomCode, type OnlineMember } from "../lib/online";
import {
  FINISH_BONUS,
  generateMissions,
  isRaceOver,
  rankResults,
  type Mission,
  type Race,
  type RaceResult
} from "../lib/race";
import type { OnlineStatus } from "../hooks/useOnlineGroup";
import { RacePlay, type HuntOutcome } from "./RacePlay";
import type { Player } from "../types";

interface OnlineGroupProps {
  code: string | null;
  members: OnlineMember[] | null;
  race: Race | null;
  raceResults: RaceResult[];
  status: OnlineStatus;
  me: Player | null;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onRefresh: () => void;
  onStartRace: (missions: Mission[]) => Promise<boolean>;
  onEndRace: () => void;
  onRaceProgress: (raceId: string, done: number, score: number) => void;
  /** משימת צילום: עוברים למצלמה, ואחרי הזיהוי חוזרים לכאן עם huntOutcome */
  onHunt: (raceId: string, index: number) => void;
  huntOutcome: HuntOutcome | null;
  onHuntConsumed: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const COUNTS = [5, 10, 15];
const POLL_MS = 5000;

export function OnlineGroup(props: OnlineGroupProps) {
  const { code, members, race, raceResults, status, me } = props;
  const [input, setInput] = useState("");
  // חוזרים ישר למשחק אם חזרנו ממשימת צילום
  const [playing, setPlaying] = useState(() => !!props.huntOutcome);
  const [count, setCount] = useState(10);
  const [withHunts, setWithHunts] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showOverall, setShowOverall] = useState(false);

  useEffect(() => {
    if (code) props.onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const memberIds = useMemo(() => (members ?? []).map((m) => m.id), [members]);
  const over = !!race && isRaceOver(race, raceResults, memberIds);
  const ranked = useMemo(() => rankResults(raceResults), [raceResults]);
  const mine = raceResults.find((r) => r.id === me?.id);

  // בזמן מרוץ פעיל — רענון אוטומטי של הטבלה כדי לראות את כולם מתקדמים
  useEffect(() => {
    if (!code || !race || over) return;
    const t = setInterval(() => props.onRefresh(), POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, race?.id, over]);

  // חגיגה כשהמרוץ נגמר ואני במקום הראשון
  useEffect(() => {
    if (over && ranked[0] && ranked[0].id === me?.id) {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      playSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over, race?.id]);

  // ── מסך הצטרפות ──
  if (!code) {
    return (
      <div className="screen-rise flex flex-1 flex-col items-center px-6 pb-10 pt-4 text-center">
        <div className="text-6xl animate-float">🌍🏆</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">תחרות אונליין</h2>
        <p className="mt-2 text-leaf-dark/80">
          שחקו יחד עם חברים מכל טלפון! מצטרפים לאותה קבוצה עם קוד, ויוצאים יחד למרוץ משימות.
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
        <div className="mt-6 text-leaf-dark/80">— או —</div>
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

  // ── משחק ──
  if (playing && race && me) {
    return (
      <RacePlay
        key={race.id}
        race={race}
        playerId={me.id}
        serverResult={mine}
        huntOutcome={props.huntOutcome}
        onHuntConsumed={props.onHuntConsumed}
        onHunt={(index) => props.onHunt(race.id, index)}
        onProgress={(done, score) => props.onRaceProgress(race.id, done, score)}
        onExit={() => {
          setPlaying(false);
          props.onRefresh();
        }}
      />
    );
  }

  const start = async () => {
    playPop();
    setStarting(true);
    const ok = await props.onStartRace(generateMissions(getAllPlants(), count, withHunts));
    setStarting(false);
    if (ok) setPlaying(true);
    else alert("לא הצלחנו לפתוח מרוץ. בדקו חיבור לאינטרנט ונסו שוב.");
  };

  const myDone = mine?.finishedAt ? mine.total : (mine?.done ?? 0);

  // ── מסך קבוצה ──
  return (
    <div className="screen-rise flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">🌍 הקבוצה שלנו</h2>

      <div className="mt-3 rounded-blob bg-leaf-light/60 p-4 text-center">
        <div className="text-sm font-bold text-leaf-dark/80">קוד להצטרפות — שתפו עם חברים:</div>
        <div className="mt-1 text-4xl font-black tracking-widest text-leaf-dark">{code}</div>
        <div className="mt-1 text-xs text-leaf-dark/70">
          {members?.length ?? 0} משתתפים בקבוצה
        </div>
      </div>

      {status === "offline" && (
        <div className="mt-4 rounded-2xl bg-amber-100 p-4 text-center font-bold text-amber-800">
          כרגע אי אפשר להתחבר לשרת. בדקו אינטרנט, או שהאונליין עדיין לא הוגדר.
        </div>
      )}

      {/* ── מרוץ פעיל ── */}
      {race && !over && (
        <section className="mt-4 rounded-blob bg-white p-4 shadow">
          <div className="text-center">
            <div className="text-sm font-bold text-amber-700">🏁 מרוץ משימות פעיל</div>
            <div className="text-lg font-black text-leaf-dark">
              {race.missions.length} משימות{race.by ? ` · נפתח ע״י ${race.by}` : ""}
            </div>
          </div>
          {!mine?.finishedAt ? (
            <button
              onClick={() => {
                playPop();
                setPlaying(true);
              }}
              className="big-btn mt-3 w-full bg-leaf"
            >
              {myDone > 0 ? `▶️ המשיכו (משימה ${myDone + 1} מתוך ${race.missions.length})` : "🚀 יוצאים למרוץ!"}
            </button>
          ) : (
            <div className="mt-3 rounded-2xl bg-green-100 p-3 text-center font-bold text-green-800">
              ✓ סיימת! מחכים שכולם יסיימו…
            </div>
          )}
          <Standings ranked={ranked} members={members ?? []} meId={me?.id} total={race.missions.length} />
          <p className="mt-3 text-center text-xs text-leaf-dark/70">
            100 נקודות לכל תשובה נכונה + עד 50 בונוס מהירות · בונוס סיום: {FINISH_BONUS.join(" / ")} למסיימים
            הראשונים
          </p>
          <button
            onClick={() => {
              if (confirm("לסיים את המרוץ עכשיו לכולם? המנצח ייקבע לפי הנקודות שנצברו עד עכשיו.")) {
                props.onEndRace();
              }
            }}
            className="mt-3 w-full text-sm font-bold text-leaf-dark/70 underline"
          >
            סיום המרוץ לכולם
          </button>
        </section>
      )}

      {/* ── תוצאות מרוץ שהסתיים ── */}
      {race && over && ranked.length > 0 && <Podium ranked={ranked} meId={me?.id} />}

      {/* ── פתיחת מרוץ חדש ── */}
      {(!race || over) && (
        <section className="mt-4 rounded-blob bg-sun/20 p-4 text-center shadow">
          <div className="text-2xl">🏁</div>
          <div className="text-xl font-black text-leaf-dark">{race ? "מרוץ חדש" : "מרוץ משימות"}</div>
          <p className="mt-1 text-sm text-leaf-dark/80">
            כולם מקבלים את אותו רצף משימות: לזהות צמח בתמונה, נכון/לא נכון, למיין — ולצאת לצלם צמחים
            אמיתיים. מי שצובר הכי הרבה נקודות — מנצח!
          </p>
          <div className="mt-3 text-sm font-bold text-leaf-dark">כמה משימות?</div>
          <div className="mt-1 flex justify-center gap-2">
            {COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`rounded-full px-5 py-2 font-black ${
                  c === count ? "bg-leaf text-white" : "bg-white text-leaf-dark"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-leaf-dark">
            <input
              type="checkbox"
              checked={withHunts}
              onChange={(e) => setWithHunts(e.target.checked)}
              className="h-5 w-5 accent-green-600"
            />
            📷 כולל משימות צילום בחוץ
          </label>
          <button
            onClick={start}
            disabled={starting || status === "offline"}
            className="big-btn mt-4 w-full bg-leaf disabled:opacity-40"
          >
            {starting ? "פותחים…" : "🚀 פתחו מרוץ לכל הקבוצה"}
          </button>
        </section>
      )}

      {/* ── טבלת הנקודות הכללית ── */}
      {members && members.length > 0 && (
        <section className="mt-5">
          <button
            onClick={() => setShowOverall((s) => !s)}
            className="w-full text-center text-sm font-bold text-leaf underline"
          >
            {showOverall ? "הסתרת הטבלה הכללית" : "📊 הטבלה הכללית (כל הנקודות מהאפליקציה)"}
          </button>
          {showOverall && (
            <div className="mt-3 space-y-2">
              {members.map((m, i) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 rounded-blob p-3 shadow ${
                    m.id === me?.id ? "bg-leaf-light ring-2 ring-leaf" : "bg-white"
                  }`}
                >
                  <span className="w-7 text-center text-xl font-black">{MEDALS[i] ?? i + 1}</span>
                  <span className="text-3xl">{m.avatar}</span>
                  <span className="flex-1">
                    <span className="block font-bold text-leaf-dark">{m.name}</span>
                    <span className="block text-xs text-leaf-dark/80">
                      רמה {m.level} · 📔 {m.stickers} · 🏅 {m.badges}
                    </span>
                  </span>
                  <span className="font-black text-amber-600">⭐ {m.points}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {members && members.length === 0 && status === "ok" && (
        <p className="mt-6 text-center text-leaf-dark/80">
          עדיין אין חברים בקבוצה. שתפו את הקוד עם חברים כדי שיצטרפו!
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

/** טבלת המרוץ החיה: כל משתתף עם פס התקדמות ונקודות. */
function Standings(props: {
  ranked: ReturnType<typeof rankResults>;
  members: OnlineMember[];
  meId?: string;
  total: number;
}) {
  const started = new Set(props.ranked.map((r) => r.id));
  const waiting = props.members.filter((m) => !started.has(m.id));
  return (
    <div className="mt-4 space-y-2">
      {props.ranked.map((r, i) => (
        <div
          key={r.id}
          className={`rounded-2xl p-3 ${r.id === props.meId ? "bg-leaf-light ring-2 ring-leaf" : "bg-gray-50"}`}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 text-center font-black">{i + 1}</span>
            <span className="text-2xl">{r.avatar}</span>
            <span className="flex-1 font-bold text-leaf-dark">
              {r.name}
              {r.finishPlace && <span className="mr-1 text-sm"> 🏁 סיים/ה {r.finishPlace}</span>}
            </span>
            <span className="font-black text-amber-600">⭐ {r.totalPoints}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-leaf transition-all"
              style={{ width: `${Math.round((r.done / props.total) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      {waiting.map((m) => (
        <div key={m.id} className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3 opacity-60">
          <span className="w-6" />
          <span className="text-2xl">{m.avatar}</span>
          <span className="flex-1 font-bold text-leaf-dark">{m.name}</span>
          <span className="text-xs text-leaf-dark/70">עוד לא התחיל/ה</span>
        </div>
      ))}
    </div>
  );
}

/** פודיום המנצחים בסוף המרוץ. */
function Podium({ ranked, meId }: { ranked: ReturnType<typeof rankResults>; meId?: string }) {
  const winner = ranked[0];
  return (
    <section className="mt-4 rounded-blob bg-white p-4 text-center shadow">
      <div className="text-sm font-bold text-amber-700">🏁 המרוץ הסתיים</div>
      <div className="mt-1 text-5xl">🏆</div>
      <div className="text-2xl font-black text-leaf-dark">
        {winner.id === meId ? "ניצחת!!! 🎉" : `${winner.name} ניצח/ה!`}
      </div>
      <div className="mt-4 space-y-2 text-right">
        {ranked.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 rounded-2xl p-3 ${
              r.id === meId ? "bg-leaf-light ring-2 ring-leaf" : "bg-gray-50"
            }`}
          >
            <span className="w-8 text-center text-2xl font-black">{MEDALS[i] ?? i + 1}</span>
            <span className="text-3xl">{r.avatar}</span>
            <span className="flex-1">
              <span className="block font-bold text-leaf-dark">{r.name}</span>
              <span className="block text-xs text-leaf-dark/80">
                {r.done}/{r.total} משימות
                {r.finishBonus > 0 && ` · בונוס סיום +${r.finishBonus}`}
                {!r.finishedAt && " · לא סיים/ה"}
              </span>
            </span>
            <span className="text-xl font-black text-amber-600">⭐ {r.totalPoints}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
