// GET /api/auth/me?token=... → account + progress (לכניסה אוטומטית)
import { accountFromToken, json, publicAccount, type Env } from "./_lib";

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const account = await accountFromToken(env, token);
    if (!account) return json({ error: "unauthorized" }, 401);
    return json({ ok: true, account: publicAccount(account), progress: account.progress ?? null });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
