import { Flower, Leaf, svgProps, type ArtProps } from "./HomeArt";

// הנוף של "הגינה של בּוֹטִי" — שכבות רקע / אמצע / חזית סביב ממשק מסך הבית.
// הכול דקורטיבי בלבד (aria-hidden, ובמסך עצמו pointer-events:none), SVG קל בלי תמונות.
// קנה-מידה משתנה בכוונה: פרטים זעירים, כמה בינוניים, ומעט גדולים בחזית.

// ---------- פרימיטיבים בוטניים ----------

function GrassTuft({ x, y, s = 1, fill = "#22c55e" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M-8 0 Q -7 -8 -9 -14 Q -4 -8 -3 0 Q -2 -11 0 -18 Q 2 -10 2 0 Q 4 -9 8 -13 Q 6 -6 7 0 Z"
      fill={fill}
    />
  );
}

function Tulip({ x, y, h = 20, color = "#fb7185" }: { x: number; y: number; h?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 0 Q -1 ${-h / 2} 0 ${-h}`} stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Leaf len={h * 0.55} w={h * 0.16} fill="#22c55e" transform={`translate(0 ${-h * 0.2}) rotate(-120)`} />
      <path d={`M-5 ${-h - 1} Q -5.5 ${-h - 9} -2.5 ${-h - 10} L 0 ${-h - 6} L 2.5 ${-h - 10} Q 5.5 ${-h - 9} 5 ${-h - 1} Q 0 ${-h + 3} -5 ${-h - 1} Z`} fill={color} />
      <path d={`M1.5 ${-h - 7} Q 3.5 ${-h - 6} 3.5 ${-h - 3}`} stroke="#fff" strokeOpacity="0.6" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Daisy({ x, y, r = 5, h = 14 }: { x: number; y: number; r?: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 0 Q 1 ${-h / 2} 0 ${-h}`} stroke="#16a34a" strokeWidth="1.8" fill="none" />
      <g transform={`translate(0 ${-h})`}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="0" cy={-r * 0.7} rx={r * 0.32} ry={r * 0.6} fill="#fff" transform={`rotate(${a})`} />
        ))}
        <circle r={r * 0.42} fill="#facc15" />
        <circle cx={r * 0.12} cy={-r * 0.12} r={r * 0.16} fill="#fde68a" />
      </g>
    </g>
  );
}

