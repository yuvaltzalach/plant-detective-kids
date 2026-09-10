// Cloudflare Pages Function: POST /api/group/sync
// מעדכן/יוצר רשומת חבר בקבוצה (טבלת ניצחונות אונליין משותפת).
// דורש חיבור של KV namespace בשם PDK_KV בהגדרות ה-Pages. אם אין — מחזיר 503
// והאפליקציה יודעת להמשיך לעבוד רגיל בלי אונליין.

interface Env {
  PDK_KV?: {
    put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function cleanCode(s: unknown): string {
  return String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function clip(s: unknown, n: number): string {
  return String(s ?? "").slice(0, n);
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);

    const body: any = await request.json();
    const code = cleanCode(body?.code);
    const player = body?.player ?? {};
    const id = clip(player.id, 64).replace(/[^A-Za-z0-9_-]/g, "");
    if (!code || !id) return jsonResponse({ error: "bad-request" }, 400);

    const stats = body?.stats ?? {};
    const record = {
      id,
      name: clip(player.name, 20) || "שחקן/ית",
      avatar: clip(player.avatar, 8) || "🌱",
      points: Number(stats.points) || 0,
      stickers: Number(stats.stickers) || 0,
      badges: Number(stats.badges) || 0,
      level: Number(stats.level) || 1,
      updatedAt: Date.now()
    };

    // תוקף 120 יום כדי לא לצבור זבל לנצח
    await env.PDK_KV.put(`g:${code}:m:${id}`, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 120
    });

    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
