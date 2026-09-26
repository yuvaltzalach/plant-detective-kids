import { useId, type ReactNode } from "react";
import type { PlantCategory } from "../types";

// איורים שטוחים-מעט-ממדיים למסך הבית — באותה שפה של הכלבלב: צורות עגולות, פסטל, בלי קווי מתאר כבדים.
// כולם דקורטיביים (aria-hidden) — הטקסט שליד כל איור הוא התווית.
//
// מתכון התאורה המשותף (האור מגיע מהשמש — למעלה מימין):
//  • הדגשות בהירות בצד העליון-ימני של כל חפץ
//  • "עובי" בגוון כהה מוזז מעט למטה-שמאלה מתחת לכל גוף
//  • צל-קרקע רך מתחת לחפץ, מוסט מעט שמאלה

export type ArtProps = { className?: string };

export const svgProps = {
  "aria-hidden": true as const,
  focusable: false as const
};

/** עלה בסיסי — מצויר לאורך ציר X מ-0 עד len. */
export function Leaf({
  len = 20,
  w = 8,
  fill,
  vein = "rgba(255,255,255,0.55)",
  transform
}: {
  len?: number;
  w?: number;
  fill: string;
  vein?: string;
  transform?: string;
}) {
  return (
    <g transform={transform}>
      <path
        d={`M0 0 C ${len * 0.3} ${-w}, ${len * 0.8} ${-w}, ${len} 0 C ${len * 0.8} ${w}, ${len * 0.3} ${w}, 0 0 Z`}
        fill={fill}
      />
      <path d={`M${len * 0.12} 0 L${len * 0.82} 0`} stroke={vein} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/** פרח קטן בחמישה עלי כותרת. */
export function Flower({
  x,
  y,
  r = 4,
  petal = "#f9a8d4",
  heart = "#facc15"
}: {
  x: number;
  y: number;
  r?: number;
  petal?: string;
  heart?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={0} cy={-r} r={r * 0.78} fill={petal} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.62} fill={heart} />
    </g>
  );
}

/** צל-קרקע רך (מוסט מעט שמאלה — האור מימין). */
function Ground({ cx, cy, rx, ry = 4 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx - 2} cy={cy} rx={rx} ry={ry} fill="#14532d" fillOpacity="0.13" />;
}

/** כוכב חמש-קצוות סביב (cx,cy). */
function starPath(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.48;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** פריחה של עץ (שקד/דובדבן) — חמישה עלי כותרת לבנים-ורודים. */
function Blossom({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.62} rx={r * 0.5} ry={r * 0.62} fill="#fff" transform={`rotate(${a})`} />
      ))}
      {[36, 108, 180, 252, 324].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.5} rx={r * 0.16} ry={r * 0.3} fill="#fbcfe8" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.3} fill="#f472b6" />
      <circle r={r * 0.13} fill="#facc15" />
    </g>
  );
}

/** צמח גבוה שצומח מהגבעה — ליד הכלבלב, עם נדנוד עדין. */
export function HeroPlant({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 90 150" className={className} {...svgProps}>
      <g className="plant-sway">
        <path d="M45 150 C 44 118, 50 88, 46 52" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
        <Leaf len={38} w={13} fill="#22c55e" transform="translate(45 122) rotate(-150)" />
        <Leaf len={36} w={12} fill="#4ade80" transform="translate(46 108) rotate(-28)" />
        <Leaf len={30} w={11} fill="#16a34a" transform="translate(47 88) rotate(-158)" />
        <Leaf len={28} w={10} fill="#22c55e" transform="translate(47 74) rotate(-24)" />
        <Flower x={46} y={46} r={9} />
      </g>
    </svg>
  );
}

