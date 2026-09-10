// יצירת תמונת אלבום לשיתוף (וואטסאפ וכו') דרך Web Share API, עם נפילה חיננית להורדה.
import type { CollectedSticker, Player } from "../types";

interface AlbumShareInput {
  player: Player | null;
  points: number;
  level: number;
  levelTitle: string;
  stickers: CollectedSticker[];
}

function drawAlbum(ctx: CanvasRenderingContext2D, w: number, h: number, data: AlbumShareInput) {
  // רקע
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#dcfce7");
  grad.addColorStop(1, "#ecfeff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.direction = "rtl";

  // כותרת
  ctx.fillStyle = "#15803d";
  ctx.font = "bold 54px system-ui, sans-serif";
  ctx.fillText("🌱 בלש הצמחים 🔎", w / 2, 90);

  // שם ודרגה
  const name = data.player ? `${data.player.avatar} ${data.player.name}` : "האלבום שלי";
  ctx.fillStyle = "#14532d";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText(name, w / 2, 160);

  ctx.fillStyle = "#ca8a04";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText(`רמה ${data.level} · ${data.levelTitle} · ⭐ ${data.points}`, w / 2, 212);

  ctx.fillStyle = "#15803d";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillText(`אספתי ${data.stickers.length} צמחים!`, w / 2, 262);

  // גריד אימוג'ים
  const cols = 5;
  const startY = 310;
  const cell = (w - 80) / cols;
  data.stickers.slice(0, 40).forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 40 + col * cell + cell / 2;
    const y = startY + row * cell + cell / 2;
    ctx.font = `${Math.floor(cell * 0.5)}px system-ui, sans-serif`;
    ctx.fillText(s.emoji, x, y);
  });

  // כותרת תחתונה
  ctx.fillStyle = "#16a34a";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText("בואו לשחק גם! 🌿", w / 2, h - 30);
}

/** בונה תמונת PNG של האלבום ומשתף/מוריד אותה. מחזיר תיאור תוצאה. */
export async function shareAlbumImage(data: AlbumShareInput): Promise<"shared" | "downloaded" | "error"> {
  try {
    const w = 720;
    const rows = Math.ceil(Math.min(data.stickers.length, 40) / 5);
    const cell = (w - 80) / 5;
    const h = Math.max(560, 310 + rows * cell + 60);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "error";
    drawAlbum(ctx, w, h, data);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );
    if (!blob) return "error";

    const file = new File([blob], "plant-album.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "האלבום שלי — בלש הצמחים",
        text: "תראו כמה צמחים אספתי! 🌱"
      });
      return "shared";
    }

    // נפילה חיננית — הורדה
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plant-album.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return "downloaded";
  } catch {
    return "error";
  }
}
