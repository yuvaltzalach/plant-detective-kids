import type { PlantCategory, ProgressState } from "../types";

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** מחזיר true אם התג הושג לפי מצב ההתקדמות. */
  check: (s: ProgressState) => boolean;
}

function stickerList(s: ProgressState) {
  return Object.values(s.stickers);
}

function countByCategory(s: ProgressState, category: PlantCategory) {
  return stickerList(s).filter((x) => x.category === category).length;
}

function distinctCategories(s: ProgressState) {
  return new Set(stickerList(s).map((x) => x.category)).size;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-find",
    name: "הזיהוי הראשון",
    emoji: "🌱",
    description: "זיהית את הצמח הראשון שלך!",
    check: (s) => stickerList(s).length >= 1
  },
  {
    id: "collector-5",
    name: "אספן מתחיל",
    emoji: "🌿",
    description: "אספת 5 צמחים שונים.",
    check: (s) => stickerList(s).length >= 5
  },
  {
    id: "collector-10",
    name: "אספן על",
    emoji: "🌳",
    description: "אספת 10 צמחים שונים!",
    check: (s) => stickerList(s).length >= 10
  },
  {
    id: "collector-20",
    name: "מלך האוסף",
    emoji: "🏆",
    description: "אספת 20 צמחים שונים! מדהים!",
    check: (s) => stickerList(s).length >= 20
  },
  {
    id: "tree-hugger",
    name: "חבר של העצים",
    emoji: "🌳",
    description: "מצאת 5 עצים שונים.",
    check: (s) => countByCategory(s, "עץ") >= 5
  },
  {
    id: "flower-power",
    name: "צייד הפרחים",
    emoji: "🌸",
    description: "מצאת 5 פרחים שונים.",
    check: (s) => countByCategory(s, "פרח") >= 5
  },
  {
    id: "herb-master",
    name: "מומחה עשבים",
    emoji: "🍃",
    description: "מצאת 3 עשבים שונים.",
    check: (s) => countByCategory(s, "עשב") >= 3
  },
  {
    id: "explorer",
    name: "חוקר אמיתי",
    emoji: "🧭",
    description: "מצאת צמחים מכל הסוגים!",
    check: (s) => distinctCategories(s) >= 4
  },
  {
    id: "points-100",
    name: "100 נקודות",
    emoji: "⭐",
    description: "צברת 100 נקודות.",
    check: (s) => s.points >= 100
  },
  {
    id: "points-500",
    name: "500 נקודות",
    emoji: "🌟",
    description: "צברת 500 נקודות! ווהו!",
    check: (s) => s.points >= 500
  },
  {
    id: "streak-3",
    name: "רצף אלוף",
    emoji: "🔥",
    description: "השלמת אתגר יומי 3 ימים ברצף.",
    check: (s) => s.challengeStreak >= 3
  }
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
