// עזרים משותפים לפונקציות הקבוצה (קבצים עם קו תחתון אינם ניתובים).

export interface KV {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (opts: { prefix: string; limit?: number }) => Promise<{ keys: { name: string }[] }>;
}

export interface Env {
  PDK_KV?: KV;
}

export const GROUP_TTL = 60 * 60 * 24 * 120; // 120 יום
export const RACE_TTL = 60 * 60 * 24 * 30; // 30 יום

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export function cleanCode(s: unknown): string {
  return String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function clip(s: unknown, n: number): string {
  return String(s ?? "").slice(0, n);
}

/**
 * מזהה שחקן = שם המשתמש של החשבון (יכול להיות בעברית, עם רווח).
 * חייב להתאים ל-sanitizeUser שבפונקציות ה-auth כדי שנוכל לבדוק שהחשבון קיים.
 */
export function cleanPlayerId(s: unknown): string {
  return String(s ?? "")
    .replace(/[^0-9A-Za-z֐-׿ _.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
}

export async function readJson<T>(kv: KV, key: string): Promise<T | null> {
  try {
    const raw = await kv.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** קורא את כל הרשומות תחת קידומת (עד 100). */
export async function readAll<T>(kv: KV, prefix: string): Promise<{ key: string; value: T }[]> {
  const list = await kv.list({ prefix, limit: 100 });
  const out: { key: string; value: T }[] = [];
  for (const k of list.keys) {
    const value = await readJson<T>(kv, k.name);
    if (value) out.push({ key: k.name, value });
  }
  return out;
}

/** האם קיים חשבון עם שם המשתמש הזה (חשבונות שנמחקו לא יופיעו בטבלאות). */
export async function accountExists(kv: KV, playerId: string): Promise<boolean> {
  return !!(await kv.get(`u:${playerId.toLowerCase()}`));
}
