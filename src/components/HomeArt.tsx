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

// ===== ערכת האייקונים של "בלש הגינה" =====
// מתכון משותף לכל האייקונים: צל-קרקע רך, "עובי" בגוון כהה מתחת לכל גוף (מוזז 3px למטה),
// והדגשה לבנה עדינה למעלה. כך כולם נראים כמו חפצים מאותו עולם.

/** צל-קרקע רך מתחת לחפץ. */
function Ground({ cx = 32, cy = 58, rx = 19 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={3.4} fill="#14532d" fillOpacity="0.13" />;
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

/** אתגר היום — זכוכית מגדלת מעל עלה, עם כוכב שנדלק כשהאתגר הושלם. */
export function ChallengeArt({ className, done = false }: ArtProps & { done?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Ground cx={30} />
      <Leaf len={30} w={10} fill="#16a34a" transform="translate(8 52) rotate(-38)" />
      <Leaf len={22} w={8} fill="#4ade80" transform="translate(12 54) rotate(-8)" />
      {/* ידית */}
      <g transform="rotate(45 42 42)">
        <rect x="36" y="41" width="22" height="9" rx="4.5" fill="#14532d" />
        <rect x="36" y="38.5" width="22" height="9" rx="4.5" fill="#15803d" />
        <rect x="39" y="40" width="14" height="2.2" rx="1.1" fill="#fff" fillOpacity="0.35" />
      </g>
      {/* מסגרת העדשה */}
      <circle cx="27" cy="28.5" r="16" fill="#d97706" />
      <circle cx="27" cy="26" r="16" fill="#fbbf24" />
      <circle cx="27" cy="26" r="11.5" fill="#e0f2fe" />
      {/* עלה מוגדל בתוך העדשה */}
      <Leaf len={15} w={5.5} fill="#22c55e" transform="translate(20 32) rotate(-50)" />
      <path d="M19.5 20.5 A 9 9 0 0 1 27 16.5" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* כוכב־פרס */}
      <path d={starPath(51, 13.5, 8)} fill={done ? "#eab308" : "#fde68a"} transform="translate(0 1.6)" />
      <path d={starPath(51, 13.5, 8)} fill={done ? "#facc15" : "#fffbeb"} stroke={done ? "none" : "#fcd34d"} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** צמח היום — עציץ בוטני עם תווית דגימה. */
export function SpecimenArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Ground />
      {/* הצמח */}
      <path d="M32 40 C 31 32, 33 24, 31 14" stroke="#15803d" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Leaf len={17} w={6.5} fill="#16a34a" transform="translate(32 34) rotate(-155)" />
      <Leaf len={17} w={6.5} fill="#22c55e" transform="translate(32 30) rotate(-25)" />
      <Leaf len={13} w={5} fill="#4ade80" transform="translate(32 22) rotate(-148)" />
      <Leaf len={12} w={4.6} fill="#16a34a" transform="translate(31.5 18) rotate(-40)" />
      <circle cx="31" cy="12.5" r="3.4" fill="#f9a8d4" />
      {/* העציץ */}
      <path d="M17 42 H47 L43.5 58 H20.5 Z" fill="#ec4899" fillOpacity="0.55" transform="translate(0 2)" />
      <path d="M17 42 H47 L43.5 57 H20.5 Z" fill="#fbcfe8" />
      <rect x="14.5" y="37" width="35" height="8" rx="4" fill="#f472b6" fillOpacity="0.55" transform="translate(0 2)" />
      <rect x="14.5" y="37" width="35" height="8" rx="4" fill="#f9a8d4" />
      <rect x="18" y="38.6" width="16" height="2" rx="1" fill="#fff" fillOpacity="0.55" />
      {/* תווית דגימה */}
      <rect x="25" y="47" width="14" height="7" rx="2" fill="#fff" />
      <rect x="27.5" y="49.8" width="9" height="1.5" rx="0.75" fill="#86efac" />
    </svg>
  );
}

/** אלבום השדה — כריכה עם טבעות, סמל עלה, לשוניות ומדבקת פרח. */
export function AlbumArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Ground />
      {/* לשוניות דפים (בצד הפתיחה — שמאל, כי הכריכה נכרכת מימין) */}
      <rect x="7" y="16" width="9" height="7" rx="2.5" fill="#7dd3fc" />
      <rect x="7" y="26" width="9" height="7" rx="2.5" fill="#f9a8d4" />
      <rect x="7" y="36" width="9" height="7" rx="2.5" fill="#c4b5fd" />
      {/* עובי הדפים + כריכה */}
      <rect x="11" y="11" width="42" height="45" rx="7" fill="#b45309" />
      <rect x="12" y="46" width="40" height="7" rx="3" fill="#fffbeb" />
      <rect x="11" y="8" width="42" height="42" rx="7" fill="#f59e0b" />
      <rect x="15" y="11" width="22" height="2.4" rx="1.2" fill="#fff" fillOpacity="0.3" />
      {/* טבעות כריכה בצד ימין */}
      {[16, 27, 38].map((y) => (
        <g key={y}>
          <rect x="48" y={y} width="9" height="5" rx="2.5" fill="#94a3b8" />
          <rect x="48" y={y - 0.8} width="9" height="5" rx="2.5" fill="#e2e8f0" />
        </g>
      ))}
      {/* סמל העלה */}
      <circle cx="30" cy="29" r="11" fill="#fffbeb" />
      <circle cx="30" cy="29" r="11" fill="none" stroke="#fcd34d" strokeWidth="1.6" strokeDasharray="2.4 2.4" />
      <Leaf len={14} w={5.5} fill="#16a34a" transform="translate(24 35) rotate(-50)" />
      {/* מדבקת פרח */}
      <g transform="translate(18 44) rotate(-12)">
        <circle r="6" fill="#fff" />
        <Flower x={0} y={0} r={3.4} petal="#f9a8d4" />
      </g>
    </svg>
  );
}

