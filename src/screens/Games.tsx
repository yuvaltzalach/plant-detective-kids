export type GameId = "quiz" | "memory" | "sort" | "timed" | "match" | "puzzle" | "truefalse";

export const GAMES: { id: GameId; label: string; emoji: string }[] = [
  { id: "quiz", label: "נחשו את הצמח", emoji: "❓" },
  { id: "memory", label: "משחק זיכרון", emoji: "🃏" },
  { id: "sort", label: "מיון צמחים", emoji: "🗂️" },
  { id: "timed", label: "מרוץ הצמחים", emoji: "⏱️" },
  { id: "match", label: "תמונה לשם", emoji: "🔗" },
  { id: "puzzle", label: "פאזל תמונה", emoji: "🧩" },
  { id: "truefalse", label: "אמת או דמיון", emoji: "✅" }
];

export function Games({ onOpen }: { onOpen: (id: GameId) => void }) {
  return (
    <div className="screen-rise flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      <div className="relative text-center">
        <div className="title-glow" aria-hidden="true" />
        <div className="relative text-6xl drop-shadow-sm">🎮</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">משחקים</h2>
        <p className="mt-1 text-leaf-dark/80">בואו נשחק ונלמד צמחים!</p>
      </div>
      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => onOpen(g.id)}
            className="soft-card py-6 text-lg font-black text-leaf-dark active:scale-95 transition-transform"
          >
            <div className="text-4xl drop-shadow-sm">{g.emoji}</div>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
