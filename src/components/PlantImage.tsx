import { useEffect, useState } from "react";
import { resolvePlantImage, upscale } from "../lib/images";
import type { PlantContent } from "../types";

interface PlantImageProps {
  plant: PlantContent;
  className?: string;
  /** תמונה גדולה (מסך פירוט) — מבקש רזולוציה גבוהה יותר. */
  big?: boolean;
}

/** מציג תמונה אמיתית של הצמח; עד שנטענת (או אם אין) מציג את האימוג'י כרקע ידידותי. */
export function PlantImage({ plant, className = "", big = false }: PlantImageProps) {
  const [url, setUrl] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setUrl(undefined);
    resolvePlantImage(plant).then((u) => {
      if (!cancelled) setUrl(u ? (big ? upscale(u, 640) : u) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [plant.id, big]);

  if (url) {
    return (
      <img
        src={url}
        alt={plant.hebrewName}
        loading="lazy"
        onError={() => setUrl(null)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-leaf-light ${className}`}>
      <span className="text-5xl">{url === undefined ? "⏳" : plant.emoji}</span>
    </div>
  );
}
