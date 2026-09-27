// Cloudflare Pages Function: GET /api/group/leaderboard?code=XXXX
// מחזיר את חברי הקבוצה ממוינים לפי נקודות ואת מרוץ המשימות הפעיל
// עם ההתקדמות של כל משתתף. חברים שהחשבון שלהם נמחק (או ששינו שם) לא מוצגים.
import { accountExists, cleanCode, jsonResponse, readAll, readJson, type Env } from "./_lib";

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.PDK_KV) return jsonResponse({ error: "online-not-configured" }, 503);
    const kv = env.PDK_KV;

    const url = new URL(request.url);
    const code = cleanCode(url.searchParams.get("code"));
    if (!code) return jsonResponse({ error: "bad-request" }, 400);

    const members: any[] = [];
    for (const { value } of await readAll<any>(kv, `g:${code}:m:`)) {
      if (await accountExists(kv, String(value.id ?? ""))) members.push(value);
    }
    members.sort((a, b) => (b.points || 0) - (a.points || 0));

    const race = await readJson<any>(kv, `g:${code}:race`);
    const memberIds = new Set(members.map((m) => m.id));
    const raceResults = race
      ? (await readAll<any>(kv, `g:${code}:r:${race.id}:`))
          .map((r) => r.value)
          .filter((r) => memberIds.has(r.id))
      : [];

    return jsonResponse({ code, members: members.slice(0, 100), race, raceResults });
  } catch {
    return jsonResponse({ error: "server-error" }, 500);
  }
};
