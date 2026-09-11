// POST /api/auth/link { token, childUsername, childPassword }
// מקשר חשבון ילד/ה להורה (אחרי אימות סיסמת הילד/ה). דורש חשבון הורה (גיל > 16).
import { accountFromToken, hashPassword, json, publicAccount, sanitizeUser, saveAccount, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const parent = await accountFromToken(env, String(body?.token ?? ""));
    if (!parent) return json({ error: "unauthorized" }, 401);
    if (!parent.isParent) return json({ error: "not-parent" }, 403);

    const childUser = sanitizeUser(body?.childUsername).toLowerCase();
    const childPassword = String(body?.childPassword ?? "");
    if (!childUser || !childPassword) return json({ error: "bad-request" }, 400);

    const raw = await env.PDK_KV.get(`u:${childUser}`);
    if (!raw) return json({ error: "child-not-found" }, 404);
    const child = JSON.parse(raw);
    if ((await hashPassword(child.salt, childPassword)) !== child.passHash) {
      return json({ error: "wrong-password" }, 401);
    }

    parent.children = Array.from(new Set([...(parent.children ?? []), childUser]));
    await saveAccount(env, parent);
    // מסמנים על הילד/ה שיש הורה מקושר (עבור "שכחתי סיסמה")
    if (!child.hasParent) {
      child.hasParent = true;
      await saveAccount(env, child);
    }
    return json({ ok: true, child: publicAccount(child) });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
