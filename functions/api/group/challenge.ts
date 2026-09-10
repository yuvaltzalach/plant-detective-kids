// Cloudflare Pages Function: POST /api/group/challenge
// קובע אתגר משותף לכל הקבוצה (למשל הורה/מורה קובע "מצאו פרח סגול").

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
    if (!code) return jsonResponse({ error: "bad-request" }, 400);

    const c = body?.challenge;
    if (c === null) {
      // ביטול אתגר קבוצתי — כותבים תוקף מיידי בעצם על-ידי ערך ריק
      await env.PDK_KV.put(`g:${code}:challenge`, "", { expirationTtl: 60 });
      return jsonResponse({ ok: true, cleared: true });
    }

    const text = clip(c?.text, 120).trim();
    if (!text) return jsonResponse({ error: "bad-request" }, 400);
    const challenge = {
      text,
      emoji: clip(c?.emoji, 8) || "🎯",
      category: ["עץ", "פרח", "עשב", "צמח"].includes(c?.category) ? c.category : undefined,
      by: clip(c?.by, 20),
      updatedAt: Date.now()
    };

    await env.PDK_KV.put(`g:${code}:challenge`, JSON.stringify(challenge), {
      expirationTtl: 60 * 60 * 24 * 120
    });
    return jsonResponse({ ok: true, challenge });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
