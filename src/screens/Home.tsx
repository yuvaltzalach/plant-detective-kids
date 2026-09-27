import { useEffect, useRef, useState } from "react";
import { playPop } from "../lib/sound";
import { levelTitle } from "../data/levels";
import type { Challenge } from "../data/challenges";
import type { PlantContent } from "../types";
import type { PublicAccount } from "../lib/auth";
import {
  ChevronForward,
  DoorArt,
  ParentsArt,
  PlantSpecimenArt
} from "../components/HomeArt";
import {
  BeeTrail,
  Butterfly,
  GardenEdgeVine,
  EdgeLeafLarge,
  GardenFloor,
  PawTrail,
  StoneBloom
} from "../components/Garden";
import { SectionHeading } from "../components/Explorer";
import { RiddleCloud, RiddlePopup, useBotiRiddle } from "../components/BotiRiddle";

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
 * ומנפנף שוב כשנוגעים בו. בלי תנועה מתמדת. במסך הבית הוא בּוֹטִי — נגיעה פותחת את החידה.
 */
function HeroPuppy({
  size,
  onTap,
  expanded
}: {
  size: number;
  onTap: () => void;
  expanded: boolean;
}) {
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
    <button
      onClick={() => {
        waveHello();
        onTap();
      }}
      className="relative block transition-transform active:scale-95"
      style={{ width: size, height: size }}
      aria-label="הדמות שלי"
      aria-expanded={expanded}
    >
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
    </button>
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
  const boti = useBotiRiddle();
  const go = (fn: () => void) => () => {
    playPop();
    fn();
  };

  const albumPct = totalPlants > 0 ? Math.round((stickerCount / totalPlants) * 100) : 0;

  const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      {/* עולם מאויר (שכבת רקע): בסיס קרם־מנטה, שמש רכה ועננים */}
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
      </div>

      <div className="home-rise relative z-10 flex flex-1 flex-col items-center px-4 pt-3">
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
              className="home-exit flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-transform active:scale-95"
            >
              <DoorArt className="h-5 w-5" />
              יציאה
            </button>
          </div>
        )}

        {/* 2. כותרת */}
        <header className="mt-4 text-center">
          <h1 className="font-display text-[2rem] font-black min-[390px]:text-[2.2rem] leading-none tracking-tight text-forest">
            בלש הצמחים
          </h1>
          <p className="mx-auto mt-2 max-w-[13rem] text-[15px] leading-snug text-forest/75 [text-wrap:balance]">
            מצלמים צמח — ומגלים מה הוא!
          </p>
        </header>

        {/* הבמה: הכלבלב יושב על גבעה ליד צמח, ומציץ מעל כפתור הצילום */}
        <div className="relative mt-2 w-full max-w-sm">
          <div className="hero-stage relative h-[226px]">
            {/* רקע רחוק → גבעה → צמחייה (אמצע) → הכלבלב → פרפר */}
            <div className="stage-glow" aria-hidden="true" />
            <Butterfly className="garden-deco hero-butterfly" />
            <div className="puppy-hop absolute bottom-0 left-1/2 z-[1] -translate-x-1/2">
              <HeroPuppy size={208} onTap={boti.toggleBubble} expanded={boti.bubbleOpen} />
              {boti.bubbleOpen ? (
                <RiddleCloud
                  plant={boti.plant}
                  onOpen={boti.openPopup}
                  dotsSide="right"
                  className="hero-riddle"
                />
              ) : (
                <div className="hello-bubble" aria-hidden="true">
                  היי! 👋
                </div>
              )}
            </div>
          </div>

          {/* 3. הפעולה הראשית */}
          <button onClick={go(props.onCapture)} className="capture-cta relative z-10 -mt-5 w-full">
            <span className="flex items-center justify-center gap-4">
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[1.35rem] bg-white/15">
                <img src="/art/camera.webp" alt="" className="h-[60px] w-[60px] object-contain" />
              </span>
              <span className="font-display text-[1.85rem] font-black">צַלְמוּ צמח!</span>
            </span>
          </button>
        </div>

        {/* 4. היום בגינה — שתי "תחנות גילוי": משימת בלש (זכוכית מגדלת) וגילוי בוטני (דגימה) */}
        <section className="relative mt-8 w-full max-w-sm" aria-labelledby="home-today">
          <GardenEdgeVine className="garden-deco section-vine section-vine--today" />
          <SectionHeading id="home-today" accessory={<PawTrail className="h-9 w-[110px]" />}>
            היום בגינה
          </SectionHeading>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={go(props.onPlantOfDay)} className="explorer-card explorer-card--mint station">
              <span className="station-object station-object--plant">
                {plantOfDay.hebrewName.includes("שקד") ? (
                  <img src="/art/almond.webp" alt="" className="h-full w-full object-contain" />
                ) : (
                  <PlantSpecimenArt category={plantOfDay.category} className="h-full w-full" />
                )}
              </span>
              <span className="block text-xs font-bold text-leaf-dark">צמח היום</span>
              <span className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug text-forest">
                {plantOfDay.hebrewName}
              </span>
              <span className="mt-auto flex w-full items-center justify-between gap-2 pt-2">
                <span className="specimen-tag">{plantOfDay.category}</span>
                <ChevronForward className="h-5 w-5 text-leaf-dark/45" />
              </span>
            </button>
            <button onClick={go(props.onChallenges)} className="explorer-card explorer-card--sun station">
              <span className="station-object station-object--challenge">
                <img src="/art/magnifier.webp" alt="" className="h-full w-full object-contain" />
              </span>
              {challengeDoneToday && <span className="done-stamp">✓ הושלם</span>}
              <span className="block text-xs font-bold text-amber-800">
                {challenge.id === "custom" ? "אתגר מההורים" : "אתגר היום"}
              </span>
              <span className="mt-0.5 line-clamp-3 text-[15px] font-bold leading-snug text-forest">
                {challenge.text}
              </span>
              <span className="mt-auto flex w-full justify-end pt-2">
                <ChevronForward className="h-5 w-5 text-amber-700/45" />
              </span>
            </button>
          </div>
        </section>

        {/* 5. פעילויות — אלבום השדה (חפץ-גיבור) ושלושה כלי חוקר */}
        <section className="relative mt-5 w-full max-w-sm" aria-labelledby="home-explore">
          <GardenEdgeVine className="garden-deco section-vine section-vine--explore" />
          <EdgeLeafLarge className="garden-deco deco-leaf-large" />
          <SectionHeading id="home-explore" accessory={<BeeTrail className="h-9 w-[110px]" />}>
            לגלות ולשחק
          </SectionHeading>

          <button onClick={go(props.onAlbum)} className="explorer-card explorer-card--peach album-card">
            <span className="album-object">
              <img src="/art/album.webp" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-base font-black text-forest">האלבום שלי</span>
              <span className="mt-0.5 block text-xs font-bold text-amber-900/70">
                {stickerCount} מתוך {totalPlants} צמחים
              </span>
              <span className="field-progress" aria-hidden="true">
                <span className="field-progress__fill" style={{ width: `${albumPct}%` }} />
              </span>
            </span>
            <ChevronForward className="h-5 w-5 shrink-0 text-amber-800/40" />
          </button>

          <StoneBloom className="garden-deco deco-stone" />
          <div className="mt-10 grid grid-cols-3 gap-3">
            <button onClick={go(props.onEncyclopedia)} className="explorer-card explorer-card--mint activity-tile">
              <span className="tile-object tile-object--book">
                <img src="/art/book.webp" alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-[13px] font-bold leading-tight text-forest">אנציקלופדיה</span>
            </button>
            <button onClick={go(props.onGames)} className="explorer-card explorer-card--lilac activity-tile">
              <span className="tile-object tile-object--games">
                <img src="/art/games.webp" alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-[13px] font-bold leading-tight text-forest">משחקים</span>
            </button>
            <button onClick={go(props.onOnline)} className="explorer-card explorer-card--sky activity-tile">
              <span className="tile-object tile-object--globe">
                <img src="/art/globe.webp" alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-[13px] font-bold leading-tight text-forest">תחרות אונליין</span>
            </button>
          </div>
        </section>

        {/* 6. אזור הורים — שקט יותר */}
        {account?.isParent && (
          <button
            onClick={go(props.onParents)}
            className="parents-entry mt-6 flex w-full max-w-sm items-center gap-3 rounded-[1.4rem] px-4 py-2.5 text-right transition-transform active:scale-[0.98]"
          >
            <ParentsArt className="h-10 w-10 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-forest">אזור הורים</span>
              <span className="block text-xs font-medium text-forest/80">הילדים שלי, אתגר אישי ועוד</span>
            </span>
            <ChevronForward className="h-5 w-5 shrink-0 text-forest" />
          </button>
        )}

        {/* הגינה ממשיכה מעבר למסך */}
        <GardenFloor className="garden-floor" />
      </div>

      {boti.popupOpen && <RiddlePopup plant={boti.plant} onClose={boti.closePopup} />}
    </div>
  );
}
