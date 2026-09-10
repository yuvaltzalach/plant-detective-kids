// POST /api/auth/login { username, password } → token + account + progress
import { hashPassword, json, publicAccount, randToken, sanitizeUser, TOKEN_TTL, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const username = sanitizeUser(body?.username);
    const password = String(body?.password ?? "");
    if (!username || !password) return json({ error: "bad-request" }, 400);

    const raw = await env.PDK_KV.get(`u:${username.toLowerCase()}`);
    if (!raw) return json({ error: "not-found" }, 404);
    const account = JSON.parse(raw);
    if ((await hashPassword(account.salt, password)) !== account.passHash) {
      return json({ error: "wrong-password" }, 401);
    }

    const token = randToken(16);
    await env.PDK_KV.put(`t:${token}`, account.usernameLower, { expirationTtl: TOKEN_TTL });
    return json({ ok: true, token, account: publicAccount(account), progress: account.progress ?? null });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
