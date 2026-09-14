import { useId, type JSX } from "react";

// דמויות חיות חמודות ומבריקות (סגנון "chibi" מבריק) בצבעי האפליקציה.
export interface Mascot {
  id: string;
  name: string;
  /** דמות מצוירת ב-SVG (ברירת מחדל). */
  Face?: (props: { size?: number }) => JSX.Element;
  /** לחלופין: נתיב לתמונה (למשל "/mascots/lion.png") — גובר על Face. */
  image?: string;
}

/** מציג דמות — תמונה אם הוגדרה, אחרת האיור המובנה. */
export function MascotView({ mascot, size = 78 }: { mascot: Mascot; size?: number }) {
  if (mascot.image) {
    return (
      <img
        src={mascot.image}
        alt={mascot.name}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
        className="drop-shadow"
      />
    );
  }
  if (mascot.Face) return <mascot.Face size={size} />;
  return <span style={{ fontSize: size * 0.7 }}>🐾</span>;
}

function Shadow() {
  return <ellipse cx="50" cy="92" rx="26" ry="5" fill="#000" opacity="0.12" />;
}

function Owl({ size = 78 }: { size?: number }) {
  const u = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${u}b`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </radialGradient>
        <radialGradient id={`${u}e`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbeafe" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M26 22 Q30 6 40 18 Z" fill="#15803d" />
      <path d="M74 22 Q70 6 60 18 Z" fill="#15803d" />
      <ellipse cx="50" cy="54" rx="35" ry="37" fill={`url(#${u}b)`} />
      <ellipse cx="50" cy="62" rx="24" ry="26" fill="#bbf7d0" opacity="0.65" />
      <path d="M24 36 Q40 20 60 26" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      <circle cx="38" cy="48" r="15" fill={`url(#${u}e)`} stroke="#15803d" strokeWidth="2" />
      <circle cx="62" cy="48" r="15" fill={`url(#${u}e)`} stroke="#15803d" strokeWidth="2" />
      <circle cx="39" cy="49" r="7" fill="#1f2937" />
      <circle cx="61" cy="49" r="7" fill="#1f2937" />
      <circle cx="42" cy="46" r="2.6" fill="#fff" />
      <circle cx="64" cy="46" r="2.6" fill="#fff" />
      <path d="M50 56 Q45 63 50 66 Q55 63 50 56 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <path d="M40 89 l-3 6 M46 90 l-1 6 M54 90 l1 6 M60 89 l3 6" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Frog({ size = 78 }: { size?: number }) {
  const u = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${u}b`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#16a34a" />
        </radialGradient>
      </defs>
      <Shadow />
      <circle cx="30" cy="26" r="16" fill={`url(#${u}b)`} stroke="#15803d" strokeWidth="2" />
      <circle cx="70" cy="26" r="16" fill={`url(#${u}b)`} stroke="#15803d" strokeWidth="2" />
      <circle cx="30" cy="24" r="9" fill="#fff" />
      <circle cx="70" cy="24" r="9" fill="#fff" />
      <circle cx="31" cy="25" r="4.5" fill="#1f2937" />
      <circle cx="71" cy="25" r="4.5" fill="#1f2937" />
      <circle cx="33" cy="22" r="1.8" fill="#fff" />
      <circle cx="73" cy="22" r="1.8" fill="#fff" />
      <ellipse cx="50" cy="60" rx="40" ry="33" fill={`url(#${u}b)`} />
      <ellipse cx="50" cy="66" rx="26" ry="22" fill="#dcfce7" opacity="0.6" />
      <path d="M18 48 Q35 34 55 40" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M28 62 Q50 84 72 62" fill="none" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
      <circle cx="28" cy="66" r="5" fill="#fca5a5" opacity="0.7" />
      <circle cx="72" cy="66" r="5" fill="#fca5a5" opacity="0.7" />
    </svg>
  );
}

function Dino({ size = 78 }: { size?: number }) {
  const u = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${u}b`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0d9488" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M36 16 l6 10 -12 0 Z M50 12 l6 12 -12 0 Z M64 16 l6 10 -12 0 Z" fill="#f59e0b" />
      <ellipse cx="50" cy="56" rx="36" ry="36" fill={`url(#${u}b)`} />
      <ellipse cx="50" cy="64" rx="22" ry="22" fill="#ccfbf1" opacity="0.6" />
      <path d="M22 40 Q40 24 60 30" stroke="#fff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      <circle cx="40" cy="50" r="10" fill="#fff" stroke="#0d9488" strokeWidth="2" />
      <circle cx="62" cy="50" r="10" fill="#fff" stroke="#0d9488" strokeWidth="2" />
      <circle cx="41" cy="51" r="4.5" fill="#1f2937" />
      <circle cx="63" cy="51" r="4.5" fill="#1f2937" />
      <circle cx="43" cy="49" r="1.6" fill="#fff" />
      <circle cx="65" cy="49" r="1.6" fill="#fff" />
      <path d="M42 68 Q50 76 60 68" fill="none" stroke="#134e4a" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="47" cy="62" r="1.6" fill="#134e4a" />
      <circle cx="57" cy="62" r="1.6" fill="#134e4a" />
    </svg>
  );
}

function Bee({ size = 78 }: { size?: number }) {
  const u = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${u}b`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id={`${u}w`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#a7f3d0" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M42 22 Q36 8 30 8" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 22 Q64 8 70 8" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="8" r="3.5" fill="#16a34a" />
      <circle cx="70" cy="8" r="3.5" fill="#16a34a" />
      <ellipse cx="22" cy="48" rx="16" ry="12" fill={`url(#${u}w)`} opacity="0.9" />
      <ellipse cx="78" cy="48" rx="16" ry="12" fill={`url(#${u}w)`} opacity="0.9" />
      <ellipse cx="50" cy="58" rx="31" ry="31" fill={`url(#${u}b)`} />
      <path d="M35 42 Q50 46 65 42 M31 60 Q50 66 69 60 M38 76 Q50 80 62 76" stroke="#78350f" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M26 44 Q42 32 60 38" stroke="#fff" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
      <circle cx="42" cy="54" r="6" fill="#fff" />
      <circle cx="58" cy="54" r="6" fill="#fff" />
      <circle cx="43" cy="55" r="3" fill="#1f2937" />
      <circle cx="59" cy="55" r="3" fill="#1f2937" />
      <path d="M44 66 Q50 71 56 66" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Bear({ size = 78 }: { size?: number }) {
  const u = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${u}f`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#c89b6a" />
          <stop offset="1" stopColor="#8a5a2b" />
        </radialGradient>
      </defs>
      <Shadow />
      {/* אוזניים */}
      <circle cx="28" cy="30" r="12" fill="#8a5a2b" />
      <circle cx="72" cy="30" r="12" fill="#8a5a2b" />
      <circle cx="28" cy="30" r="6" fill="#c89b6a" />
      <circle cx="72" cy="30" r="6" fill="#c89b6a" />
      {/* ראש */}
      <circle cx="50" cy="56" r="33" fill={`url(#${u}f)`} />
      <path d="M26 44 Q42 30 58 36" stroke="#fff" strokeWidth="4" fill="none" opacity="0.3" strokeLinecap="round" />
      {/* חוטם */}
      <ellipse cx="50" cy="66" rx="18" ry="15" fill="#f0dcc0" />
      {/* עיניים */}
      <circle cx="40" cy="52" r="5.5" fill="#1f2937" />
      <circle cx="60" cy="52" r="5.5" fill="#1f2937" />
      <circle cx="42" cy="50" r="1.6" fill="#fff" />
      <circle cx="62" cy="50" r="1.6" fill="#fff" />
      {/* אף וחיוך */}
      <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#4a2f18" />
      <path d="M50 66 v3 M50 69 q-5 3 -9 0 M50 69 q5 3 9 0" stroke="#4a2f18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export const MASCOTS: Mascot[] = [
  { id: "lion", name: "לאון גור האריה", image: "/mascots/lion.png" },
  { id: "fawn", name: "עופרי", image: "/mascots/fawn.png" },
  { id: "puppy", name: "רקסי הכלבלב", image: "/mascots/puppy.png" },
  { id: "bear", name: "דובי", Face: Bear },
  { id: "owl", name: "אלה הינשופה", Face: Owl },
  { id: "frog", name: "קורקי הצפרדע", Face: Frog },
  { id: "dino", name: "דינו הדינוזאור", Face: Dino },
  { id: "bee", name: "זוזי הדבורה", Face: Bee }
];

export function mascotById(id: string): Mascot {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
