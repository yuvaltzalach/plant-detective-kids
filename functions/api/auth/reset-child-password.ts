// POST /api/auth/reset-child-password { token, childUsername, newPassword }
// הורה מאפס סיסמה של ילד/ה מקושר/ת ("שכחתי סיסמה").
import { accountFromToken, hashPassword, json, randToken, sanitizeUser, saveAccount, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const parent = await accountFromToken(env, String(body?.token ?? ""));
    if (!parent) return json({ error: "unauthorized" }, 401);
    if (!parent.isParent) return json({ error: "not-parent" }, 403);

    const childLower = sanitizeUser(body?.childUsername).toLowerCase();
    if (!childLower || !(parent.children ?? []).includes(childLower)) {
      return json({ error: "not-linked" }, 403);
    }
    const newPassword = String(body?.newPassword ?? "");
    if (newPassword.length < 4) return json({ error: "weak-password" }, 400);

    const raw = await env.PDK_KV.get(`u:${childLower}`);
    if (!raw) return json({ error: "child-not-found" }, 404);
    const child = JSON.parse(raw);
    child.salt = randToken(8);
    child.passHash = await hashPassword(child.salt, newPassword);
    await saveAccount(env, child);
    return json({ ok: true });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
