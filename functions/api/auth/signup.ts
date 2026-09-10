// POST /api/auth/signup { username, age, password, avatar?, progress? }
// יוצר חשבון (פעם אחת) ומחזיר token להתחברות אוטומטית. דורש KV בשם PDK_KV.
import { hashPassword, json, publicAccount, randToken, sanitizeUser, TOKEN_TTL, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));

    const username = sanitizeUser(body?.username);
    if (username.length < 2) return json({ error: "bad-username" }, 400);
    const password = String(body?.password ?? "");
    if (password.length < 4) return json({ error: "weak-password" }, 400);
    const age = Number(body?.age);
    if (!Number.isFinite(age) || age < 3 || age > 120) return json({ error: "bad-age" }, 400);

    const key = `u:${username.toLowerCase()}`;
    if (await env.PDK_KV.get(key)) return json({ error: "exists" }, 409);

    const salt = randToken(8);
    const account = {
      username,
      usernameLower: username.toLowerCase(),
      age,
      avatar: String(body?.avatar ?? "").slice(0, 8) || "🌱",
      isParent: age > 16,
      salt,
      passHash: await hashPassword(salt, password),
      progress: body?.progress ?? null,
      children: [] as string[],
      createdAt: Date.now()
    };
    await env.PDK_KV.put(key, JSON.stringify(account));

    const token = randToken(16);
    await env.PDK_KV.put(`t:${token}`, account.usernameLower, { expirationTtl: TOKEN_TTL });

    return json({ ok: true, token, account: publicAccount(account), progress: account.progress });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
