// ניהול משתתפים (פרופילים) על המכשיר, התקדמות פר-משתתף, והגדרות אפליקציה.
// הכל ב-localStorage — בלי שרת ובלי חשבונות. מאפשר תחרות בין ילדים על אותו טלפון.
import { challengeForDate, type Challenge } from "../data/challenges";
import { STORAGE_KEY, emptyState, loadStateFrom, saveStateTo } from "./progress";
import type { AppSettings, CustomChallenge, Player, ProgressState } from "../types";

const PLAYERS_KEY = "plant-detective:players";
const ACTIVE_KEY = "plant-detective:activePlayer";
const SETTINGS_KEY = "plant-detective:settings";

export const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🦄", "🐢", "🦉", "🐝", "🦋", "🐙", "🌻", "🦖"];

function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* מתעלמים בשקט */
  }
}

function progressKey(id: string): string {
  return `plant-detective:progress:${id}`;
}

function newId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function loadPlayers(): Player[] {
  return readJson<Player[]>(PLAYERS_KEY, []);
}

function savePlayers(players: Player[]) {
  writeJson(PLAYERS_KEY, players);
}

export function getActivePlayerId(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActivePlayerId(id: string) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* מתעלמים */
  }
}

export function addPlayer(name: string, avatar: string): Player {
  const players = loadPlayers();
  const player: Player = {
    id: newId(),
    name: name.trim() || "שחקן/ית",
    avatar: avatar || AVATARS[players.length % AVATARS.length],
    createdAt: Date.now()
  };
  savePlayers([...players, player]);
  if (!getActivePlayerId()) setActivePlayerId(player.id);
  return player;
}

export function renamePlayer(id: string, name: string, avatar?: string) {
  savePlayers(
    loadPlayers().map((p) =>
      p.id === id ? { ...p, name: name.trim() || p.name, avatar: avatar ?? p.avatar } : p
    )
  );
}

/** מקשר משתתף לחשבון אונליין (קוד אישי) — או מנתק (undefined). */
export function setPlayerCloudCode(id: string, code: string | undefined) {
  savePlayers(loadPlayers().map((p) => (p.id === id ? { ...p, cloudCode: code } : p)));
}

export function findPlayerByCloud(code: string): Player | null {
  return loadPlayers().find((p) => p.cloudCode === code) ?? null;
}

export function removePlayer(id: string) {
  const remaining = loadPlayers().filter((p) => p.id !== id);
  savePlayers(remaining);
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(progressKey(id));
    } catch {
      /* מתעלמים */
    }
  }
  if (getActivePlayerId() === id) {
    if (remaining[0]) setActivePlayerId(remaining[0].id);
    else if (typeof localStorage !== "undefined") localStorage.removeItem(ACTIVE_KEY);
  }
}

export function loadProgressFor(id: string): ProgressState {
  return loadStateFrom(progressKey(id));
}

export function saveProgressFor(id: string, state: ProgressState) {
  saveStateTo(progressKey(id), state);
}

export function resetProgressFor(id: string) {
  saveProgressFor(id, emptyState());
}

/**
 * מבטיח שקיים לפחות משתתף אחד ומשתתף פעיל.
 * אם קיימת התקדמות ישנה (משחקן יחיד) — מעבירים אותה למשתתף ברירת מחדל כדי לא לאבד נתונים.
 */
export function ensureActivePlayer(): Player[] {
  let players = loadPlayers();
  if (players.length === 0) {
    const first = addPlayer("שחקן/ית 1", AVATARS[0]);
    players = [first];
    // הגירה: אם יש התקדמות ישנה במפתח הגלובלי — מעבירים למשתתף הראשון
    if (typeof localStorage !== "undefined") {
      try {
        const legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy) {
          saveProgressFor(first.id, loadStateFrom(STORAGE_KEY));
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        /* מתעלמים */
      }
    }
  }
  if (!getActivePlayerId() || !players.some((p) => p.id === getActivePlayerId())) {
    setActivePlayerId(players[0].id);
  }
  return players;
}

// ─── הגדרות (כולל אתגר מותאם של הורה) ────────────────────────────────────
export function loadSettings(): AppSettings {
  return readJson<AppSettings>(SETTINGS_KEY, { customChallenge: null });
}

export function saveSettings(settings: AppSettings) {
  writeJson(SETTINGS_KEY, settings);
}

export function setCustomChallenge(challenge: CustomChallenge | null) {
  saveSettings({ ...loadSettings(), customChallenge: challenge });
}

/** האתגר הפעיל: מותאם על-ידי הורה אם קיים, אחרת האתגר היומי הקבוע. */
export function activeChallenge(settings: AppSettings, now = new Date()): Challenge {
  const custom = settings.customChallenge;
  if (custom) {
    return {
      id: "custom",
      text: custom.text,
      emoji: custom.emoji || "🎯",
      category: custom.category,
      manual: !custom.category // בלי קטגוריה → סימון ידני ("מצאתי!")
    };
  }
  return challengeForDate(now);
}
