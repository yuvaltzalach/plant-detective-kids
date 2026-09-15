import { useEffect, useId, useState, type JSX } from "react";

// דמויות חיות חמודות בצבעי האפליקציה.
// יש שני סוגים:
//  1. דמויות וקטוריות *מונפשות* (Anim) — כל חלק זז בנפרד (יד מנפנפת, זנב מכשכש,
//     עיניים ממצמצות, אוזניים מתנדנדות) בעזרת SVG SMIL.
//  2. דמויות תמונה (image) שהמשתמש יצר, ודמויות SVG סטטיות ישנות (Face).
export interface Mascot {
  id: string;
  name: string;
  /** דמות וקטורית מונפשת (עדיפות עליונה). */
  Anim?: (props: { size?: number }) => JSX.Element;
  /** דמות מצוירת סטטית ב-SVG. */
  Face?: (props: { size?: number }) => JSX.Element;
  /** נתיב לתמונה (למשל "/mascots/lion.png"). */
  image?: string;
  /** פריים "עיניים עצומות" — יחד עם image יוצר מצמוץ אמיתי (ספרייט). */
  blink?: string;
  /** פריים "יד מורמת" — יחד עם image יוצר נפנוף. */
  wave?: string;
}

type FrameName = "base" | "blink" | "wave";

/**
 * נגן פריימים לתמונות: הדמות עומדת במקום, וכל כמה שניות מפעילה אנימציה
 * מתוזמנת — מצמוץ (base→blink→base) או נפנוף (החלפות base↔wave). בלי ריחוף.
 */
function FrameMascot({
  base,
  blink,
  wave,
  name,
  size
}: {
  base: string;
  blink?: string;
  wave?: string;
  name: string;
  size: number;
}) {
  const [frame, setFrame] = useState<FrameName>("base");
  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => alive && fn(), ms));
    };
    // מריץ רצף פריימים ואז חוזר ל-base וקורא ל-done.
    const runClip = (steps: Array<[FrameName, number]>, done: () => void) => {
      let acc = 0;
      for (const [f, ms] of steps) {
        at(acc, () => setFrame(f));
        acc += ms;
      }
      at(acc, () => {
        setFrame("base");
        done();
      });
    };
    const loop = () => {
      at(2600 + Math.random() * 3200, () => {
        if (wave && Math.random() < 0.45) {
          // נפנוף טבעי: מרים את היד ומחזיק, נדנוד איטי, ומוריד.
          runClip(
            [
              ["wave", 700],
              ["base", 320],
              ["wave", 700]
            ],
            loop
          );
        } else if (blink) {
          const steps: Array<[FrameName, number]> =
            Math.random() < 0.25
              ? [["blink", 150], ["base", 120], ["blink", 150]]
              : [["blink", 160]];
          runClip(steps, loop);
        } else {
          loop();
        }
      });
    };
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [base, blink, wave]);

  const layer = (src: string, name: FrameName, alt: string) => (
    <img
      key={name}
      src={src}
      alt={alt}
      aria-hidden={name === "base" ? undefined : true}
      width={size}
      height={size}
      style={{
        position: "absolute",
        inset: 0,
        objectFit: "contain",
        opacity: frame === name ? 1 : 0
      }}
      className="drop-shadow"
    />
  );

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {layer(base, "base", name)}
      {blink && layer(blink, "blink", "")}
      {wave && layer(wave, "wave", "")}
    </div>
  );
}

