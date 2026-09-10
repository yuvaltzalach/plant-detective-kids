// POST /api/auth/rename { token, newUsername } → משנה את שם המשתמש של החשבון המחובר
import { accountFromToken, json, publicAccount, sanitizeUser, TOKEN_TTL, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const token = String(body?.token ?? "");
    const account = await accountFromToken(env, token);
    if (!account) return json({ error: "unauthorized" }, 401);

    const newName = sanitizeUser(body?.newUsername);
    if (newName.length < 2) return json({ error: "bad-username" }, 400);
    const newLower = newName.toLowerCase();
    const oldLower = account.usernameLower;

    if (newLower !== oldLower && (await env.PDK_KV.get(`u:${newLower}`))) {
      return json({ error: "exists" }, 409);
    }

    account.username = newName;
    account.usernameLower = newLower;
    await env.PDK_KV.put(`u:${newLower}`, JSON.stringify(account));
    if (newLower !== oldLower) await env.PDK_KV.delete(`u:${oldLower}`);
    await env.PDK_KV.put(`t:${token}`, newLower, { expirationTtl: TOKEN_TTL });

    return json({ ok: true, account: publicAccount(account) });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
