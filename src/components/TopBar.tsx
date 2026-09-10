interface TopBarProps {
  points: number;
  level: number;
  inLevel: number;
  onHome: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function TopBar({ points, level, inLevel, onHome, muted, onToggleMute }: TopBarProps) {
  const pct = Math.min(100, (inLevel / 50) * 100);
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <button
        onClick={onHome}
        className="text-2xl active:scale-90 transition-transform"
        aria-label="חזרה לבית"
      >
        🏠
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between text-sm font-bold text-leaf-dark">
          <span>רמה {level}</span>
          <span>⭐ {points}</span>
        </div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-leaf-light">
          <div
            className="h-full rounded-full bg-gradient-to-l from-leaf to-sun transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={onToggleMute}
        className="text-2xl active:scale-90 transition-transform"
        aria-label={muted ? "הפעל קול" : "השתק"}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </header>
  );
}
