import type { JSX } from "react";

// דמויות חיות חמודות ומבריקות (סגנון "chibi" מבריק) בצבעי האפליקציה.
export interface Mascot {
  id: string;
  name: string;
  Face: (props: { size?: number }) => JSX.Element;
}

function Shadow() {
  return <ellipse cx="50" cy="92" rx="26" ry="5" fill="#000" opacity="0.12" />;
}

function Owl({ size = 78 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="owlBody" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </radialGradient>
        <radialGradient id="owlEye" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbeafe" />
        </radialGradient>
      </defs>
      <Shadow />
      {/* אוזני-נוצות */}
      <path d="M26 22 Q30 6 40 18 Z" fill="#15803d" />
      <path d="M74 22 Q70 6 60 18 Z" fill="#15803d" />
      {/* גוף */}
      <ellipse cx="50" cy="54" rx="35" ry="37" fill="url(#owlBody)" />
      {/* בטן בהירה */}
      <ellipse cx="50" cy="62" rx="24" ry="26" fill="#bbf7d0" opacity="0.65" />
      {/* הבהוב אור עליון */}
      <path d="M24 36 Q40 20 60 26" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* עיניים */}
      <circle cx="38" cy="48" r="15" fill="url(#owlEye)" stroke="#15803d" strokeWidth="2" />
      <circle cx="62" cy="48" r="15" fill="url(#owlEye)" stroke="#15803d" strokeWidth="2" />
      <circle cx="39" cy="49" r="7" fill="#1f2937" />
      <circle cx="61" cy="49" r="7" fill="#1f2937" />
      <circle cx="42" cy="46" r="2.6" fill="#fff" />
      <circle cx="64" cy="46" r="2.6" fill="#fff" />
      {/* מקור */}
      <path d="M50 56 Q45 63 50 66 Q55 63 50 56 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      {/* רגליים */}
      <path d="M40 89 l-3 6 M46 90 l-1 6 M54 90 l1 6 M60 89 l3 6" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Frog({ size = 78 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="frogBody" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#16a34a" />
        </radialGradient>
      </defs>
      <Shadow />
      {/* עיניים בולטות */}
      <circle cx="30" cy="26" r="16" fill="url(#frogBody)" stroke="#15803d" strokeWidth="2" />
      <circle cx="70" cy="26" r="16" fill="url(#frogBody)" stroke="#15803d" strokeWidth="2" />
      <circle cx="30" cy="24" r="9" fill="#fff" />
      <circle cx="70" cy="24" r="9" fill="#fff" />
      <circle cx="31" cy="25" r="4.5" fill="#1f2937" />
      <circle cx="71" cy="25" r="4.5" fill="#1f2937" />
      <circle cx="33" cy="22" r="1.8" fill="#fff" />
      <circle cx="73" cy="22" r="1.8" fill="#fff" />
      {/* גוף */}
      <ellipse cx="50" cy="60" rx="40" ry="33" fill="url(#frogBody)" />
      <ellipse cx="50" cy="66" rx="26" ry="22" fill="#dcfce7" opacity="0.6" />
      <path d="M18 48 Q35 34 55 40" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* חיוך */}
      <path d="M28 62 Q50 84 72 62" fill="none" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
      <circle cx="28" cy="66" r="5" fill="#fca5a5" opacity="0.7" />
      <circle cx="72" cy="66" r="5" fill="#fca5a5" opacity="0.7" />
    </svg>
  );
}

function Dino({ size = 78 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="dinoBody" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0d9488" />
        </radialGradient>
      </defs>
      <Shadow />
      {/* קוצים */}
      <path d="M36 16 l6 10 -12 0 Z M50 12 l6 12 -12 0 Z M64 16 l6 10 -12 0 Z" fill="#f59e0b" />
      {/* גוף/ראש */}
      <ellipse cx="50" cy="56" rx="36" ry="36" fill="url(#dinoBody)" />
      <ellipse cx="50" cy="64" rx="22" ry="22" fill="#ccfbf1" opacity="0.6" />
      <path d="M22 40 Q40 24 60 30" stroke="#fff" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* עיניים */}
      <circle cx="40" cy="50" r="10" fill="#fff" stroke="#0d9488" strokeWidth="2" />
      <circle cx="62" cy="50" r="10" fill="#fff" stroke="#0d9488" strokeWidth="2" />
      <circle cx="41" cy="51" r="4.5" fill="#1f2937" />
      <circle cx="63" cy="51" r="4.5" fill="#1f2937" />
      <circle cx="43" cy="49" r="1.6" fill="#fff" />
      <circle cx="65" cy="49" r="1.6" fill="#fff" />
      {/* חיוך + נחיריים */}
      <path d="M42 68 Q50 76 60 68" fill="none" stroke="#134e4a" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="47" cy="62" r="1.6" fill="#134e4a" />
      <circle cx="57" cy="62" r="1.6" fill="#134e4a" />
    </svg>
  );
}

function Bee({ size = 78 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="beeBody" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id="beeWing" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#a7f3d0" />
        </radialGradient>
      </defs>
      <Shadow />
      {/* מחושים */}
      <path d="M42 22 Q36 8 30 8" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 22 Q64 8 70 8" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="8" r="3.5" fill="#16a34a" />
      <circle cx="70" cy="8" r="3.5" fill="#16a34a" />
      {/* כנפיים */}
      <ellipse cx="22" cy="48" rx="16" ry="12" fill="url(#beeWing)" opacity="0.9" />
      <ellipse cx="78" cy="48" rx="16" ry="12" fill="url(#beeWing)" opacity="0.9" />
      {/* גוף */}
      <ellipse cx="50" cy="58" rx="31" ry="31" fill="url(#beeBody)" />
      <path d="M35 42 Q50 46 65 42 M31 60 Q50 66 69 60 M38 76 Q50 80 62 76" stroke="#78350f" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M26 44 Q42 32 60 38" stroke="#fff" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* עיניים */}
      <circle cx="42" cy="54" r="6" fill="#fff" />
      <circle cx="58" cy="54" r="6" fill="#fff" />
      <circle cx="43" cy="55" r="3" fill="#1f2937" />
      <circle cx="59" cy="55" r="3" fill="#1f2937" />
      <path d="M44 66 Q50 71 56 66" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export const MASCOTS: Mascot[] = [
  { id: "owl", name: "אלה הינשופה", Face: Owl },
  { id: "frog", name: "קורקי הצפרדע", Face: Frog },
  { id: "dino", name: "דינו הדינוזאור", Face: Dino },
  { id: "bee", name: "זוזי הדבורה", Face: Bee }
];

export function mascotById(id: string): Mascot {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
