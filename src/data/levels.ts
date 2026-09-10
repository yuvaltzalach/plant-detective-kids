// תארי דרגה מהנים שמתקדמים עם הרמה — נותן לילדים תחושת התקדמות.
export interface LevelTitle {
  name: string;
  emoji: string;
}

const TITLES: LevelTitle[] = [
  { name: "נֶבֶט", emoji: "🌱" },
  { name: "שָׁתִיל", emoji: "🌿" },
  { name: "חוֹקֵר צָעִיר", emoji: "🔎" },
  { name: "בַּלָּשׁ צְמָחִים", emoji: "🕵️" },
  { name: "מוּמְחֶה לְצמחים", emoji: "🌳" },
  { name: "חֲכַם הַטֶּבַע", emoji: "🦉" },
  { name: "אַלּוּף הַצְּמָחִים", emoji: "🏆" },
  { name: "פְּרוֹפֶסוֹר הַטֶּבַע", emoji: "🎓" }
];

export function levelTitle(level: number): LevelTitle {
  return TITLES[Math.min(Math.max(level, 1) - 1, TITLES.length - 1)];
}
