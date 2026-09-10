// Cloudflare Pages Function: GET /api/group/leaderboard?code=XXXX
// מחזיר את חברי הקבוצה ממוינים לפי נקודות (טבלת ניצחונות אונליין).

interface Env {
  PDK_KV?: {
    list: (opts: { prefix: string; limit?: number }) => Promise<{ keys: { name: string }[] }>;
    get: (key: string) => Promise<string | null>;
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

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);

    const url = new URL(request.url);
    const code = cleanCode(url.searchParams.get("code"));
    if (!code) return jsonResponse({ error: "bad-request" }, 400);

    const list = await env.PDK_KV.list({ prefix: `g:${code}:m:`, limit: 100 });
    const members: any[] = [];
    for (const key of list.keys) {
      const raw = await env.PDK_KV.get(key.name);
      if (raw) {
        try {
          members.push(JSON.parse(raw));
        } catch {
          /* מדלגים על רשומה פגומה */
        }
      }
    }
    members.sort((a, b) => (b.points || 0) - (a.points || 0));

    return jsonResponse({ code, members: members.slice(0, 100) });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