/** אנציקלופדיה — ספר בוטני עם איור עלה וסרט סימנייה. */
export function BookArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Ground />
      {/* סרט סימנייה */}
      <path d="M22 50 V60 L25 57.5 L28 60 V50 Z" fill="#f472b6" />
      <rect x="11" y="11" width="42" height="45" rx="7" fill="#14532d" />
      <rect x="12" y="46" width="39" height="7" rx="3" fill="#fffbeb" />
      <rect x="11" y="8" width="42" height="42" rx="7" fill="#16a34a" />
      {/* שדרה מימין */}
      <rect x="45" y="8" width="8" height="42" rx="4" fill="#15803d" />
      <rect x="15" y="11" width="22" height="2.4" rx="1.2" fill="#fff" fillOpacity="0.3" />
      {/* חלון איור */}
      <rect x="16" y="17" width="25" height="24" rx="7" fill="#dcfce7" />
      <path d="M28.5 38 C 28 32, 29 26, 28.5 21" stroke="#15803d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Leaf len={10} w={4} fill="#22c55e" transform="translate(28.5 33) rotate(-150)" />
      <Leaf len={10} w={4} fill="#16a34a" transform="translate(28.6 29) rotate(-30)" />
      <Leaf len={8} w={3.4} fill="#4ade80" transform="translate(28.5 24.5) rotate(-145)" />
    </svg>
  );
}

/** משחקים — שני קלפי-פרחים פרוסים. */
export function GamesArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Ground />
      <g transform="rotate(-13 24 34)">
        <rect x="9" y="15" width="28" height="38" rx="7" fill="#7c3aed" fillOpacity="0.55" />
        <rect x="9" y="12" width="28" height="38" rx="7" fill="#a78bfa" />
        <rect x="13" y="16" width="20" height="30" rx="4.5" fill="none" stroke="#ede9fe" strokeWidth="1.6" strokeDasharray="3 2.6" />
        <Leaf len={12} w={4.5} fill="#ede9fe" vein="#a78bfa" transform="translate(17 36) rotate(-55)" />
      </g>
      <g transform="rotate(11 40 32)">
        <rect x="27" y="13" width="28" height="38" rx="7" fill="#c4b5fd" />
        <rect x="27" y="10" width="28" height="38" rx="7" fill="#fffbeb" />
        <rect x="31" y="13" width="12" height="2.2" rx="1.1" fill="#fff" />
        <Flower x={41} y={29} r={6.5} petal="#c4b5fd" />
      </g>
    </svg>
  );
}

