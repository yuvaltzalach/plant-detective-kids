import type { VercelRequest, VercelResponse } from "@vercel/node";

// ─────────────────────────────────────────────────────────────────────────
// פונקציית פרוקסי serverless: מקבלת תמונה (data-URL) מהדפדפן, קוראת למנוע
// הזיהוי (Pl@ntNet כברירת מחדל, Claude Vision כאופציה), ומחזירה רשימת מועמדים.
// המפתחות נשמרים רק כאן בצד השרת ולא נחשפים ללקוח.
// ─────────────────────────────────────────────────────────────────────────

interface Candidate {
  scientificName: string;
  genus: string;
  commonNames: string[];
  score: number;
  imageUrl?: string;
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("פורמט תמונה לא תקין");
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

async function identifyWithPlantNet(dataUrl: string): Promise<Candidate[]> {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) throw new Error("חסר מפתח Pl@ntNet בשרת (PLANTNET_API_KEY)");

  const { mime, buffer } = parseDataUrl(dataUrl);
  const form = new FormData();
  const ext = mime.includes("png") ? "png" : "jpg";
  form.append(
    "images",
    new Blob([buffer as unknown as BlobPart], { type: mime }),
    `plant.${ext}`
  );
  form.append("organs", "auto");

  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(
    key
  )}&nb-results=5&lang=he`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Pl@ntNet החזיר שגיאה (${res.status})`);
  }
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
async function identifyWithClaude(dataUrl: string): Promise<Candidate[]> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("חסר מפתח Anthropic");
  const { mime, buffer } = parseDataUrl(dataUrl);

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
              source: { type: "base64", media_type: mime, data: buffer.toString("base64") }
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  try {
    const image: string | undefined =
      typeof req.body === "string" ? JSON.parse(req.body).image : req.body?.image;
    if (!image) {
      res.status(400).send("חסרה תמונה");
      return;
    }

    const useClaude = process.env.USE_CLAUDE_VISION === "true" && process.env.ANTHROPIC_API_KEY;
    const candidates = useClaude
      ? await identifyWithClaude(image)
      : await identifyWithPlantNet(image);

    res.status(200).json({ candidates });
  } catch (e) {
    const message = e instanceof Error ? e.message : "שגיאה לא ידועה";
    res.status(500).send(message);
  }
}
