import { MascotView, mascotById } from "../data/mascots";
import { useMascotId } from "../lib/mascotPref";
import { RiddleCloud, RiddlePopup, useBotiRiddle } from "./BotiRiddle";

export function BotiMascot() {
  const { plant, bubbleOpen, popupOpen, toggleBubble, openPopup, closePopup } = useBotiRiddle();
  const mascotId = useMascotId();

  const currentMascot = mascotById(mascotId);

  return (
    <>
      {/* בּוֹטִי — קבוע בצד שמאל למעלה, בלי ריחוף. הענן נפתח רק בלחיצה, ומופיע מימין לדמות. */}
      <div className="fixed left-2 top-24 z-50 flex items-center gap-3" dir="ltr">
        <button onClick={toggleBubble} className="shrink-0 drop-shadow-xl active:scale-90" aria-label="הדמות שלי">
          <MascotView mascot={currentMascot} size={68} />
        </button>

        {bubbleOpen && <RiddleCloud plant={plant} onOpen={openPopup} />}
      </div>

      {popupOpen && <RiddlePopup plant={plant} onClose={closePopup} />}
    </>
  );
}
