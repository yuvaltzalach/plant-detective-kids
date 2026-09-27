// Cloudflare Pages Function: POST /api/group/sync
// מעדכן/יוצר רשומת חבר בקבוצה (טבלת ניצחונות אונליין משותפת).
// דורש חיבור של KV namespace בשם PDK_KV בהגדרות ה-Pages. אם אין — מחזיר 503
// והאפליקציה יודעת להמשיך לעבוד רגיל בלי אונליין.

import { cleanCode, cleanPlayerId, clip, GROUP_TTL, jsonResponse, type Env } from "./_lib";

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);

    const body: any = await request.json();
    const code = cleanCode(body?.code);
    const player = body?.player ?? {};
    // המזהה הוא שם המשתמש — גם בעברית (קודם תווים עבריים נמחקו והסנכרון נכשל)
    const id = cleanPlayerId(player.id);
    if (!code || !id) return jsonResponse({ error: "bad-request" }, 400);

    const key = `g:${code}:m:${id}`;
    const stats = body?.stats ?? {};
    const record = {
      id,
      name: clip(player.name, 24) || "שחקן/ית",
      avatar: clip(player.avatar, 8) || "🌱",
      points: Number(stats.points) || 0,
      stickers: Number(stats.stickers) || 0,
      badges: Number(stats.badges) || 0,
      level: Number(stats.level) || 1,
      updatedAt: Date.now()
    };

    // תוקף 120 יום כדי לא לצבור זבל לנצח
    await env.PDK_KV.put(key, JSON.stringify(record), { expirationTtl: GROUP_TTL });

    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