function Lavender({ x, y, h = 22 }: { x: number; y: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 0 Q 1 ${-h / 2} 0 ${-h}`} stroke="#16a34a" strokeWidth="1.6" fill="none" />
      {[0.55, 0.68, 0.8, 0.92, 1.03].map((t, i) => (
        <ellipse key={i} cx={i % 2 ? 1.6 : -1.6} cy={-h * t} rx="2.4" ry="3.2" fill={i % 2 ? "#a78bfa" : "#c4b5fd"} />
      ))}
    </g>
  );
}

function Rock({ x, y, w = 14 }: { x: number; y: number; w?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-1.5" cy="1" rx={w * 0.62} ry={w * 0.18} fill="#14532d" fillOpacity="0.12" />
      <path d={`M${-w / 2} 0 Q ${-w / 2} ${-w * 0.55} ${-w * 0.05} ${-w * 0.6} Q ${w / 2} ${-w * 0.55} ${w / 2} 0 Z`} fill="#d6d3d1" />
      <path d={`M${-w * 0.05} ${-w * 0.52} Q ${w * 0.35} ${-w * 0.48} ${w * 0.4} ${-w * 0.15}`} stroke="#f5f5f4" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-16" cy="-12" r="14" fill="#16a34a" />
      <circle cx="4" cy="-20" r="18" fill="#22c55e" />
      <circle cx="22" cy="-10" r="12" fill="#16a34a" />
      <path d="M-30 0 H 34 Q 30 -6 20 -4 Z" fill="#15803d" />
      <circle cx="10" cy="-28" r="6" fill="#4ade80" />
      <circle cx="26" cy="-15" r="3.6" fill="#4ade80" />
      <circle cx="-8" cy="-20" r="3" fill="#4ade80" fillOpacity="0.8" />
    </g>
  );
}

export function Ladybug({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <circle cx="0" cy="-5" r="2.3" fill="#1f2937" />
      <circle cx="0" cy="0.5" r="5" fill="#ef4444" />
      <path d="M0 -4.5 V5.5" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="-2.4" cy="-0.5" r="1" fill="#1f2937" />
      <circle cx="2.4" cy="1.5" r="1" fill="#1f2937" />
      <circle cx="-1.8" cy="3" r="0.8" fill="#1f2937" />
      <circle cx="1.8" cy="-2.2" r="0.8" fill="#fff" fillOpacity="0.7" />
    </g>
  );
}

function Paw({ x, y, rot = 0, o = 0.2 }: { x: number; y: number; rot?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} fill="#92400e" fillOpacity={o}>
      <ellipse cx="0" cy="2.2" rx="3.4" ry="2.9" />
      <ellipse cx="-3.8" cy="-2" rx="1.35" ry="1.6" />
      <ellipse cx="-1.3" cy="-3.9" rx="1.35" ry="1.6" />
      <ellipse cx="1.3" cy="-3.9" rx="1.35" ry="1.6" />
      <ellipse cx="3.8" cy="-2" rx="1.35" ry="1.6" />
    </g>
  );
}

function Bee({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="bee-wings">
        <ellipse cx="-1.5" cy="-4.2" rx="3" ry="2.2" fill="#fff" stroke="#bae6fd" strokeWidth="0.8" />
        <ellipse cx="2" cy="-4.4" rx="2.6" ry="2" fill="#fff" stroke="#bae6fd" strokeWidth="0.8" />
      </g>
      <ellipse cx="0" cy="0" rx="5" ry="3.6" fill="#facc15" />
      <rect x="-1.6" y="-3.5" width="1.6" height="7" rx="0.8" fill="#14532d" fillOpacity="0.7" />
      <rect x="1.4" y="-3.2" width="1.4" height="6.4" rx="0.7" fill="#14532d" fillOpacity="0.7" />
      <circle cx="-4.2" cy="-0.6" r="0.7" fill="#14532d" />
    </g>
  );
}

// ---------- הגיבור: קרחת גינה קטנה סביב הכלבלב ----------

/** רקע רחוק: גבעה חיוורת ושני עצים עגולים מרוחקים. */
export function HeroBackdrop({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice" className={className} {...svgProps}>
      <path d="M0 78 Q 70 40 170 56 Q 280 72 400 40 L 400 110 L 0 110 Z" fill="#dcfce7" />
      <g opacity="0.9">
        <rect x="38" y="46" width="5" height="26" rx="2" fill="#e3d3b0" />
        <circle cx="40" cy="38" r="15" fill="#c6f0d3" />
        <circle cx="28" cy="47" r="10" fill="#c6f0d3" />
        <circle cx="53" cy="47" r="11" fill="#bdebcb" />
        <circle cx="45" cy="31" r="5" fill="#dcfce7" />
      </g>
      <g opacity="0.85">
        <rect x="355" y="30" width="4" height="22" rx="2" fill="#e3d3b0" />
        <circle cx="357" cy="24" r="12" fill="#c6f0d3" />
        <circle cx="347" cy="31" r="8" fill="#bdebcb" />
        <circle cx="368" cy="31" r="8.5" fill="#c6f0d3" />
      </g>
    </svg>
  );
}

/** אמצע, צד שמאל: שיח, צבעונים, לבנדר, סלע ועשב. */
export function HeroGardenLeft({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 130 84" className={className} {...svgProps}>
      <Bush x={40} y={78} s={0.95} />
      <Tulip x={80} y={80} h={22} color="#fb7185" />
      <Tulip x={91} y={82} h={17} color="#f472b6" />
      <Lavender x={104} y={82} h={24} />
      <Lavender x={110} y={83} h={18} />
      <Rock x={66} y={83} w={15} />
      <GrassTuft x={20} y={84} s={0.9} fill="#16a34a" />
      <GrassTuft x={96} y={84} s={0.7} />
      <Flower x={12} y={70} r={2.6} petal="#fde68a" heart="#fb923c" />
    </svg>
  );
}

/** אמצע, צד ימין: מרגניות, שיח קטן, ניצנים וסלע. */
export function HeroGardenRight({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 110 84" className={className} {...svgProps}>
      <Bush x={78} y={80} s={0.7} />
      <Daisy x={30} y={83} r={6} h={20} />
      <Daisy x={42} y={84} r={5} h={14} />
      <Daisy x={98} y={84} r={4.6} h={16} />
      <Rock x={58} y={84} w={12} />
      <GrassTuft x={16} y={84} s={0.8} />
      <GrassTuft x={70} y={84} s={0.6} fill="#16a34a" />
      <ellipse cx="22" cy="60" rx="2" ry="3" fill="#f9a8d4" />
    </svg>
  );
}

/** עלה גדול שנכנס מהשוליים ומציץ מאחורי כפתור הצילום. */
export function EdgeLeaf({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 90 80" className={className} {...svgProps}>
      <Leaf len={78} w={22} fill="#4ade80" vein="#bbf7d0" transform="translate(0 70) rotate(-35)" />
      <Leaf len={58} w={17} fill="#22c55e" vein="#86efac" transform="translate(0 78) rotate(-8)" />
    </svg>
  );
}

/** פרפר — כנפיים מתנופפות מדי פעם (לא ברצף). */
export function Butterfly({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 34 30" className={className} {...svgProps}>
      <g className="butterfly-wings">
        <path d="M17 15 C 8 2, 1 6, 4 13 C 1 19, 8 24, 17 16 Z" fill="#c4b5fd" />
        <path d="M17 15 C 26 2, 33 6, 30 13 C 33 19, 26 24, 17 16 Z" fill="#f9a8d4" />
        <circle cx="8" cy="10" r="2" fill="#fff" fillOpacity="0.7" />
        <circle cx="26" cy="10" r="2" fill="#fff" fillOpacity="0.7" />
      </g>
      <ellipse cx="17" cy="16" rx="1.6" ry="6" fill="#14532d" fillOpacity="0.75" />
      <path d="M16.5 10 Q 14 5 12 4 M17.5 10 Q 20 5 22 4" stroke="#14532d" strokeOpacity="0.6" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

// ---------- שביל בּוֹטִי: מקטעים קצרים בלבד ----------

/** טביעות כפות שהולכות (RTL — מימין לשמאל) עם מקטע שביל קצר ועלה זעיר. */
export function PawTrail({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 110 36" className={className} {...svgProps}>
      <path d="M104 26 C 90 30, 80 18, 66 22" stroke="#92400e" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="0.1 5.5" strokeLinecap="round" fill="none" />
      <Paw x={56} y={18} rot={-100} o={0.22} />
      <Paw x={40} y={26} rot={-80} o={0.18} />
      <Paw x={24} y={16} rot={-100} o={0.14} />
      <Leaf len={9} w={3.4} fill="#86efac" transform="translate(8 28) rotate(-30)" />
    </svg>
  );
}

/** דבורה קטנה שמסיימת לולאת מעוף קצרה, ליד פרח זעיר. */
export function BeeTrail({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 110 36" className={className} {...svgProps}>
      <path d="M104 24 C 86 30, 76 8, 62 16 C 54 21, 58 28, 48 24" stroke="#ca8a04" strokeOpacity="0.28" strokeWidth="1.6" strokeDasharray="0.1 5" strokeLinecap="round" fill="none" />
      <g className="bee-hover">
        <Bee x={36} y={18} s={1.15} />
      </g>
      <Daisy x={14} y={34} r={4} h={10} />
      <GrassTuft x={22} y={36} s={0.45} />
    </svg>
  );
}

// ---------- פרטים בין האזורים ----------

/** שרך בינוני שנכנס מקצה המסך (שכבת אמצע — מאחורי הכרטיסים). */
export function EdgeFern({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 70 110" className={className} {...svgProps}>
      <path d="M66 108 C 50 80, 40 50, 44 8" stroke="#16a34a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {[96, 84, 72, 60, 48, 36, 24, 14].map((y, i) => {
        const x = 44 + (y / 108) * 18 - (i > 5 ? 2 : 0);
        const l = 10 + (y / 108) * 16;
        return (
          <g key={y}>
            <Leaf len={l} w={l * 0.32} fill={i % 2 ? "#4ade80" : "#22c55e"} transform={`translate(${x} ${y}) rotate(-160)`} />
            <Leaf len={l * 0.8} w={l * 0.28} fill={i % 2 ? "#22c55e" : "#86efac"} transform={`translate(${x} ${y}) rotate(-35)`} />
          </g>
        );
      })}
    </svg>
  );
}

/** אבן קטנה עם פרח בר — פרט חזית זעיר. */
export function StoneBloom({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 60 40" className={className} {...svgProps}>
      <Rock x={24} y={38} w={24} />
      <GrassTuft x={42} y={40} s={0.8} />
      <Daisy x={46} y={39} r={4.4} h={16} />
      <GrassTuft x={8} y={40} s={0.55} fill="#16a34a" />
    </svg>
  );
}

/** עלה גדול בחזית שנכנס מצד המסך (מאחורי האריחים). */
export function EdgeLeafLarge({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 80 110" className={className} {...svgProps}>
      <Leaf len={96} w={24} fill="#86efac" vein="#dcfce7" transform="translate(0 104) rotate(-62)" />
      <Leaf len={64} w={18} fill="#4ade80" vein="#bbf7d0" transform="translate(0 108) rotate(-30)" />
    </svg>
  );
}

/** עלים וניצן מאחורי תווית הכותרת. */
export function MarkerLeaves({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 36 30" className={className} {...svgProps}>
      <path d="M6 26 Q 14 20 24 10" stroke="#a16207" strokeOpacity="0.55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Leaf len={17} w={6} fill="#22c55e" transform="translate(10 24) rotate(-120)" />
      <Leaf len={17} w={6} fill="#4ade80" transform="translate(14 21) rotate(-25)" />
      <ellipse cx="26" cy="8" rx="3" ry="4.2" fill="#f9a8d4" transform="rotate(35 26 8)" />
      <path d="M24 12 L 26 10" stroke="#16a34a" strokeWidth="1.4" />
    </svg>
  );
}

// ---------- תחתית: הגינה ממשיכה מעבר למסך ----------

/** עשב, פרחים, קטע גדר, סלע, חיפושית וטביעות כפות שיוצאות מהמסך. */
export function GardenFloor({ className }: ArtProps) {
  return (
    <svg viewBox="0 42 400 58" preserveAspectRatio="xMidYMax slice" className={className} {...svgProps}>
      <path d="M0 70 Q 90 52 200 62 Q 310 72 400 56 L 400 100 L 0 100 Z" fill="#dcfce7" />
      <path d="M0 84 Q 110 70 220 80 Q 320 88 400 76 L 400 100 L 0 100 Z" fill="#bbf7d0" />
      {/* קטע גדר */}
      <g transform="translate(22 56)">
        <rect x="0" y="0" width="7" height="34" rx="3" fill="#e9c98f" />
        <rect x="22" y="4" width="7" height="30" rx="3" fill="#e9c98f" />
        <rect x="44" y="8" width="7" height="26" rx="3" fill="#e9c98f" />
        <rect x="-4" y="12" width="60" height="5" rx="2.5" fill="#d9b577" />
        <rect x="-4" y="22" width="60" height="5" rx="2.5" fill="#d9b577" />
        <path d="M1 3 L 5 2" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <Tulip x={98} y={86} h={20} color="#fb7185" />
      <Daisy x={112} y={88} r={5} h={16} />
      <GrassTuft x={86} y={90} s={1} />
      <GrassTuft x={140} y={88} s={0.8} fill="#16a34a" />
      <Paw x={196} y={80} rot={-100} o={0.16} />
      <Paw x={214} y={86} rot={-80} o={0.13} />
      <Lavender x={262} y={88} h={22} />
      <Lavender x={270} y={89} h={17} />
      <Rock x={300} y={88} w={20} />
      <Ladybug x={300} y={73} rot={20} s={0.9} />
      <GrassTuft x={328} y={90} s={1.1} />
      <Tulip x={352} y={88} h={18} color="#f472b6" />
      <Daisy x={370} y={90} r={4.4} h={12} />
      <GrassTuft x={388} y={92} s={0.8} fill="#16a34a" />
    </svg>
  );
}
