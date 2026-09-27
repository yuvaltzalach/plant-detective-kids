import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { PlantImage } from "../components/PlantImage";
import { getAllPlants } from "../lib/content";
import { playPop, playSuccess } from "../lib/sound";
import {
  CATEGORIES,
  POINTS_HUNT,
  huntSucceeded,
  pointsForAnswer,
  type Mission,
  type Race,
  type RaceResult
} from "../lib/race";
import type { PlantCategory } from "../types";

/** תוצאה של משימת צילום, שחוזרת מזרימת הצילום והזיהוי. */
export interface HuntOutcome {
  raceId: string;
  index: number;
  category: PlantCategory;
  plantName: string;
}

interface RacePlayProps {
  race: Race;
  playerId: string;
  /** השורה שלי בשרת (אם כבר התחלתי ממכשיר אחר / לפני רענון) */
  serverResult?: RaceResult;
  huntOutcome: HuntOutcome | null;
  onHuntConsumed: () => void;
  onHunt: (index: number) => void;
  onProgress: (done: number, score: number) => void;
  onExit: () => void;
}

interface LocalState {
  index: number;
  score: number;
}

const storeKey = (raceId: string, playerId: string) => `pdk:race:${raceId}:${playerId}`;

function loadLocal(raceId: string, playerId: string): LocalState {
  try {
    const raw = localStorage.getItem(storeKey(raceId, playerId));
    if (raw) return JSON.parse(raw) as LocalState;
  } catch {
    /* מתעלמים */
  }
  return { index: 0, score: 0 };
}

function saveLocal(raceId: string, playerId: string, s: LocalState) {
  try {
    localStorage.setItem(storeKey(raceId, playerId), JSON.stringify(s));
  } catch {
    /* מתעלמים */
  }
}

type Feedback = { correct: boolean; points: number; note?: string } | null;

const TITLES: Record<Mission["kind"], string> = {
  pic: "איזה צמח בתמונה?",
  name: "איפה התמונה הנכונה?",
  tf: "נכון או לא נכון?",
  cat: "לאיזו קבוצה הוא שייך?",
  hunt: "משימת שטח!"
};

