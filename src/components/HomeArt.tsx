// איורים שטוחים קטנים למסך הבית — באותה שפה של הכלבלב: צורות עגולות, פסטל, בלי קווי מתאר כבדים.
// כולם דקורטיביים (aria-hidden) — הטקסט שליד כל איור הוא התווית.

type ArtProps = { className?: string };

const svgProps = {
  "aria-hidden": true as const,
  focusable: false as const
};

/** עלה בסיסי — מצויר לאורך ציר X מ-0 עד len. */
function Leaf({
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
function Flower({ x, y, r = 4, petal = "#f9a8d4", heart = "#facc15" }: { x: number; y: number; r?: number; petal?: string; heart?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={0} cy={-r} r={r * 0.78} fill={petal} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.62} fill={heart} />
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

/** מצלמה ידידותית עם עלה בעדשה — לכפתור הצילום. */
export function CameraArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <rect x="20" y="10" width="20" height="11" rx="4.5" fill="#fde68a" />
      <rect x="5" y="17" width="54" height="38" rx="12" fill="#fffbeb" />
      <rect x="5" y="17" width="54" height="10" rx="5" fill="#fef3c7" />
      <circle cx="49" cy="26" r="3.2" fill="#facc15" />
      <circle cx="32" cy="37" r="14" fill="#15803d" />
      <circle cx="32" cy="37" r="10" fill="#dcfce7" />
      <Leaf len={13} w={5} fill="#16a34a" transform="translate(25.5 42) rotate(-45)" />
      <circle cx="36.5" cy="32.5" r="2.2" fill="#fff" />
    </svg>
  );
}

/** אלבום פתוח עם עלה מיובש ומדבקה. */
export function AlbumArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <path d="M4 16 Q 4 12 8 12 L 56 12 Q 60 12 60 16 L 60 52 Q 60 56 56 56 L 8 56 Q 4 56 4 52 Z" fill="#f59e0b" />
      <path d="M8 14 Q 20 10 31 15 L 31 52 Q 20 47 8 51 Z" fill="#fffbeb" />
      <path d="M56 14 Q 44 10 33 15 L 33 52 Q 44 47 56 51 Z" fill="#fff7ed" />
      <Leaf len={17} w={6} fill="#22c55e" transform="translate(12 40) rotate(-50)" />
      <circle cx="45" cy="28" r="7" fill="#fbcfe8" />
      <path d="M45 23.5 l1.5 3 3.2 .4 -2.3 2.2 .6 3.2 -3 -1.6 -3 1.6 .6 -3.2 -2.3 -2.2 3.2 -.4 z" fill="#fff" />
      <rect x="38" y="40" width="14" height="2.6" rx="1.3" fill="#fde68a" />
    </svg>
  );
}

/** ספר עם סימנייה של עלה — אנציקלופדיה. */
export function BookArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Leaf len={20} w={7} fill="#4ade80" transform="translate(42 16) rotate(-70)" />
      <rect x="12" y="12" width="40" height="44" rx="7" fill="#16a34a" />
      <rect x="16" y="48" width="36" height="8" rx="3" fill="#fffbeb" />
      <rect x="12" y="12" width="7" height="44" rx="3.5" fill="#15803d" />
      <rect x="24" y="21" width="22" height="14" rx="5" fill="#dcfce7" />
      <Leaf len={12} w={4.5} fill="#16a34a" vein="#dcfce7" transform="translate(29 30.5) rotate(-35)" />
    </svg>
  );
}

/** קלפי זיכרון — משחקים. */
export function GamesArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <g transform="rotate(-12 26 34)">
        <rect x="10" y="14" width="30" height="40" rx="8" fill="#a78bfa" />
        <circle cx="25" cy="34" r="7" fill="none" stroke="#ede9fe" strokeWidth="2.4" />
        <circle cx="25" cy="34" r="2.4" fill="#ede9fe" />
      </g>
      <g transform="rotate(10 40 34)">
        <rect x="26" y="12" width="30" height="40" rx="8" fill="#fffbeb" />
        <Flower x={41} y={32} r={6} petal="#c4b5fd" />
      </g>
    </svg>
  );
}

/** כדור ארץ ירוק — תחרות אונליין. */
export function GlobeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <circle cx="32" cy="33" r="22" fill="#7dd3fc" />
      <path d="M17 22 Q 24 16 31 20 Q 34 26 28 29 Q 24 33 27 39 Q 22 42 16 36 Q 12 28 17 22 Z" fill="#4ade80" />
      <path d="M38 36 Q 45 32 51 36 Q 52 44 45 50 Q 39 49 40 44 Q 35 41 38 36 Z" fill="#22c55e" />
      <path d="M39 16 Q 45 15 48 20 Q 44 22 40 20 Z" fill="#4ade80" />
      <path d="M17 26 A 18 18 0 0 1 28 14" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Leaf len={14} w={5} fill="#16a34a" transform="translate(46 13) rotate(-60)" />
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

/** ענף קטן לכותרות אזורים. */
export function SprigArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 28 20" className={className} {...svgProps}>
      <path d="M2 17 Q 12 14 24 4" stroke="#15803d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Leaf len={9} w={3.6} fill="#22c55e" transform="translate(9 14.5) rotate(-110)" />
      <Leaf len={9} w={3.6} fill="#4ade80" transform="translate(14 11.5) rotate(-10)" />
      <Leaf len={8} w={3.2} fill="#16a34a" transform="translate(19 8) rotate(-115)" />
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
      <Flower x={52} y={46} r={3.2} petal="#fbcfe8" />
      <Flower x={300} y={48} r={3} petal="#c4b5fd" heart="#fde68a" />
      <Flower x={318} y={58} r={2.4} petal="#fff" />
    </svg>
  );
}

/** עלים גדולים ורכים לפינות הרקע. */
export function CornerLeaves({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgProps}>
      <Leaf len={90} w={26} fill="#bbf7d0" vein="#dcfce7" transform="translate(0 110) rotate(-55)" />
      <Leaf len={70} w={20} fill="#86efac" vein="#dcfce7" transform="translate(0 116) rotate(-20)" />
      <Leaf len={50} w={15} fill="#dcfce7" vein="#fff" transform="translate(6 100) rotate(-85)" />
    </svg>
  );
}
