import type { JSX } from "react";

// דמויות חיות חמודות בצבעי האפליקציה (ירוקים + נגיעות שמש/שמיים).
export interface Mascot {
  id: string;
  name: string;
  Face: (props: { size?: number }) => JSX.Element;
}

function Owl({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M28 20 L38 34 L22 34 Z" fill="#15803d" />
      <path d="M72 20 L78 34 L62 34 Z" fill="#15803d" />
      <ellipse cx="50" cy="56" rx="34" ry="36" fill="#22c55e" />
      <ellipse cx="50" cy="56" rx="34" ry="36" fill="none" stroke="#15803d" strokeWidth="3" />
      <path d="M20 52 Q50 70 80 52 L80 78 Q50 92 20 78 Z" fill="#4ade80" opacity="0.6" />
      <circle cx="38" cy="50" r="14" fill="#fff" />
      <circle cx="62" cy="50" r="14" fill="#fff" />
      <circle cx="38" cy="51" r="6.5" fill="#14532d" />
      <circle cx="62" cy="51" r="6.5" fill="#14532d" />
      <circle cx="40" cy="49" r="2" fill="#fff" />
      <circle cx="64" cy="49" r="2" fill="#fff" />
      <path d="M50 58 L45 66 L55 66 Z" fill="#f59e0b" />
      <path d="M34 84 L30 92 M44 88 L42 96 M56 88 L58 96 M66 84 L70 92" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Frog({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="30" cy="30" r="14" fill="#22c55e" />
      <circle cx="70" cy="30" r="14" fill="#22c55e" />
      <circle cx="30" cy="28" r="8" fill="#fff" />
      <circle cx="70" cy="28" r="8" fill="#fff" />
      <circle cx="31" cy="29" r="3.5" fill="#14532d" />
      <circle cx="71" cy="29" r="3.5" fill="#14532d" />
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="#22c55e" />
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="none" stroke="#15803d" strokeWidth="3" />
      <path d="M30 62 Q50 82 70 62" fill="none" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
      <circle cx="30" cy="66" r="5" fill="#86efac" />
      <circle cx="70" cy="66" r="5" fill="#86efac" />
      <circle cx="34" cy="70" r="4" fill="#fca5a5" opacity="0.7" />
      <circle cx="66" cy="70" r="4" fill="#fca5a5" opacity="0.7" />
    </svg>
  );
}

function Turtle({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="52" cy="60" rx="40" ry="30" fill="#16a34a" />
      <ellipse cx="52" cy="60" rx="40" ry="30" fill="none" stroke="#15803d" strokeWidth="3" />
      <path d="M52 34 L36 60 L52 60 Z M52 34 L68 60 L52 60 Z M30 46 L36 60 L22 62 Z M74 46 L68 60 L82 62 Z" fill="#4ade80" opacity="0.7" />
      <circle cx="16" cy="50" r="16" fill="#34d399" />
      <circle cx="12" cy="46" r="4" fill="#fff" />
      <circle cx="11" cy="46" r="2" fill="#14532d" />
      <path d="M6 56 Q12 60 18 56" fill="none" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="52" r="3" fill="#fca5a5" opacity="0.7" />
    </svg>
  );
}

function Bee({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <line x1="42" y1="20" x2="38" y2="10" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="20" x2="62" y2="10" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="38" cy="9" r="3" fill="#16a34a" />
      <circle cx="62" cy="9" r="3" fill="#16a34a" />
      <ellipse cx="24" cy="52" rx="16" ry="12" fill="#bbf7d0" opacity="0.9" />
      <ellipse cx="76" cy="52" rx="16" ry="12" fill="#bbf7d0" opacity="0.9" />
      <ellipse cx="50" cy="58" rx="30" ry="30" fill="#facc15" />
      <ellipse cx="50" cy="58" rx="30" ry="30" fill="none" stroke="#a16207" strokeWidth="3" />
      <path d="M38 40 Q50 44 62 40 M34 58 Q50 64 66 58 M40 76 Q50 80 60 76" stroke="#a16207" strokeWidth="6" fill="none" />
      <circle cx="42" cy="52" r="5" fill="#fff" />
      <circle cx="58" cy="52" r="5" fill="#fff" />
      <circle cx="42" cy="53" r="2.5" fill="#14532d" />
      <circle cx="58" cy="53" r="2.5" fill="#14532d" />
      <path d="M44 64 Q50 68 56 64" fill="none" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export const MASCOTS: Mascot[] = [
  { id: "owl", name: "אלה הינשופה", Face: Owl },
  { id: "frog", name: "קורקי הצפרדע", Face: Frog },
  { id: "turtle", name: "טובי הצב", Face: Turtle },
  { id: "bee", name: "זוזי הדבורה", Face: Bee }
];

export function mascotById(id: string): Mascot {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