export function RacePlay(props: RacePlayProps) {
  const { race, playerId, serverResult } = props;
  const plantsById = useMemo(() => new Map(getAllPlants().map((p) => [p.id, p])), []);
  const total = race.missions.length;

  const [state, setState] = useState<LocalState>(() => {
    const local = loadLocal(race.id, playerId);
    // אם השרת יודע על יותר התקדמות (למשל שיחקתי ממכשיר אחר) — ממשיכים משם
    if (serverResult && serverResult.done > local.index) {
      return { index: serverResult.done, score: serverResult.score };
    }
    return local;
  });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const shownAt = useRef(Date.now());

  const mission = race.missions[state.index] as Mission | undefined;
  const finished = state.index >= total;

  useEffect(() => {
    shownAt.current = Date.now();
    setPicked(null);
  }, [state.index]);

  /** נועל את התשובה: מקדם את ההתקדמות מיד (שמירה + דיווח), ומציג משוב עד "הבא". */
  const settle = (correct: boolean, points: number, note?: string) => {
    const next = { index: state.index + 1, score: state.score + points };
    saveLocal(race.id, playerId, next);
    props.onProgress(next.index, next.score);
    setFeedback({ correct, points, note });
    if (correct) {
      playSuccess();
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
    } else {
      playPop();
    }
  };

  // חזרה ממשימת צילום
  useEffect(() => {
    const h = props.huntOutcome;
    if (!h || h.raceId !== race.id || h.index !== state.index || !mission || mission.kind !== "hunt") return;
    props.onHuntConsumed();
    const ok = huntSucceeded(mission, h.category);
    settle(
      ok,
      ok ? POINTS_HUNT : 0,
      ok ? `מצאת ${h.plantName}!` : `צילמת ${h.plantName} — זה ${h.category}, לא ${mission.category}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.huntOutcome]);

  const next = () => {
    setFeedback(null);
    setState(loadLocal(race.id, playerId));
  };

  const answerSeconds = () => (Date.now() - shownAt.current) / 1000;

  const answerPlant = (id: string) => {
    if (feedback || !mission || !("plantId" in mission)) return;
    setPicked(id);
    const correct = id === mission.plantId;
    settle(correct, pointsForAnswer(correct, answerSeconds()));
  };

  const answerBool = (guess: boolean) => {
    if (feedback || !mission || mission.kind !== "tf") return;
    setPicked(String(guess));
    const correct = guess === mission.isTrue;
    settle(correct, pointsForAnswer(correct, answerSeconds()));
  };

  const answerCat = (c: PlantCategory) => {
    if (feedback || !mission || mission.kind !== "cat") return;
    const target = plantsById.get(mission.plantId);
    setPicked(c);
    const correct = c === target?.category;
    settle(correct, pointsForAnswer(correct, answerSeconds()));
  };

  if (race.endedAt && !feedback) {
    return (
      <Shell onExit={props.onExit} index={Math.min(state.index, total)} total={total} score={state.score}>
        <div className="mt-8 text-center">
          <div className="text-6xl">🏁</div>
          <p className="mt-2 text-2xl font-black text-leaf-dark">המרוץ נגמר!</p>
          <p className="mt-1 text-leaf-dark/80">צברת {state.score} נקודות</p>
          <button onClick={props.onExit} className="big-btn mt-6 bg-leaf">לטבלת המרוץ 🏆</button>
        </div>
      </Shell>
    );
  }

  if (finished && !feedback) {
    return (
      <Shell onExit={props.onExit} index={total} total={total} score={state.score}>
        <div className="mt-8 text-center">
          <div className="text-6xl animate-float">🎉</div>
          <p className="mt-2 text-2xl font-black text-leaf-dark">סיימת את כל המשימות!</p>
          <p className="mt-1 text-lg font-bold text-amber-600">⭐ {state.score} נקודות</p>
          <p className="mt-2 text-leaf-dark/80">מי שמסיים ראשון מקבל בונוס — בואו נראה מי ניצח</p>
          <button onClick={props.onExit} className="big-btn mt-6 bg-leaf">לטבלת המרוץ 🏆</button>
        </div>
      </Shell>
    );
  }

  // ההתקדמות נשמרת כבר ברגע התשובה, אבל המסך מתקדם רק ב"הבא" — כך רואים את המשוב
  const shownIndex = state.index;
  const m = mission;
  if (!m) return null;
  const target = "plantId" in m ? plantsById.get(m.plantId) : undefined;
  if ("plantId" in m && !target) {
    // משימה על צמח שלא קיים בגרסה הזו של האפליקציה — מדלגים בלי נקודות
    return (
      <Shell onExit={props.onExit} index={shownIndex} total={total} score={state.score}>
        <p className="mt-8 text-center text-leaf-dark">המשימה הזו לא נטענה. כדאי לעדכן את האפליקציה.</p>
        <button onClick={() => settle(false, 0)} className="big-btn mt-4 self-center bg-sky">
          דילוג ➡️
        </button>
      </Shell>
    );
  }

  return (
    <Shell onExit={props.onExit} index={shownIndex} total={total} score={state.score}>
      <div className="mt-3 text-center text-xl font-black text-leaf-dark">{TITLES[m.kind]}</div>

      {m.kind === "pic" && target && (
        <>
          <PlantImage plant={target} className="mx-auto mt-3 h-52 w-full rounded-blob" />
          <div className="mt-4 grid grid-cols-1 gap-2.5">
            {m.options.map((id) => {
              const p = plantsById.get(id);
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => answerPlant(id)}
                  className={`rounded-blob p-3.5 text-lg font-bold shadow active:scale-95 ${optionClass(
                    !!feedback,
                    id === m.plantId,
                    picked === id
                  )}`}
                >
                  {p.hebrewName}
                </button>
              );
            })}
          </div>
        </>
      )}

      {m.kind === "name" && target && (
        <>
          <div className="mt-3 rounded-blob bg-white p-4 text-center text-2xl font-black text-leaf-dark shadow">
            {target.hebrewName}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {m.options.map((id) => {
              const p = plantsById.get(id);
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => answerPlant(id)}
                  className={`overflow-hidden rounded-2xl p-1 shadow active:scale-95 ${optionClass(
                    !!feedback,
                    id === m.plantId,
                    picked === id
                  )}`}
                >
                  <PlantImage plant={p} className="aspect-square w-full rounded-xl" />
                  {feedback && <div className="py-1 text-xs font-bold">{p.hebrewName}</div>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {m.kind === "tf" && target && (
        <>
          <PlantImage plant={target} className="mx-auto mt-3 h-40 w-full rounded-blob" />
          <div className="mt-3 rounded-blob bg-white p-4 text-center shadow">
            <div className="text-lg font-black text-leaf-dark">{target.hebrewName}</div>
            <div className="mt-1 text-lg text-leaf-dark">💡 {m.statement}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[true, false].map((b) => (
              <button
                key={String(b)}
                onClick={() => answerBool(b)}
                className={`rounded-blob p-4 text-xl font-black shadow active:scale-95 ${optionClass(
                  !!feedback,
                  b === m.isTrue,
                  picked === String(b)
                )}`}
              >
                {b ? "✅ נכון" : "❌ לא נכון"}
              </button>
            ))}
          </div>
        </>
      )}

      {m.kind === "cat" && target && (
        <>
          <PlantImage plant={target} className="mx-auto mt-3 h-48 w-full rounded-blob" />
          <div className="mt-2 text-center text-xl font-black text-leaf-dark">{target.hebrewName}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => answerCat(c)}
                className={`rounded-blob p-4 text-xl font-black shadow active:scale-95 ${optionClass(
                  !!feedback,
                  c === target.category,
                  picked === c
                )}`}
              >
                {CAT_EMOJI[c]} {c}
              </button>
            ))}
          </div>
        </>
      )}

      {m.kind === "hunt" && !feedback && (
        <div className="mt-4 rounded-blob bg-sun/20 p-6 text-center shadow">
          <div className="text-6xl">{m.emoji}</div>
          <div className="mt-2 text-2xl font-black text-leaf-dark">{m.text}</div>
          <p className="mt-2 text-leaf-dark/80">
            האפליקציה תזהה את הצמח שצילמתם. הצלחה = ⭐ {POINTS_HUNT} נקודות!
          </p>
          <button
            onClick={() => {
              playPop();
              props.onHunt(state.index);
            }}
            className="big-btn mt-5 w-full bg-leaf"
          >
            📷 צלמו עכשיו
          </button>
          <button
            onClick={() => settle(false, 0, "דילגתם על משימת הצילום")}
            className="mt-3 text-sm font-bold text-leaf-dark/70 underline"
          >
            אין צמח כזה בסביבה — דילוג (0 נקודות)
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`mt-5 rounded-blob p-4 text-center text-lg font-black text-white shadow ${
            feedback.correct ? "bg-green-500" : "bg-red-400"
          }`}
        >
          {feedback.correct ? `כל הכבוד! +${feedback.points} ⭐` : "לא הפעם…"}
          {feedback.note && <div className="mt-1 text-base font-bold">{feedback.note}</div>}
        </div>
      )}

      {feedback && (
        <button onClick={next} className="big-btn mt-4 self-center bg-leaf">
          {state.index + 1 >= total ? "לסיום 🏁" : "למשימה הבאה ➡️"}
        </button>
      )}
    </Shell>
  );
}

const CAT_EMOJI: Record<PlantCategory, string> = { עץ: "🌳", פרח: "🌸", עשב: "🌿", צמח: "🪴" };

function optionClass(revealed: boolean, isTarget: boolean, chosen: boolean): string {
  if (!revealed) return "bg-white text-leaf-dark";
  if (isTarget) return "bg-green-500 text-white";
  if (chosen) return "bg-red-400 text-white";
  return "bg-white text-leaf-dark opacity-70";
}

function Shell(props: {
  children: React.ReactNode;
  onExit: () => void;
  index: number;
  total: number;
  score: number;
}) {
  const pct = Math.round((Math.min(props.index, props.total) / props.total) * 100);
  return (
    <div className="screen-rise flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={props.onExit} className="text-sm font-bold text-leaf-dark underline">
          לטבלה
        </button>
        <h2 className="text-2xl font-black text-leaf-dark">🏁 מרוץ משימות</h2>
        <span className="font-black text-amber-600">⭐ {props.score}</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm font-bold text-leaf-dark">
        <span>
          משימה {Math.min(props.index + 1, props.total)} מתוך {props.total}
        </span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/80">
          <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {props.children}
    </div>
  );
}