/** מצלמה ידידותית עם עלה בעדשה — לכפתור הצילום. גוף עם עובי ועדשה עם עומק. */
export function CameraArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <rect x="19" y="12" width="20" height="11" rx="4.5" fill="#f59e0b" />
      <rect x="20" y="9.5" width="20" height="11" rx="4.5" fill="#fde68a" />
      <rect x="4" y="19.5" width="54" height="38" rx="12" fill="#d6c7a1" />
      <rect x="5" y="16.5" width="54" height="38" rx="12" fill="#fffbeb" />
      <rect x="5" y="16.5" width="54" height="10" rx="5" fill="#fef3c7" />
      <rect x="36" y="19" width="16" height="2.4" rx="1.2" fill="#fff" />
      <circle cx="49.5" cy="27" r="3.4" fill="#f59e0b" />
      <circle cx="50" cy="26.4" r="3.2" fill="#facc15" />
      <circle cx="31" cy="38.5" r="14.5" fill="#14532d" />
      <circle cx="32" cy="37" r="14" fill="#15803d" />
      <circle cx="32" cy="37" r="10.2" fill="#0f5132" />
      <circle cx="32.4" cy="36.6" r="9.2" fill="#bbf7d0" />
      <Leaf len={13} w={5} fill="#16a34a" transform="translate(26 42) rotate(-45)" />
      <path d="M33.5 29.2 A 7.6 7.6 0 0 1 39.6 34.6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="37.6" cy="31.6" r="1.4" fill="#fff" />
    </svg>
  );
}

// ===== חפצי החוקר (מופיעים "יושבים" על הכרטיסים ובולטים מהם) =====

