// Cloudflare Pages Function: POST /api/group/race
// פתיחה / סגירה של "מרוץ משימות" לכל הקבוצה.
//   { code, action: "start", race: { missions: [...], by } } → מרוץ חדש (מחליף את הקודם)
//   { code, action: "end" } → סוגר את המרוץ הנוכחי ומכריז על המנצחים
import { cleanCode, clip, jsonResponse, RACE_TTL, readJson, type Env } from "./_lib";

const KINDS = new Set(["pic", "name", "tf", "cat", "hunt"]);

function randomId(): string {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** מסנן משימות כך שנשמר רק מבנה צפוי (ולא טקסט חופשי ארוך). */
function cleanMission(m: any): any | null {
  if (!m || !KINDS.has(m.kind)) return null;
  if (m.kind === "hunt") {
    return {
      kind: "hunt",
      category: ["עץ", "פרח", "עשב", "צמח"].includes(m.category) ? m.category : undefined,
      text: clip(m.text, 80),
      emoji: clip(m.emoji, 8)
    };
  }
  const plantId = clip(m.plantId, 40);
  if (!plantId) return null;
  if (m.kind === "pic" || m.kind === "name") {
    const options = Array.isArray(m.options) ? m.options.slice(0, 4).map((o: unknown) => clip(o, 40)) : [];
    if (options.length < 2 || !options.includes(plantId)) return null;
    return { kind: m.kind, plantId, options };
  }
  if (m.kind === "tf") {
    return { kind: "tf", plantId, statement: clip(m.statement, 200), isTrue: !!m.isTrue };
  }
  return { kind: "cat", plantId };
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const code = cleanCode(body?.code);
    if (!code) return jsonResponse({ error: "bad-request" }, 400);
    const key = `g:${code}:race`;

    if (body?.action === "end") {
      const race = await readJson<any>(env.PDK_KV, key);
      if (!race) return jsonResponse({ error: "no-race" }, 404);
      if (!race.endedAt) race.endedAt = Date.now();
      await env.PDK_KV.put(key, JSON.stringify(race), { expirationTtl: RACE_TTL });
      return jsonResponse({ ok: true, race });
    }

    if (body?.action === "start") {
      const raw = Array.isArray(body?.race?.missions) ? body.race.missions.slice(0, 20) : [];
      const missions = raw.map(cleanMission).filter(Boolean);
      if (missions.length < 3) return jsonResponse({ error: "bad-request" }, 400);
      const race = {
        id: randomId(),
        missions,
        by: clip(body?.race?.by, 24),
        startedAt: Date.now()
      };
      await env.PDK_KV.put(key, JSON.stringify(race), { expirationTtl: RACE_TTL });
      return jsonResponse({ ok: true, race });
    }

    return jsonResponse({ error: "bad-request" }, 400);
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
