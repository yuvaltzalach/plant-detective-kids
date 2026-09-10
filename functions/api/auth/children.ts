// GET /api/auth/children?token=... → החשבונות המקושרים להורה, עם ההתקדמות שלהם
import { accountFromToken, json, publicAccount, type Env } from "./_lib";

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const parent = await accountFromToken(env, token);
    if (!parent) return json({ error: "unauthorized" }, 401);

    const children: any[] = [];
    for (const childUser of parent.children ?? []) {
      const raw = await env.PDK_KV.get(`u:${childUser}`);
      if (raw) {
        const c = JSON.parse(raw);
        children.push({ ...publicAccount(c), progress: c.progress ?? null });
      }
    }
    return json({ ok: true, children });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
