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
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-4">
      <div className="text-center">
        <div className="text-6xl">🎮</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">משחקים</h2>
        <p className="mt-1 text-leaf-dark/80">בואו נשחק ונלמד צמחים!</p>
      </div>
      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => onOpen(g.id)}
            className="rounded-blob bg-white py-6 text-lg font-black text-leaf-dark shadow active:scale-95"
          >
            <div className="text-4xl">{g.emoji}</div>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