/** אתגר היום — זכוכית מגדלת בוחנת פרח קטן; הפרח נראה מוגדל בתוך העדשה. כוכב נדלק כשהושלם. */
export function ChallengeArt({ className, done = false }: ArtProps & { done?: boolean }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} {...svgProps}>
      <defs>
        <clipPath id={clip}>
          <circle cx="53" cy="43" r="21.5" />
        </clipPath>
      </defs>
      {/* הנושא: פרח קטן על המשטח */}
      <Ground cx={32} cy={94} rx={20} ry={3.6} />
      <path d="M30 93 C 29 85, 31 77, 30 69" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Leaf len={15} w={5.5} fill="#22c55e" transform="translate(30 88) rotate(-150)" />
      <Leaf len={14} w={5} fill="#16a34a" transform="translate(30 83) rotate(-32)" />
      <Flower x={30} y={65} r={7} petal="#f9a8d4" />
      {/* ידית (מאחורי העדשה) */}
      <g transform="rotate(42 72 70)">
        <rect x="64" y="65" width="32" height="12" rx="6" fill="#14532d" />
        <rect x="65" y="62" width="32" height="12" rx="6" fill="#15803d" />
        <rect x="65" y="62" width="8" height="12" rx="2.5" fill="#fbbf24" />
        <rect x="77" y="64.4" width="16" height="2.6" rx="1.3" fill="#fff" fillOpacity="0.35" />
      </g>
      {/* מסגרת העדשה — עובי + פנים */}
      <circle cx="50.5" cy="46.5" r="28" fill="#b45309" />
      <circle cx="53" cy="43" r="28" fill="#f59e0b" />
      <circle cx="53" cy="43" r="21.5" fill="#e0f2fe" />
      {/* הפרח המוגדל בתוך העדשה */}
      <g clipPath={`url(#${clip})`}>
        <Leaf len={30} w={11} fill="#4ade80" transform="translate(38 70) rotate(-60)" />
        <Flower x={43} y={50} r={15} petal="#f9a8d4" />
        <circle cx="53" cy="43" r="21.5" fill="#bae6fd" fillOpacity="0.28" />
      </g>
      <path d="M57.3 18.4 A 25 25 0 0 1 76.5 34.4" stroke="#fde68a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M57.4 26.6 A 17 17 0 0 1 66.9 33.2" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="69" cy="38.5" r="1.8" fill="#fff" />
      {/* כוכב־פרס: נדלק כשהאתגר הושלם */}
      <path d={starPath(15, 17, 10)} fill={done ? "#ca8a04" : "#fcd34d"} transform="translate(-1 2)" />
      <path
        d={starPath(15, 17, 10)}
        fill={done ? "#facc15" : "#fffbeb"}
        stroke={done ? "none" : "#fcd34d"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** תווית דגימה קטנה תלויה בחוט. */
function SpecimenTag({ x, y, from }: { x: number; y: number; from: [number, number] }) {
  return (
    <g>
      <path d={`M${from[0]} ${from[1]} Q ${x + 6} ${from[1] + 6} ${x + 8} ${y + 1}`} stroke="#a16207" strokeWidth="1" fill="none" />
      <g transform={`rotate(-8 ${x + 11} ${y + 6})`}>
        <rect x={x - 0.8} y={y + 1.8} width="24" height="13" rx="3" fill="#e7d59e" />
        <rect x={x} y={y} width="24" height="13" rx="3" fill="#fffbeb" />
        <circle cx={x + 4} cy={y + 6.5} r="1.4" fill="#e7d59e" />
        <rect x={x + 8} y={y + 4} width="13" height="1.8" rx="0.9" fill="#86efac" />
        <rect x={x + 8} y={y + 7.6} width="9" height="1.8" rx="0.9" fill="#bbf7d0" />
      </g>
    </g>
  );
}

/**
 * צמח היום — דגימה בוטנית לפי קטגוריית הצמח (מידע קיים):
 * עץ → ענף פורח, פרח → גבעול עם פריחה, עשב/צמח → ענף תבלין.
 */
export function PlantSpecimenArt({ className, category }: ArtProps & { category: PlantCategory }) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...svgProps}>
      <Ground cx={52} cy={94} rx={30} ry={3.8} />
      {category === "עץ" ? (
        <g>
          {/* ענף פורח (כמו שקד) — עובי + גוף + הדגשה */}
          <g transform="translate(-1.5 2.5)" stroke="#78350f" strokeOpacity="0.55" fill="none" strokeLinecap="round">
            <path d="M8 90 C 30 72, 55 54, 92 20" strokeWidth="7" />
            <path d="M48 58 C 46 46, 50 38, 58 31" strokeWidth="3.6" />
            <path d="M28 76 C 20 66, 19 58, 24 50" strokeWidth="3.2" />
          </g>
          <g stroke="#b7791f" fill="none" strokeLinecap="round">
            <path d="M8 90 C 30 72, 55 54, 92 20" strokeWidth="6" />
            <path d="M48 58 C 46 46, 50 38, 58 31" strokeWidth="3.2" />
            <path d="M28 76 C 20 66, 19 58, 24 50" strokeWidth="2.8" />
          </g>
          <path d="M30 71 C 50 56, 66 44, 88 23" stroke="#e2b77a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <Leaf len={14} w={5} fill="#86efac" transform="translate(66 42) rotate(-100)" />
          <Leaf len={13} w={4.6} fill="#4ade80" transform="translate(40 64) rotate(40)" />
          <Blossom x={90} y={20} r={9} />
          <Blossom x={58} y={30} r={8} />
          <Blossom x={74} y={40} r={7} />
          <Blossom x={24} y={48} r={7.5} />
          <Blossom x={42} y={66} r={6} />
          <ellipse cx="83" cy="10" rx="2.6" ry="3.6" fill="#f9a8d4" transform="rotate(30 83 10)" />
          <ellipse cx="31" cy="40" rx="2.4" ry="3.4" fill="#f9a8d4" transform="rotate(-20 31 40)" />
          <SpecimenTag x={58} y={64} from={[64, 50]} />
        </g>
      ) : category === "פרח" ? (
        <g>
          {/* גבעול פרח עם פריחה גדולה */}
          <path d="M20 90 C 34 72, 52 52, 66 30" stroke="#14532d" strokeOpacity="0.4" strokeWidth="5" fill="none" strokeLinecap="round" transform="translate(-1.5 2.5)" />
          <path d="M20 90 C 34 72, 52 52, 66 30" stroke="#16a34a" strokeWidth="4.2" fill="none" strokeLinecap="round" />
          <Leaf len={26} w={9} fill="#22c55e" transform="translate(34 72) rotate(-160)" />
          <Leaf len={24} w={8} fill="#4ade80" transform="translate(44 60) rotate(-10)" />
          <Leaf len={18} w={6} fill="#16a34a" transform="translate(54 46) rotate(-150)" />
          <path d="M52 50 Q 66 50 78 56" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="81" cy="57" rx="3.2" ry="4.4" fill="#c4b5fd" transform="rotate(60 81 57)" />
          <g transform="translate(-1.5 2.5)" opacity="0.35">
            <Flower x={67} y={27} r={12} petal="#7c3aed" heart="#7c3aed" />
          </g>
          <Flower x={67} y={27} r={12} petal="#c4b5fd" heart="#facc15" />
          <circle cx="71" cy="20" r="2.4" fill="#fff" fillOpacity="0.55" />
          <SpecimenTag x={10} y={56} from={[30, 78]} />
        </g>
      ) : (
        <g>
          {/* ענף תבלין עם זוגות עלים */}
          <path d="M18 92 C 34 70, 52 50, 76 18" stroke="#14532d" strokeOpacity="0.4" strokeWidth="4.4" fill="none" strokeLinecap="round" transform="translate(-1.5 2.5)" />
          <path d="M18 92 C 34 70, 52 50, 76 18" stroke="#15803d" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          {[
            [26, 80, 20],
            [36, 67, 19],
            [46, 55, 17],
            [56, 43, 15],
            [66, 31, 13]
          ].map(([x, y, l], i) => (
            <g key={i}>
              <Leaf len={l} w={l * 0.42} fill={i % 2 ? "#4ade80" : "#22c55e"} transform={`translate(${x} ${y}) rotate(-150)`} />
              <Leaf len={l} w={l * 0.42} fill={i % 2 ? "#22c55e" : "#16a34a"} transform={`translate(${x} ${y}) rotate(-10)`} />
            </g>
          ))}
          <Leaf len={12} w={5} fill="#86efac" transform="translate(76 18) rotate(-60)" />
          <Flower x={80} y={12} r={3.4} petal="#c4b5fd" />
          <SpecimenTag x={60} y={62} from={[48, 56]} />
        </g>
      )}
    </svg>
  );
}

