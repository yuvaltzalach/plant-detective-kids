import { badgeById } from "../data/badges";

interface BadgeToastProps {
  badgeIds: string[];
  onClose: () => void;
}

/** חלון קופץ חגיגי שמציג תגים חדשים שהושגו. */
export function BadgeToast({ badgeIds, onClose }: BadgeToastProps) {
  if (badgeIds.length === 0) return null;
  const badges = badgeIds.map(badgeById).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-pop rounded-blob bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-2xl font-black text-sun">🎉 תג חדש! 🎉</div>
        <div className="mt-4 space-y-4">
          {badges.map((b) => (
            <div key={b!.id} className="flex flex-col items-center">
              <div className="text-6xl animate-wiggle">{b!.emoji}</div>
              <div className="mt-1 text-xl font-bold text-leaf-dark">{b!.name}</div>
              <div className="text-sm text-gray-500">{b!.description}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="big-btn mt-6 w-full bg-leaf">
          יאללה! 🙌
        </button>
      </div>
    </div>
  );
}
