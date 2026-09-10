// POST /api/auth/save { token, progress, avatar? } → שומר התקדמות החשבון בענן
import { accountFromToken, json, saveAccount, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const account = await accountFromToken(env, String(body?.token ?? ""));
    if (!account) return json({ error: "unauthorized" }, 401);

    if (body?.progress) account.progress = body.progress;
    if (typeof body?.avatar === "string" && body.avatar) account.avatar = body.avatar.slice(0, 8);
    account.updatedAt = Date.now();
    await saveAccount(env, account);
    return json({ ok: true });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
