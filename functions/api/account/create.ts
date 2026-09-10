// Cloudflare Pages Function: POST /api/account/create
// יוצר "חשבון אמיתי" לילד/ה עם קוד אישי, שמסונכרן בין מכשירים. דורש KV בשם PDK_KV.

interface Env {
  PDK_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function clip(s: unknown, n: number): string {
  return String(s ?? "").slice(0, n);
}

function newCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));

    // מוצאים קוד פנוי (עד כמה ניסיונות)
    let code = "";
    for (let i = 0; i < 5; i++) {
      const candidate = newCode();
      const exists = await env.PDK_KV.get(`a:${candidate}`);
      if (!exists) {
        code = candidate;
        break;
      }
    }
    if (!code) return jsonResponse({ error: "try-again" }, 500);

    const account = {
      code,
      name: clip(body?.name, 20) || "שחקן/ית",
      avatar: clip(body?.avatar, 8) || "🌱",
      progress: body?.progress ?? null,
      updatedAt: Date.now()
    };
    await env.PDK_KV.put(`a:${code}`, JSON.stringify(account));
    return jsonResponse({ ok: true, account });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
