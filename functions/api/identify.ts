// ─────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function: POST /api/identify
// מקבלת תמונה (data-URL) מהדפדפן, קוראת למנוע הזיהוי (Pl@ntNet כברירת מחדל,
// Claude Vision כאופציה), ומחזירה רשימת מועמדים. המפתחות נשמרים רק כאן בצד
// השרת (ב-Environment Variables של Cloudflare) ולא נחשפים ללקוח.
// ─────────────────────────────────────────────────────────────────────────

interface Env {
  PLANTNET_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  USE_CLAUDE_VISION?: string;
}

interface Candidate {
  scientificName: string;
  genus: string;
  commonNames: string[];
  score: number;
  imageUrl?: string;
}

/** מפרק data-URL ל-mime ולבייטים (בלי Buffer של Node — סביבת Workers). */
function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array; base64: string } {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("פורמט תמונה לא תקין");
  const base64 = match[2];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime: match[1], bytes, base64 };
}

async function identifyWithPlantNet(dataUrl: string, env: Env): Promise<Candidate[]> {
  const key = env.PLANTNET_API_KEY;
  if (!key) throw new Error("חסר מפתח Pl@ntNet בשרת (PLANTNET_API_KEY)");

  const { mime, bytes } = parseDataUrl(dataUrl);
  const form = new FormData();
  const ext = mime.includes("png") ? "png" : "jpg";
  form.append("images", new Blob([bytes], { type: mime }), `plant.${ext}`);
  form.append("organs", "auto");

  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(
    key
  )}&nb-results=5&lang=he`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Pl@ntNet החזיר שגיאה (${res.status})`);

  const data: any = await res.json();
  const results: any[] = data.results ?? [];
  return results.map((r) => ({
    scientificName: r.species?.scientificNameWithoutAuthor ?? "",
    genus: r.species?.genus?.scientificNameWithoutAuthor ?? "",
    commonNames: r.species?.commonNames ?? [],
    score: typeof r.score === "number" ? r.score : 0,
    imageUrl: r.images?.[0]?.url?.m ?? r.images?.[0]?.url?.o
  }));
}

// ─── שדרוג אופציונלי: Claude Vision (בתשלום) ──────────────────────────────
async function identifyWithClaude(dataUrl: string, env: Env): Promise<Candidate[]> {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("חסר מפתח Anthropic");
  const { mime, base64 } = parseDataUrl(dataUrl);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mime, data: base64 }
            },
            {
              type: "text",
              text: "זהה את הצמח בתמונה. החזר JSON בלבד בפורמט: {\"scientificName\":\"\",\"genus\":\"\",\"commonNames\":[\"שם בעברית\"],\"score\":0.0}. אם לא בטוח, נחש את הכי סביר."
            }
          ]
        }
      ]
    })
  });
  if (!res.ok) throw new Error(`Claude החזיר שגיאה (${res.status})`);
  const data: any = await res.json();
  const text: string = data.content?.[0]?.text ?? "{}";
  const json = JSON.parse(text.replace(/```json|```/g, "").trim());
  return [
    {
      scientificName: json.scientificName ?? "",
      genus: json.genus ?? "",
      commonNames: json.commonNames ?? [],
      score: typeof json.score === "number" ? json.score : 0.8
    }
  ];
}

function textResponse(body: string, status: number): Response {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
}

// נקודת הכניסה של Cloudflare Pages ל-POST /api/identify
export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;
  try {
    const body = (await request.json()) as { image?: string };
    const image = body?.image;
    if (!image) return textResponse("חסרה תמונה", 400);

    const useClaude = env.USE_CLAUDE_VISION === "true" && !!env.ANTHROPIC_API_KEY;
    const candidates = useClaude
      ? await identifyWithClaude(image, env)
      : await identifyWithPlantNet(image, env);

    return new Response(JSON.stringify({ candidates }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  } catch (e) {
    return textResponse(e instanceof Error ? e.message : "שגיאה לא ידועה", 500);
  }
};