/** אלבום השדה — כריכה ירוקה עם טבעות, שכבות דפים, לשוניות, סמל עלה, תווית דגימה ומדבקת פרח. */
export function AlbumArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} {...svgProps}>
      <Ground cx={60} cy={92} rx={46} ry={5} />
      <g transform="rotate(-5 60 50)">
        {/* לשוניות בצד הפתיחה (שמאל) */}
        <rect x="4" y="22" width="18" height="10" rx="3.5" fill="#7dd3fc" />
        <rect x="4" y="36" width="18" height="10" rx="3.5" fill="#f9a8d4" />
        <rect x="4" y="50" width="18" height="10" rx="3.5" fill="#fde68a" />
        {/* שכבות דפים */}
        <rect x="13" y="19" width="86" height="70" rx="8" fill="#eadbb8" />
        <rect x="12" y="15" width="86" height="70" rx="8" fill="#fffbeb" />
        <path d="M14 80 H96" stroke="#eadbb8" strokeWidth="1.2" />
        {/* כריכה: עובי + פנים */}
        <rect x="15" y="12" width="88" height="70" rx="9" fill="#14532d" />
        <rect x="18" y="8" width="85" height="70" rx="9" fill="#16a34a" />
        <rect x="90" y="8" width="13" height="70" rx="6" fill="#15803d" />
        <rect x="58" y="12" width="28" height="3" rx="1.5" fill="#fff" fillOpacity="0.35" />
        <rect x="80" y="17" width="6" height="3" rx="1.5" fill="#fff" fillOpacity="0.35" />
        {/* טבעות כריכה (צד ימין — כריכה ב-RTL) */}
        {[20, 40, 60].map((y) => (
          <g key={y}>
            <rect x="92" y={y + 1.5} width="15" height="7" rx="3.5" fill="#94a3b8" />
            <rect x="93" y={y} width="15" height="7" rx="3.5" fill="#f1f5f9" />
            <rect x="99" y={y + 1.4} width="6" height="1.6" rx="0.8" fill="#fff" />
          </g>
        ))}
        {/* סמל העלה */}
        <circle cx="51" cy="37" r="16" fill="#0f5132" fillOpacity="0.35" transform="translate(-1.5 2)" />
        <circle cx="51" cy="37" r="16" fill="#fffbeb" />
        <circle cx="51" cy="37" r="12.5" fill="none" stroke="#86efac" strokeWidth="1.6" strokeDasharray="2.6 2.6" />
        <Leaf len={18} w={7} fill="#16a34a" transform="translate(44 45) rotate(-52)" />
        {/* תווית דגימה */}
        <rect x="35" y="58" width="32" height="11" rx="3" fill="#fef3c7" />
        <rect x="40" y="61.6" width="16" height="1.8" rx="0.9" fill="#86efac" />
        <rect x="40" y="64.8" width="11" height="1.8" rx="0.9" fill="#bbf7d0" />
        {/* מדבקת פרח */}
        <g transform="translate(25 68) rotate(-14)">
          <circle r="10.5" fill="#14532d" fillOpacity="0.18" transform="translate(-1 1.5)" />
          <circle r="10.5" fill="#fff" />
          <Flower x={0} y={0} r={5.6} petal="#f9a8d4" />
        </g>
      </g>
    </svg>
  );
}