/** מציג דמות — מונפשת אם יש, אחרת תמונה, אחרת איור סטטי. */
export function MascotView({ mascot, size = 78 }: { mascot: Mascot; size?: number }) {
  if (mascot.Anim) return <mascot.Anim size={size} />;
  if (mascot.image && (mascot.blink || mascot.wave)) {
    return (
      <FrameMascot
        base={mascot.image}
        blink={mascot.blink}
        wave={mascot.wave}
        name={mascot.name}
        size={size}
      />
    );
  }
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

// ===================== דמויות וקטוריות מונפשות =====================

interface Pal {
  furA: string; // גרדיאנט פרווה — בהיר
  furB: string; // גרדיאנט פרווה — כהה (וגם אוזניים/זנב)
  furDark: string; // הדגשות כהות (אוזניים תלויות וכו')
  belly: string; // בטן/כפות/חוטם בהיר
  muzzle: string; // אזור הפה
  nose: string; // אף
  inner: string; // פנים אוזן / ורוד
}

interface AnimalSpec {
  id: string;
  name: string;
  pal: Pal;
  ears: (p: Pal) => JSX.Element;
  mane?: boolean;
  spots?: boolean;
}

function Mane({ color, ring }: { color: string; ring: string }) {
  const n = 13;
  const R = 40;
  const tufts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [60 + Math.cos(a) * R, 44 + Math.sin(a) * R] as const;
  });
  return (
    <g>
      {tufts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="11" fill={color} />
      ))}
      <circle cx="60" cy="44" r="36" fill={ring} />
    </g>
  );
}

