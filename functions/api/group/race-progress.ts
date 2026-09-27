// Cloudflare Pages Function: POST /api/group/race-progress
// { code, raceId, player: { id, name, avatar }, score, done }
// מעדכן את ההתקדמות של שחקן במרוץ. זמן הסיום נקבע בשרת (כדי שסדר הסיום יהיה הוגן).
import {
  cleanCode,
  cleanPlayerId,
  clip,
  jsonResponse,
  RACE_TTL,
  readJson,
  type Env
} from "./_lib";

// חייב להתאים ל-MAX_POINTS_PER_MISSION שב-src/lib/race.ts
const MAX_POINTS_PER_MISSION = 150;

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);
    const body: any = await request.json().catch(() => ({}));
    const code = cleanCode(body?.code);
    const id = cleanPlayerId(body?.player?.id);
    const raceId = clip(body?.raceId, 24);
    if (!code || !id || !raceId) return jsonResponse({ error: "bad-request" }, 400);

    const race = await readJson<any>(env.PDK_KV, `g:${code}:race`);
    if (!race || race.id !== raceId) return jsonResponse({ error: "race-changed" }, 409);
    if (race.endedAt) return jsonResponse({ error: "race-ended" }, 409);

    const total = race.missions.length;
    const key = `g:${code}:r:${raceId}:${id}`;
    const prev = await readJson<any>(env.PDK_KV, key);
    if (prev?.finishedAt) return jsonResponse({ ok: true, result: prev });

    const done = Math.max(prev?.done ?? 0, Math.min(total, Math.floor(Number(body?.done) || 0)));
    const score = Math.max(
      prev?.score ?? 0,
      Math.min(done * MAX_POINTS_PER_MISSION, Math.floor(Number(body?.score) || 0))
    );
    const now = Date.now();
    const result = {
      id,
      name: clip(body?.player?.name, 24) || id,
      avatar: clip(body?.player?.avatar, 8) || "🌱",
      score,
      done,
      total,
      finishedAt: done >= total ? now : undefined,
      updatedAt: now
    };
    await env.PDK_KV.put(key, JSON.stringify(result), { expirationTtl: RACE_TTL });
    return jsonResponse({ ok: true, result });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