/** אנציקלופדיה — ספר בוטני פתוח: עובי כריכה, שכבות דפים, איור עלה, פרח מיובש וחיפושית. */
export function BookArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 110 92" className={className} {...svgProps}>
      <Ground cx={55} cy={86} rx={44} ry={4.5} />
      {/* סרט סימנייה */}
      <path d="M60 74 L60 90 L64 86.5 L68 90 L68 74 Z" fill="#f472b6" />
      {/* כריכה */}
      <path d="M5 33 Q 30 25 55 33 Q 80 25 105 33 L 105 81 Q 80 73 55 81 Q 30 73 5 81 Z" fill="#14532d" transform="translate(-1.5 3)" />
      <path d="M5 33 Q 30 25 55 33 Q 80 25 105 33 L 105 81 Q 80 73 55 81 Q 30 73 5 81 Z" fill="#16a34a" />
      {/* עובי הדפים */}
      <path d="M10 30 Q 32 20 54 30 L 54 78 Q 32 69 10 78 Z" fill="#e7d7b0" transform="translate(0 3)" />
      <path d="M56 30 Q 78 20 100 30 L 100 78 Q 78 69 56 78 Z" fill="#e7d7b0" transform="translate(0 3)" />
      {/* הדפים */}
      <path d="M10 28 Q 32 18 54 28 L 54 76 Q 32 67 10 76 Z" fill="#fffbeb" />
      <path d="M56 28 Q 78 18 100 28 L 100 76 Q 78 67 56 76 Z" fill="#fff7e6" />
      <path d="M55 28 V78" stroke="#e7d7b0" strokeWidth="2" />
      {/* עמוד ימני: עלה גדול */}
      <path d="M78 66 C 77 56, 79 46, 78 34" stroke="#15803d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Leaf len={15} w={6} fill="#22c55e" transform="translate(78 58) rotate(-150)" />
      <Leaf len={15} w={6} fill="#16a34a" transform="translate(78 52) rotate(-30)" />
      <Leaf len={12} w={5} fill="#4ade80" transform="translate(78 44) rotate(-145)" />
      <Leaf len={11} w={4.6} fill="#22c55e" transform="translate(78 39) rotate(-40)" />
      <path d="M94 30 L 99 30" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      {/* עמוד שמאלי: שורות טקסט ופרח מיובש */}
      <rect x="17" y="33" width="26" height="2.6" rx="1.3" fill="#bbf7d0" />
      <rect x="17" y="39" width="20" height="2.6" rx="1.3" fill="#dcfce7" />
      <Flower x={30} y={56} r={6} petal="#fbcfe8" />
      <path d="M30 62 L 30 70" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round" />
      {/* חיפושית קטנה על פינת העמוד */}
      <g transform="translate(92 67) rotate(-25)">
        <circle cx="0" cy="-5" r="2.3" fill="#1f2937" />
        <path d="M-5 0 A 5 5 0 0 1 5 0 L 5 1 A 5 5 0 0 1 -5 1 Z" fill="#ef4444" />
        <circle cx="0" cy="0.5" r="5" fill="#ef4444" />
        <path d="M0 -4.5 V5.5" stroke="#1f2937" strokeWidth="0.8" />
        <circle cx="-2.4" cy="-0.5" r="1" fill="#1f2937" />
        <circle cx="2.4" cy="1.5" r="1" fill="#1f2937" />
        <circle cx="1.6" cy="-2.2" r="0.8" fill="#fff" fillOpacity="0.7" />
      </g>
    </svg>
  );
}

