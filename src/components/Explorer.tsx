import type { ReactNode } from "react";
import { MarkerLeaves } from "./Garden";

// שפת "בלש הגינה" — רכיבים קטנים לשימוש חוזר (מסך הבית הוא הרפרנס; שאר המסכים יאמצו אותם בהמשך).
// הסגנון עצמו ב-index.css: .explorer-card (משטח מורם ונלחץ), .garden-marker (סמן גינה),
// .station-object / .tile-object / .album-object (חפצים שבולטים מהכרטיס).

/** כותרת אזור: סמן-גינה קליל עם עלים וניצן, ואופציונלית מקטע קצר משביל בּוֹטִי בצד השני. */
export function SectionHeading({
  id,
  children,
  accessory
}: {
  id: string;
  children: ReactNode;
  accessory?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <h2 id={id} className="garden-marker">
        <MarkerLeaves className="garden-marker__leaves" />
        {children}
      </h2>
      {accessory && (
        <span className="section-heading__trail" aria-hidden="true">
          {accessory}
        </span>
      )}
    </div>
  );
}
