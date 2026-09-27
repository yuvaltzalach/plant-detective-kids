// התמונות שהילדים צילמו — נשמרות מוקטנות רק במכשיר (לא בשרת), לכל מדבקה באלבום.
// מוקטנות ל-360 פיקסלים (~15KB) כדי שמאות תמונות ייכנסו באחסון המקומי.

const PREFIX = "pdk:photo:";
const THUMB_SIDE = 360;

const key = (username: string, collectId: string) => `${PREFIX}${username.toLowerCase()}:${collectId}`;

function shrink(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, THUMB_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** שומר את הצילום האחרון של הצמח (מחליף צילום קודם). */
export async function saveStickerPhoto(username: string, collectId: string, dataUrl: string) {
  const small = await shrink(dataUrl);
  try {
    localStorage.setItem(key(username, collectId), small);
  } catch {
    /* אין מקום — ממשיכים בלי תמונה */
  }
}

export function getStickerPhoto(username: string, collectId: string): string | null {
  try {
    return localStorage.getItem(key(username, collectId));
  } catch {
    return null;
  }
}

export function deleteStickerPhoto(username: string, collectId: string) {
  try {
    localStorage.removeItem(key(username, collectId));
  } catch {
    /* מתעלמים */
  }
}
