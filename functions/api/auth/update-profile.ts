// POST /api/auth/update-profile { token, age?, password?, avatar? }
// מעדכן פרטי פרופיל של המשתמש/ת המחובר/ת (גיל/סיסמה/דמות). שם משתמש דרך rename.
import { accountFromToken, hashPassword, json, publicAccount, randToken, saveAccount, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return json({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const account = await accountFromToken(env, String(body?.token ?? ""));
    if (!account) return json({ error: "unauthorized" }, 401);

    if (body?.age !== undefined) {
      const age = Number(body.age);
      if (!Number.isFinite(age) || age < 3 || age > 120) return json({ error: "bad-age" }, 400);
      account.age = age;
      account.isParent = age > 16;
    }
    if (typeof body?.avatar === "string" && body.avatar) account.avatar = body.avatar.slice(0, 8);
    if (body?.password !== undefined) {
      const password = String(body.password);
      if (password.length < 4) return json({ error: "weak-password" }, 400);
      account.salt = randToken(8);
      account.passHash = await hashPassword(account.salt, password);
    }
    account.updatedAt = Date.now();
    await saveAccount(env, account);
    return json({ ok: true, account: publicAccount(account) });
  } catch {
    return json({ error: "server-error" }, 500);
  }
};
