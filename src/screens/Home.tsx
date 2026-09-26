import { useEffect, useRef, useState } from "react";
import { playPop } from "../lib/sound";
import { levelTitle } from "../data/levels";
import type { Challenge } from "../data/challenges";
import type { PlantContent } from "../types";
import type { PublicAccount } from "../lib/auth";
import {
  AlbumArt,
  BookArt,
  CameraArt,
  ChevronForward,
  CornerLeaves,
  DoorArt,
  GamesArt,
  GlobeArt,
  HeroPlant,
  HillArt,
  ParentsArt,
  SprigArt
} from "../components/HomeArt";

interface HomeProps {
  account: PublicAccount | null;
  level: number;
  stickerCount: number;
  totalPlants: number;
  challenge: Challenge;
  challengeDoneToday: boolean;
  plantOfDay: PlantContent;
  onCapture: () => void;
  onAlbum: () => void;
  onChallenges: () => void;
  onOnline: () => void;
  onEncyclopedia: () => void;
  onPlantOfDay: () => void;
  onGames: () => void;
  onParents: () => void;
  onLogout: () => void;
  onProfile: () => void;
}

type PuppyFrame = "base" | "blink" | "wave";
const PUPPY_FRAMES: Record<PuppyFrame, string> = {
  base: "/mascots/puppy.png",
  blink: "/mascots/puppy-blink.png",
  wave: "/mascots/puppy-wave.png"
};

/**
 * הכלבלב של מסך הבית: מנפנף "שלום" פעם אחת בכניסה, ממצמץ מדי פעם,
 * ומנפנף שוב כשנוגעים בו. בלי תנועה מתמדת.
 */
