// Cloudflare Pages Function: GET /api/account/get?code=XXXXXXXX
// מחזיר חשבון קיים לפי הקוד האישי (להתחברות ממכשיר אחר).

interface Env {
  PDK_KV?: { get: (key: string) => Promise<string | null> };
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

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);
    const code = cleanCode(new URL(request.url).searchParams.get("code"));
    if (!code) return jsonResponse({ error: "bad-request" }, 400);
    const raw = await env.PDK_KV.get(`a:${code}`);
    if (!raw) return jsonResponse({ error: "not-found" }, 404);
    return jsonResponse({ ok: true, account: JSON.parse(raw) });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
