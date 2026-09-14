// Cloudflare Pages Function: POST /api/tts { text } → אודיו MP3 בקול ילד (ElevenLabs).
// אופציונלי: פועל רק אם מוגדרים ELEVENLABS_API_KEY ו-TTS_ENABLED=true. אחרת 503
// והלקוח נופל חזרה לקול המכשיר. ממטמן ב-PDK_KV לפי טקסט כדי לחסוך בעלות.

interface Env {
  PDK_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
  };
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
  TTS_ENABLED?: string;
}

// קול ברירת מחדל (אפשר להחליף דרך ELEVENLABS_VOICE_ID לקול ילדי מהספרייה שלכם)
const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL";

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function mp3(bytes: Uint8Array): Response {
  return new Response(bytes, {
    status: 200,
    headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=86400" }
  });
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  try {
    if (!env.ELEVENLABS_API_KEY || env.TTS_ENABLED !== "true") {
      return new Response(JSON.stringify({ error: "tts-not-configured" }), {
        status: 503,
        headers: { "content-type": "application/json" }
      });
    }
    const body: any = await request.json().catch(() => ({}));
    const text = String(body?.text ?? "").slice(0, 500).trim();
    if (!text) return new Response("bad-request", { status: 400 });

    const voice = env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
    const cacheKey = `tts:${await sha256Hex(voice + "|" + text)}`;

    if (env.PDK_KV) {
      const cached = await env.PDK_KV.get(cacheKey);
      if (cached) return mp3(base64ToBytes(cached));
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3 }
        })
      }
    );
    if (!res.ok) return new Response("tts-error", { status: 502 });

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (env.PDK_KV) {
      try {
        await env.PDK_KV.put(cacheKey, bytesToBase64(bytes), { expirationTtl: 60 * 60 * 24 * 120 });
      } catch {
        /* מתעלמים */
      }
    }
    return mp3(bytes);
  } catch {
    return new Response("server-error", { status: 500 });
  }
};