function HeroPuppy({ size }: { size: number }) {
  const [frame, setFrame] = useState<PuppyFrame>("base");
  const tapTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => alive && fn(), ms));
    };
    // נפנוף פתיחה
    at(700, () => setFrame("wave"));
    at(1450, () => setFrame("base"));
    at(1750, () => setFrame("wave"));
    at(2500, () => setFrame("base"));
    // מצמוץ נדיר — רק כשהכלבלב במנוחה
    const blinkLoop = (delay: number) =>
      at(delay, () => {
        setFrame((f) => (f === "base" ? "blink" : f));
        at(160, () => setFrame((f) => (f === "blink" ? "base" : f)));
        blinkLoop(4500 + Math.random() * 4000);
      });
    blinkLoop(4200);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      tapTimers.current.forEach(clearTimeout);
    };
  }, []);

  const waveHello = () => {
    tapTimers.current.forEach(clearTimeout);
    setFrame("wave");
    tapTimers.current = [setTimeout(() => setFrame("base"), 900)];
  };

  return (
    <div className="relative" style={{ width: size, height: size }} onClick={waveHello}>
      {(Object.keys(PUPPY_FRAMES) as PuppyFrame[]).map((f) => (
        <img
          key={f}
          src={PUPPY_FRAMES[f]}
          alt=""
          width={size}
          height={size}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
          style={{ opacity: frame === f ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

export function Home(props: HomeProps) {
  const {
    account,
    level,
    stickerCount,
    totalPlants,
    challenge,
    challengeDoneToday,
    plantOfDay
  } = props;
  const rank = levelTitle(level);
  const go = (fn: () => void) => () => {
    playPop();
    fn();
  };

  const albumPct = totalPlants > 0 ? Math.round((stickerCount / totalPlants) * 100) : 0;

  const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <div className="relative flex flex-1 flex-col">
      {/* עולם מאויר: בסיס קרם־מנטה, שמש רכה, עננים ועלים בפינות */}
      <div className="home-scene" aria-hidden="true">
        <div className="home-wash" />
        <svg className="sun" viewBox="0 0 120 120">
          <defs>
            <radialGradient id="sunG" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fffbeb" />
              <stop offset="0.65" stopColor="#fde68a" />
              <stop offset="1" stopColor="#facc15" />
            </radialGradient>
          </defs>
          <g className="sun-rays">
            {RAYS.map((deg) => (
              <rect
                key={deg}
                x="57"
                y="6"
                width="6"
                height="16"
                rx="3"
                fill="#fde68a"
                transform={`rotate(${deg} 60 60)`}
              />
            ))}
          </g>
          <circle cx="60" cy="60" r="28" fill="url(#sunG)" />
        </svg>
        <div className="drift-cloud c1" />
        <div className="drift-cloud c2" />
        <div className="drift-cloud c3" />
        <CornerLeaves className="corner-leaves cl-a" />
        <CornerLeaves className="corner-leaves cl-b" />
      </div>

      <div className="home-rise relative z-10 flex flex-1 flex-col items-center px-4 pb-10 pt-3">
        {/* 1. המשתמש — קליל, לא דומיננטי */}
        {account && (
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <button
              onClick={go(props.onProfile)}
              className="flex min-h-[52px] items-center gap-2.5 rounded-full bg-white/70 py-1 pe-4 ps-1 ring-1 ring-leaf-dark/5 backdrop-blur-sm transition-transform active:scale-95"
              aria-label="הפרופיל שלי"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-2xl">
                {account.avatar}
              </span>
              <span className="text-right leading-tight">
                <span className="block text-[15px] font-bold text-forest">{account.username}</span>
                <span className="mt-0.5 block text-xs font-bold text-leaf-dark/75">
                  {rank.emoji} {rank.name}
                </span>
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm("להתנתק מהחשבון?")) props.onLogout();
              }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-leaf-dark/70 transition-transform active:scale-95"
            >
              <DoorArt className="h-5 w-5" />
              יציאה
            </button>
          </div>
        )}

        {/* 2. כותרת */}
        <header className="mt-4 text-center">
          <h1 className="font-display text-[2.4rem] font-black leading-none tracking-tight text-forest">
            בלש הצמחים
          </h1>
          <p className="mx-auto mt-2 max-w-[13rem] text-[15px] leading-snug text-forest/75 [text-wrap:balance]">
            מצלמים צמח — ומגלים מה הוא!
          </p>
        </header>

        {/* הבמה: הכלבלב יושב על גבעה ליד צמח, ומציץ מעל כפתור הצילום */}
        <div className="relative mt-2 w-full max-w-sm">
          <div className="relative h-[176px]" aria-hidden="true">
            <div className="stage-glow" />
            <HillArt className="absolute -inset-x-4 bottom-0 h-[64px] w-[calc(100%+2rem)]" />
            <HeroPlant className="absolute bottom-5 right-[7%] h-[128px] w-[76px]" />
            <div className="puppy-hop absolute bottom-0 left-1/2 -translate-x-1/2">
              <HeroPuppy size={168} />
            </div>
            <div className="hello-bubble absolute left-[3%] top-5">היי! 👋</div>
          </div>

          {/* 3. הפעולה הראשית */}
          <button onClick={go(props.onCapture)} className="capture-cta relative z-10 -mt-5 w-full">
            <span className="flex items-center justify-center gap-4">
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[1.35rem] bg-white/15">
                <CameraArt className="h-[52px] w-[52px]" />
              </span>
              <span className="font-display text-[1.85rem] font-black">צַלְמוּ צמח!</span>
            </span>
          </button>
        </div>

        {/* 4. היום בגינה — אתגר + צמח היום */}
        <section className="mt-8 w-full max-w-sm" aria-labelledby="home-today">
          <h2 id="home-today" className="home-section-title">
            <SprigArt className="h-5 w-7" />
            היום בגינה
          </h2>
          <div className="today-panel">
            <button onClick={go(props.onChallenges)} className="today-row active:bg-amber-50">
              <span className="today-badge bg-amber-100">{challenge.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  {challenge.id === "custom" ? "אתגר מההורים" : "אתגר היום"}
                  {challengeDoneToday && (
                    <span className="rounded-full bg-leaf-light px-2 py-0.5 text-[11px] text-leaf-dark">
                      ✓ הושלם
                    </span>
                  )}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[15px] font-bold leading-snug text-forest">
                  {challenge.text}
                </span>
              </span>
              <ChevronForward className="h-5 w-5 shrink-0 text-amber-700/45" />
            </button>

            <div className="mx-4 border-t-2 border-dashed border-leaf/15" aria-hidden="true" />

            <button onClick={go(props.onPlantOfDay)} className="today-row active:bg-sky-50">
              <span className="today-badge today-badge--alt bg-sky-100">{plantOfDay.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-sky-800">צמח היום</span>
                <span className="mt-0.5 block truncate text-[15px] font-bold text-forest">
                  {plantOfDay.hebrewName}
                </span>
              </span>
              <ChevronForward className="h-5 w-5 shrink-0 text-sky-700/45" />
            </button>
          </div>
        </section>

        {/* 5. פעילויות */}
        <section className="mt-7 w-full max-w-sm" aria-labelledby="home-explore">
          <h2 id="home-explore" className="home-section-title">
            <SprigArt className="h-5 w-7" />
            לגלות ולשחק
          </h2>

          <button onClick={go(props.onAlbum)} className="activity-tile album-tile w-full">
            <AlbumArt className="h-16 w-16 shrink-0" />
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-base font-black text-forest">האלבום שלי</span>
              <span className="mt-0.5 block text-xs font-bold text-amber-900/70">
                {stickerCount} מתוך {totalPlants} צמחים
              </span>
              <span className="mt-2 block h-2.5 w-full rounded-full bg-white/80">
                <span
                  className="relative block h-full rounded-full bg-leaf transition-all"
                  style={{ width: `${albumPct}%` }}
                >
                  {albumPct > 0 && (
                    <span className="absolute -left-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-leaf ring-2 ring-white" />
                  )}
                </span>
              </span>
            </span>
            <ChevronForward className="h-5 w-5 shrink-0 text-amber-800/40" />
          </button>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <button onClick={go(props.onEncyclopedia)} className="activity-tile mini-tile tile-mint">
              <BookArt className="h-14 w-14" />
              <span className="text-[13px] font-bold leading-tight text-forest">אנציקלופדיה</span>
            </button>
            <button onClick={go(props.onGames)} className="activity-tile mini-tile tile-lilac">
              <GamesArt className="h-14 w-14" />
              <span className="text-[13px] font-bold leading-tight text-forest">משחקים</span>
            </button>
            <button onClick={go(props.onOnline)} className="activity-tile mini-tile tile-sky">
              <GlobeArt className="h-14 w-14" />
              <span className="text-[13px] font-bold leading-tight text-forest">תחרות אונליין</span>
            </button>
          </div>
        </section>

        {/* 6. אזור הורים — שקט יותר */}
        {account?.isParent && (
          <button
            onClick={go(props.onParents)}
            className="mt-6 flex w-full max-w-sm items-center gap-3 rounded-[1.4rem] border-2 border-dashed border-leaf-dark/15 bg-white/45 px-4 py-2.5 text-right transition-transform active:scale-[0.98]"
          >
            <ParentsArt className="h-10 w-10 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-forest/85">אזור הורים</span>
              <span className="block text-xs text-forest/60">הילדים שלי, אתגר אישי ועוד</span>
            </span>
            <ChevronForward className="h-5 w-5 shrink-0 text-forest/35" />
          </button>
        )}
      </div>
    </div>
  );
}
