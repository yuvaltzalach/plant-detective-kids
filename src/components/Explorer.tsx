import type { ReactNode } from "react";
import { GardenTrail, SprigArt } from "./HomeArt";

// שפת "בלש הגינה" — רכיבים קטנים לשימוש חוזר (מסך הבית הוא הרפרנס; שאר המסכים יאמצו אותם בהמשך).
// הסגנון עצמו ב-index.css: .explorer-card (משטח מורם ונלחץ), .icon-well (גומחת אייקון), .explorer-label.

/** כותרת אזור: תווית-חוקר קטנה עם ענף, ושביל גינה מנוקד שממשיך ממנה. */
export function SectionHeading({
  id,
  children,
  trailEnd = "flower"
}: {
  id: string;
  children: ReactNode;
  trailEnd?: "flower" | "bee";
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 id={id} className="explorer-label">
        <SprigArt className="h-4 w-6" />
        {children}
      </h2>
      <GardenTrail end={trailEnd} className="h-[26px] min-w-0 flex-1" />
    </div>
  );
}