/** קלף משחק עם עובי. */
function PlayCard({
  x,
  y,
  rot,
  face,
  edge,
  children
}: {
  x: number;
  y: number;
  rot: number;
  face: string;
  edge: string;
  children?: ReactNode;
}) {
  return (
    <g transform={`rotate(${rot} ${x + 16} ${y + 22})`}>
      <rect x={x - 1.5} y={y + 3} width="32" height="44" rx="7" fill={edge} />
      <rect x={x} y={y} width="32" height="44" rx="7" fill={face} />
      <rect x={x + 4} y={y + 4} width="24" height="36" rx="4.5" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4" strokeDasharray="3 2.6" />
      <rect x={x + 18} y={y + 2.5} width="9" height="2" rx="1" fill="#fff" fillOpacity="0.6" />
      {children}
    </g>
  );
}

/** משחקים — שלושה קלפי צמחים פרוסים; הקלף העליון מורם. */
export function GamesArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 100 92" className={className} {...svgProps}>
      <Ground cx={50} cy={87} rx={36} ry={4} />
      <PlayCard x={12} y={36} rot={-18} face="#a78bfa" edge="#6d28d9">
        <Leaf len={16} w={6} fill="#ede9fe" vein="#a78bfa" transform="translate(20 66) rotate(-55)" />
      </PlayCard>
      <PlayCard x={34} y={30} rot={-3} face="#fbcfe8" edge="#db2777">
        <Leaf len={14} w={5} fill="#22c55e" transform="translate(44 62) rotate(-70)" />
        <Leaf len={12} w={4.4} fill="#4ade80" transform="translate(50 60) rotate(-20)" />
      </PlayCard>
      <PlayCard x={54} y={14} rot={14} face="#fffbeb" edge="#a78bfa">
        <Flower x={70} y={34} r={8} petal="#c4b5fd" />
      </PlayCard>
    </svg>
  );
}