/** תחרות אונליין — כדור ארץ שמנביט עלים. */
export function GlobeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...svgProps}>
      <Ground />
      {/* נבט על הכדור */}
      <path d="M32 16 C 32 12, 31 9, 32 6" stroke="#15803d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Leaf len={13} w={5} fill="#22c55e" transform="translate(32 9) rotate(-160)" />
      <Leaf len={13} w={5} fill="#16a34a" transform="translate(32 8) rotate(-20)" />
      {/* הכדור */}
      <circle cx="32" cy="36.5" r="20" fill="#0284c7" fillOpacity="0.5" />
      <circle cx="32" cy="34" r="20" fill="#7dd3fc" />
      <path d="M18 26 Q 24 20 31 23 Q 34 29 28 32 Q 24 36 27 42 Q 22 45 17 39 Q 13 31 18 26 Z" fill="#4ade80" />
      <path d="M38 36 Q 45 32 50 37 Q 50 45 44 50 Q 38 49 39 44 Q 35 41 38 36 Z" fill="#22c55e" />
      <path d="M38 19 Q 44 18 47 23 Q 43 25 39 23 Z" fill="#4ade80" />
      <path d="M17.5 28 A 17 17 0 0 1 27.5 16.5" stroke="#fff" strokeOpacity="0.65" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** טביעת כף של כלבלב — לשביל הגינה. */
function Paw({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} fill="#15803d" fillOpacity="0.22">
      <ellipse cx="0" cy="2" rx="3.2" ry="2.7" />
      <circle cx="-3.4" cy="-2" r="1.3" />
      <circle cx="-1.2" cy="-3.6" r="1.3" />
      <circle cx="1.2" cy="-3.6" r="1.3" />
      <circle cx="3.4" cy="-2" r="1.3" />
    </g>
  );
}

/** דבורה קטנטנה. */
function Bee({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-1.5" cy="-4" rx="3" ry="2.2" fill="#fff" stroke="#bae6fd" strokeWidth="0.8" />
      <ellipse cx="2" cy="-4.2" rx="2.6" ry="2" fill="#fff" stroke="#bae6fd" strokeWidth="0.8" />
      <ellipse cx="0" cy="0" rx="5" ry="3.6" fill="#facc15" />
      <rect x="-1.6" y="-3.5" width="1.6" height="7" rx="0.8" fill="#14532d" fillOpacity="0.7" />
      <rect x="1.4" y="-3.2" width="1.4" height="6.4" rx="0.7" fill="#14532d" fillOpacity="0.7" />
    </g>
  );
}

/**
 * שביל הגינה — קו מנוקד עדין עם טביעות כפות, שממשיך מכותרת האזור הלאה (RTL: מימין לשמאל).
 * דקורטיבי בלבד; בוריאנט "bee" מסתיים בדבורה, אחרת בפרח קטן.
 */
export function GardenTrail({ className, end = "flower" }: ArtProps & { end?: "flower" | "bee" }) {
  return (
    <svg viewBox="0 0 200 26" preserveAspectRatio="xMaxYMid meet" className={className} {...svgProps}>
      <path
        d="M198 15 C 170 5, 150 22, 122 14 S 74 6, 50 15 S 22 20, 14 14"
        stroke="#16a34a"
        strokeOpacity="0.28"
        strokeWidth="2"
        strokeDasharray="0.1 6"
        strokeLinecap="round"
        fill="none"
      />
      <Paw x={158} y={11} rot={-100} />
      <Paw x={98} y={16} rot={-80} />
      {end === "bee" ? <Bee x={9} y={12} /> : <Flower x={8} y={13} r={3} petal="#fbcfe8" />}
    </svg>
  );
}

/** נבט קטן — "הראש" של פס ההתקדמות באלבום. */
export function SproutKnob({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svgProps}>
      <circle cx="12" cy="13" r="10" fill="#15803d" />
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path d="M12 17 V11" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />
      <Leaf len={7} w={3} fill="#22c55e" transform="translate(12 12) rotate(-150)" />
      <Leaf len={7} w={3} fill="#16a34a" transform="translate(12 11) rotate(-30)" />
    </svg>
  );
}

/** כוכב היעד בקצה פס ההתקדמות. */
export function GoalStar({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svgProps}>
      <path d={starPath(12, 12.5, 10)} fill="#eab308" transform="translate(0 1.5)" />
      <path d={starPath(12, 12.5, 10)} fill="#facc15" />
      <path d="M8.5 9.5 L11 8.8" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
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
