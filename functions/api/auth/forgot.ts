// GET /api/auth/forgot?username=... → מידע לשחזור סיסמה (בלי אימות).
// מחזיר אם המשתמש קיים והאם יש לו הורה מקושר (שיכול לאפס לו סיסמה).
import { json, sanitizeUser, type Env } from "./_lib";

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const username = sanitizeUser(new URL(request.url).searchParams.get("username")).toLowerCase();
    if (!username) return json({ error: "bad-request" }, 400);
    const raw = await env.PDK_KV.get(`u:${username}`);
    if (!raw) return json({ ok: true, exists: false });
    const a = JSON.parse(raw);
    return json({ ok: true, exists: true, hasParent: !!a.hasParent, isParent: !!a.isParent });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