/** שלד מונפש משותף — נבנה מחלקים שכל אחד זז לבד. */
function AnimatedAnimal({ spec, size = 78 }: { spec: AnimalSpec; size?: number }) {
  const u = useId();
  const g = `${u}-fur`;
  const p = spec.pal;
  const blink = (cx: number) => (
    <ellipse cx={cx} cy="44" rx="7" ry="8" fill={p.furB}>
      <animate
        attributeName="ry"
        values="0;0;8;0;0"
        keyTimes="0;0.9;0.94;0.98;1"
        dur="4.2s"
        repeatCount="indefinite"
      />
    </ellipse>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="overflow-visible">
      <defs>
        <radialGradient id={g} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor={p.furA} />
          <stop offset="1" stopColor={p.furB} />
        </radialGradient>
      </defs>

      {/* צל */}
      <ellipse cx="60" cy="114" rx="34" ry="5" fill="#000" opacity="0.12" />

      {/* זנב מכשכש */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-9 40 100;12 40 100;-9 40 100"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
          dur="1.1s"
          repeatCount="indefinite"
        />
        <path d="M40 100 Q12 96 15 70 Q24 84 42 92 Z" fill={p.furB} />
      </g>

      {/* יד שמאל במנוחה */}
      <line x1="38" y1="82" x2="31" y2="103" stroke={p.furB} strokeWidth="13" strokeLinecap="round" />
      <circle cx="30" cy="104" r="7.5" fill={`url(#${g})`} />

      {/* גוף */}
      <ellipse cx="60" cy="88" rx="32" ry="30" fill={`url(#${g})`} />
      <ellipse cx="60" cy="95" rx="20" ry="18" fill={p.belly} opacity="0.85" />

      {/* כפות רגליים */}
      <ellipse cx="46" cy="112" rx="11" ry="7.5" fill={`url(#${g})`} />
      <ellipse cx="74" cy="112" rx="11" ry="7.5" fill={`url(#${g})`} />
      <ellipse cx="46" cy="113" rx="6" ry="4" fill={p.belly} opacity="0.7" />
      <ellipse cx="74" cy="113" rx="6" ry="4" fill={p.belly} opacity="0.7" />

      {/* נקודות (עופר) */}
      {spec.spots && (
        <g fill={p.belly} opacity="0.8">
          <circle cx="52" cy="82" r="2.5" />
          <circle cx="66" cy="86" r="2.5" />
          <circle cx="58" cy="96" r="2.5" />
          <circle cx="72" cy="94" r="2.5" />
        </g>
      )}

      {/* רעמה (אריה) — לפני היד כדי שהנפנוף יופיע מעליה */}
      {spec.mane && <Mane color={p.furB} ring={p.furDark} />}

      {/* יד ימין מנפנפת */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-6 82 80;18 82 80;-6 82 80"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
          dur="0.85s"
          repeatCount="indefinite"
        />
        <line x1="82" y1="80" x2="96" y2="54" stroke={p.furB} strokeWidth="13" strokeLinecap="round" />
        <circle cx="97" cy="52" r="8.5" fill={`url(#${g})`} />
        <circle cx="97" cy="53" r="4" fill={p.belly} opacity="0.7" />
      </g>

      {/* אוזניים מתנדנדות */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-2.5 60 34;2.5 60 34;-2.5 60 34"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
          dur="3.1s"
          repeatCount="indefinite"
        />
        {spec.ears(p)}
      </g>

      {/* ראש */}
      <circle cx="60" cy="44" r="32" fill={`url(#${g})`} />
      <path d="M36 30 Q52 16 72 22" stroke="#fff" strokeWidth="4" fill="none" opacity="0.3" strokeLinecap="round" />

      {/* חוטם + לחיים */}
      <ellipse cx="60" cy="52" rx="17" ry="14" fill={p.muzzle} />
      <circle cx="42" cy="53" r="5" fill="#fb7185" opacity="0.4" />
      <circle cx="78" cy="53" r="5" fill="#fb7185" opacity="0.4" />

      {/* עיניים + מצמוץ */}
      <g>
        <ellipse cx="49" cy="44" rx="6.5" ry="8" fill="#1f2937" />
        <ellipse cx="71" cy="44" rx="6.5" ry="8" fill="#1f2937" />
        <circle cx="51" cy="41" r="2.2" fill="#fff" />
        <circle cx="73" cy="41" r="2.2" fill="#fff" />
        {blink(49)}
        {blink(71)}
      </g>

      {/* אף + פה */}
      <ellipse cx="60" cy="50" rx="4.5" ry="3.5" fill={p.nose} />
      <path
        d="M60 53 v3 M60 56 q-5 4 -9 1 M60 56 q5 4 9 1"
        stroke={p.nose}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- אוזניים לכל חיה ----
const earLion = (p: Pal) => (
  <>
    <circle cx="36" cy="20" r="11" fill={p.furB} />
    <circle cx="84" cy="20" r="11" fill={p.furB} />
    <circle cx="36" cy="20" r="6" fill={p.inner} />
    <circle cx="84" cy="20" r="6" fill={p.inner} />
  </>
);
const earPuppy = (p: Pal) => (
  <>
    <ellipse cx="27" cy="50" rx="12" ry="24" fill={p.furDark} transform="rotate(16 27 50)" />
    <ellipse cx="93" cy="50" rx="12" ry="24" fill={p.furDark} transform="rotate(-16 93 50)" />
  </>
);
const earFawn = (p: Pal) => (
  <>
    <ellipse cx="30" cy="16" rx="9" ry="17" fill={p.furB} transform="rotate(-24 30 16)" />
    <ellipse cx="90" cy="16" rx="9" ry="17" fill={p.furB} transform="rotate(24 90 16)" />
    <ellipse cx="31" cy="17" rx="4" ry="10" fill={p.inner} transform="rotate(-24 31 17)" />
    <ellipse cx="89" cy="17" rx="4" ry="10" fill={p.inner} transform="rotate(24 89 17)" />
  </>
);
const earBear = (p: Pal) => (
  <>
    <circle cx="35" cy="18" r="13" fill={p.furB} />
    <circle cx="85" cy="18" r="13" fill={p.furB} />
    <circle cx="35" cy="18" r="7" fill={p.inner} />
    <circle cx="85" cy="18" r="7" fill={p.inner} />
  </>
);
const earBunny = (p: Pal) => (
  <>
    <ellipse cx="45" cy="6" rx="8" ry="26" fill={p.furB} transform="rotate(-10 45 6)" />
    <ellipse cx="75" cy="6" rx="8" ry="26" fill={p.furB} transform="rotate(10 75 6)" />
    <ellipse cx="45" cy="8" rx="3.5" ry="18" fill={p.inner} transform="rotate(-10 45 8)" />
    <ellipse cx="75" cy="8" rx="3.5" ry="18" fill={p.inner} transform="rotate(10 75 8)" />
  </>
);
const earKitten = (p: Pal) => (
  <>
    <path d="M34 26 L30 3 L53 20 Z" fill={p.furB} />
    <path d="M86 26 L90 3 L67 20 Z" fill={p.furB} />
    <path d="M37 22 L35 10 L47 19 Z" fill={p.inner} />
    <path d="M83 22 L85 10 L73 19 Z" fill={p.inner} />
  </>
);

const ANIMALS: AnimalSpec[] = [
  {
    id: "lion",
    name: "לאון האריה",
    mane: true,
    ears: earLion,
    pal: {
      furA: "#ffe0a0", furB: "#f0a83a", furDark: "#d97d24",
      belly: "#fff4d6", muzzle: "#fff4d6", nose: "#7a4a1e", inner: "#ffe6b0"
    }
  },
  {
    id: "puppy",
    name: "רקסי הכלבלב",
    ears: earPuppy,
    pal: {
      furA: "#f2cc95", furB: "#c68a4e", furDark: "#8a5a2b",
      belly: "#f9e7ce", muzzle: "#f9e7ce", nose: "#3a2a1e", inner: "#f2c9a0"
    }
  },
  {
    id: "fawn",
    name: "עופרי העופר",
    spots: true,
    ears: earFawn,
    pal: {
      furA: "#e9bd93", furB: "#c08a52", furDark: "#a06a3a",
      belly: "#f8efe1", muzzle: "#f8efe1", nose: "#5b3a29", inner: "#f6cfc0"
    }
  },
  {
    id: "bear",
    name: "דובי הדוב",
    ears: earBear,
    pal: {
      furA: "#caa06f", furB: "#8a5a2b", furDark: "#6e4620",
      belly: "#f0dcc0", muzzle: "#f0dcc0", nose: "#3a2a1e", inner: "#d8b088"
    }
  },
  {
    id: "bunny",
    name: "ארנבי",
    ears: earBunny,
    pal: {
      furA: "#ffffff", furB: "#ded4ca", furDark: "#c4b8ad",
      belly: "#ffffff", muzzle: "#ffffff", nose: "#f19bb0", inner: "#f6cfd8"
    }
  },
  {
    id: "kitten",
    name: "מיצי החתלתול",
    ears: earKitten,
    pal: {
      furA: "#bcc2c9", furB: "#7d8894", furDark: "#5c6672",
      belly: "#eef1f4", muzzle: "#eef1f4", nose: "#f19bb0", inner: "#f6cfd8"
    }
  }
];

function animMascot(spec: AnimalSpec): Mascot {
  return {
    id: spec.id,
    name: spec.name,
    Anim: ({ size }: { size?: number }) => <AnimatedAnimal spec={spec} size={size} />
  };
}

// ===================== דמויות SVG סטטיות ותיקות (עדיין זמינות בבורר) =====================

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

export const MASCOTS: Mascot[] = [
  ...ANIMALS.map(animMascot),
  { id: "owl", name: "אלה הינשופה", Face: Owl },
  { id: "frog", name: "קורקי הצפרדע", Face: Frog },
  { id: "dino", name: "דינו הדינוזאור", Face: Dino },
  { id: "bee", name: "זוזי הדבורה", Face: Bee },
  {
    id: "puppy-photo",
    name: "רקסי (מונפש)",
    image: "/mascots/puppy.png",
    blink: "/mascots/puppy-blink.png",
    wave: "/mascots/puppy-wave.png"
  },
  { id: "lion-photo", name: "לאון (תמונה)", image: "/mascots/lion.png" },
  { id: "fawn-photo", name: "עופרי (תמונה)", image: "/mascots/fawn.png" }
];

export function mascotById(id: string): Mascot {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
