// שכבת אונליין: קבוצה משותפת (קוד הצטרפות) וטבלת ניצחונות בין מכשירים.
// הכל עטוף ב-try/catch — אם השרת/KV לא זמין, מחזירים null והאפליקציה ממשיכה רגיל.

const CODE_KEY = "plant-detective:groupCode";

export interface OnlineMember {
  id: string;
  name: string;
  avatar: string;
  points: number;
  stickers: number;
  badges: number;
  level: number;
  groupDoneAt?: number;
  updatedAt: number;
}

export interface GroupChallenge {
  text: string;
  emoji: string;
  category?: string;
  by?: string;
  updatedAt: number;
}

export interface GroupData {
  members: OnlineMember[];
  challenge: GroupChallenge | null;
}

export interface PlayerStats {
  points: number;
  stickers: number;
  badges: number;
  level: number;
}

export interface OnlinePlayer {
  id: string;
  name: string;
  avatar: string;
}

export function getGroupCode(): string | null {
  try {
    return localStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
}

export function setGroupCode(code: string | null) {
  try {
    if (code) localStorage.setItem(CODE_KEY, code);
    else localStorage.removeItem(CODE_KEY);
  } catch {
    /* מתעלמים */
  }
}

/** מייצר קוד קבוצה קריא (בלי אותיות/ספרות מבלבלות). */
export function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export async function syncGroup(
  code: string,
  player: OnlinePlayer,
  stats: PlayerStats,
  groupDoneAt?: number
): Promise<boolean> {
  try {
    const res = await fetch("/api/group/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, player, stats, groupDoneAt })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchGroup(code: string): Promise<GroupData | null> {
  try {
    const res = await fetch("/api/group/leaderboard?code=" + encodeURIComponent(code));
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<GroupData>;
    return { members: data.members ?? [], challenge: data.challenge ?? null };
  } catch {
    return null;
  }
}

/** קובע (או מבטל, עם null) אתגר משותף לכל הקבוצה. */
export async function setGroupChallenge(
  code: string,
  challenge: { text: string; emoji: string; category?: string; by?: string } | null
): Promise<boolean> {
  try {
    const res = await fetch("/api/group/challenge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, challenge })
    });
    return res.ok;
  } catch {
    return false;
  }
}