/** תחרות אונליין — כדור ארץ על מעמד, עם נבט, עלים וענן קטן. */
export function GlobeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...svgProps}>
      <Ground cx={50} cy={94} rx={26} ry={4} />
      {/* מעמד */}
      <ellipse cx="49" cy="90" rx="19" ry="5" fill="#b8905a" />
      <ellipse cx="50" cy="88" rx="19" ry="5" fill="#e9c98f" />
      <rect x="47" y="72" width="6" height="16" rx="2" fill="#c9a063" />
      <path d="M75 22 A 31 31 0 0 1 58 76" stroke="#c9a063" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      {/* נבט */}
      <path d="M50 18 C 50 13, 49 9, 51 5" stroke="#15803d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Leaf len={14} w={5.5} fill="#22c55e" transform="translate(50.5 9) rotate(-160)" />
      <Leaf len={14} w={5.5} fill="#16a34a" transform="translate(50.5 8) rotate(-22)" />
      {/* הכדור: עובי, פנים, צל עגול בצד שמאל-תחתון */}
      <circle cx="47.5" cy="47.5" r="27" fill="#0369a1" fillOpacity="0.55" />
      <circle cx="50" cy="45" r="27" fill="#7dd3fc" />
      <path d="M26 56 A 27 27 0 0 0 66 67 A 30 30 0 0 1 26 56 Z" fill="#38bdf8" fillOpacity="0.55" />
      <path d="M31 33 Q 39 26 48 30 Q 51 37 44 41 Q 39 46 43 53 Q 36 57 29 50 Q 25 40 31 33 Z" fill="#4ade80" />
      <path d="M57 46 Q 66 41 72 47 Q 72 57 64 63 Q 56 61 58 55 Q 53 51 57 46 Z" fill="#22c55e" />
      <path d="M56 25 Q 64 23 68 29 Q 63 32 58 30 Z" fill="#4ade80" />
      <Leaf len={10} w={4} fill="#16a34a" transform="translate(38 52) rotate(-70)" />
      <path d="M58 22 A 22 22 0 0 1 72 36" stroke="#fff" strokeOpacity="0.75" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="73.5" cy="41" r="1.8" fill="#fff" fillOpacity="0.8" />
      {/* ענן קטן */}
      <g transform="translate(80 22)">
        <ellipse cx="0" cy="3" rx="11" ry="5" fill="#bae6fd" />
        <circle cx="-4" cy="0" r="5" fill="#fff" />
        <circle cx="3" cy="-2" r="6" fill="#fff" />
        <ellipse cx="0" cy="2" rx="11" ry="4.5" fill="#fff" />
      </g>
    </svg>
  );
}

/** הורה וילד — שקט ועדין, לאזור ההורים. */
export function ParentsArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <circle cx="24" cy="21" r="8" fill="#15803d" fillOpacity="0.55" />
      <path d="M10 52 Q 10 34 24 34 Q 38 34 38 52 Z" fill="#15803d" fillOpacity="0.55" />
      <circle cx="44" cy="31" r="6" fill="#15803d" fillOpacity="0.35" />
      <path d="M34 52 Q 34 41 44 41 Q 54 41 54 52 Z" fill="#15803d" fillOpacity="0.35" />
      <path d="M44 12 c -2.5 -3.5 -8 -1.5 -6 2.5 l 6 5.5 l 6 -5.5 c 2 -4 -3.5 -6 -6 -2.5 z" fill="#f9a8d4" />
    </svg>
  );
}

/** דלת — יציאה מהחשבון. */
export function DoorArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svgProps}>
      <path d="M6 3.5 h9 a2 2 0 0 1 2 2 V21 H6 Z" fill="currentColor" fillOpacity="0.18" />
      <path d="M6 3.5 h9 a2 2 0 0 1 2 2 V21 H6 Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <circle cx="13.5" cy="12.5" r="1.2" fill="currentColor" />
      <path d="M4 21 H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** חץ "קדימה" ב-RTL (מצביע שמאלה). */
export function ChevronForward({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svgProps}>
      <path d="M14.5 6 L8.5 12 L14.5 18" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** גבעה רכה + פרחים קטנים — הבמה שעליה יושב הכלבלב. */
export function HillArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 360 90" preserveAspectRatio="none" className={className} {...svgProps}>
      <path d="M0 60 Q 70 18 170 26 Q 280 34 360 52 L 360 90 L 0 90 Z" fill="#bbf7d0" />
      <path d="M0 74 Q 90 44 190 50 Q 290 56 360 70 L 360 90 L 0 90 Z" fill="#86efac" fillOpacity="0.55" />
    </svg>
  );
}
