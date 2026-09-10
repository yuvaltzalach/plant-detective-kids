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
