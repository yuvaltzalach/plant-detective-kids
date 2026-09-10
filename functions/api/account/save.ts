// Cloudflare Pages Function: POST /api/account/save
// שומר את התקדמות החשבון (סנכרון בין מכשירים). מעדכן חשבון קיים בלבד.

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
    const body: any = await request.json().catch(() => ({}));
    const code = cleanCode(body?.code);
    if (!code) return jsonResponse({ error: "bad-request" }, 400);

    const raw = await env.PDK_KV.get(`a:${code}`);
    if (!raw) return jsonResponse({ error: "not-found" }, 404);

    const account = JSON.parse(raw);
    account.name = clip(body?.name, 20) || account.name;
    account.avatar = clip(body?.avatar, 8) || account.avatar;
    if (body?.progress) account.progress = body.progress;
    account.updatedAt = Date.now();

    await env.PDK_KV.put(`a:${code}`, JSON.stringify(account));
    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
