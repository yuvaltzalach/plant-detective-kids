import type { IdentifyCandidate } from "../types";

const MOCK = import.meta.env.VITE_MOCK_IDENTIFY === "true";

/** קורא קובץ תמונה ומחזיר data-URL (base64). */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("לא הצלחנו לקרוא את התמונה"));
    reader.readAsDataURL(file);
  });
}

/** הצלע הארוכה של התמונה שנשלחת לזיהוי — מספיק ל-Pl@ntNet, וקטן פי 10 ויותר מתמונה מקורית. */
export const MAX_IMAGE_SIDE = 1280;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("לא הצלחנו לקרוא את התמונה"));
    img.src = src;
  });
}

/** מקטין תמונה (קובץ, וידאו או canvas) ל-JPEG קטן. תמונות מצלמה מקוריות שוקלות כמה מגה
 *  ועלולות להפיל את הדף בטלפון ולהאט את הזיהוי. */
export function drawToJpeg(source: CanvasImageSource, width: number, height: number): string {
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** קובץ תמונה → data-URL מוקטן. אם ההקטנה נכשלת — מחזיר את המקור. */
export async function prepareImage(file: File | Blob): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return drawToJpeg(img, img.naturalWidth, img.naturalHeight);
  } catch {
    return fileToDataUrl(file);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const MOCK_CANDIDATES: IdentifyCandidate[] = [
  {
    scientificName: "Anemone coronaria",
    genus: "Anemone",
    commonNames: ["כלנית מצויה", "Poppy anemone"],
    score: 0.92
  }
];

/**
 * שולח תמונה לפונקציית הפרוקסי ומקבל רשימת מועמדים.
 * במצב MOCK מחזיר צמח לדוגמה כדי לבדוק את הממשק בלי מפתח/שרת.
 */
export async function identifyImage(dataUrl: string): Promise<IdentifyCandidate[]> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 1200));
    return MOCK_CANDIDATES;
  }

  const res = await fetch("/api/identify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image: dataUrl })
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `שגיאת שרת (${res.status})`);
  }

  const data = (await res.json()) as { candidates?: IdentifyCandidate[] };
  return data.candidates ?? [];
}
