// POST /api/auth/delete-child { token, childUsername }
// מוחק לגמרי חשבון ילד/ה המקושר להורה (רק הורה שקישר אותו/ה יכול).
import { accountFromToken, json, sanitizeUser, saveAccount, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const parent = await accountFromToken(env, String(body?.token ?? ""));
    if (!parent) return json({ error: "unauthorized" }, 401);

    const childUser = sanitizeUser(body?.childUsername).toLowerCase();
    if (!childUser || !(parent.children ?? []).includes(childUser)) {
      return json({ error: "not-linked" }, 403);
    }

    await env.PDK_KV.delete(`u:${childUser}`);
    parent.children = (parent.children ?? []).filter((c: string) => c !== childUser);
    await saveAccount(env, parent);
    return json({ ok: true });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
