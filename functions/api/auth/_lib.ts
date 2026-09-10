// עזרי אימות משותפים לפונקציות ה-Pages (קבצים עם קו תחתון אינם ניתובים).

export interface Env {
  PDK_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
  };
}

export const TOKEN_TTL = 60 * 60 * 24 * 400; // ~400 ימים

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

/** שם משתמש: אותיות/ספרות/עברית/קו תחתון, עד 20 תווים. */
export function sanitizeUser(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/[^0-9A-Za-z֐-׿_.-]/g, "")
    .slice(0, 20);
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randToken(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(salt: string, password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`));
  return toHex(buf);
}

export function publicAccount(a: any) {
  return { username: a.username, age: a.age, avatar: a.avatar, isParent: !!a.isParent };
}

/** מאמת token ומחזיר את רשומת החשבון המלאה (או null). */
export async function accountFromToken(env: Env, token: string): Promise<any | null> {
  if (!token) return null;
  const usernameLower = await env.PDK_KV!.get(`t:${token}`);
  if (!usernameLower) return null;
  const raw = await env.PDK_KV!.get(`u:${usernameLower}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveAccount(env: Env, account: any): Promise<void> {
  await env.PDK_KV!.put(`u:${account.usernameLower}`, JSON.stringify(account));
}
