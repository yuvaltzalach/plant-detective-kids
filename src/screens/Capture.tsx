import { useRef } from "react";
import { fileToDataUrl } from "../lib/identify";
import { playPop } from "../lib/sound";

interface CaptureProps {
  onImage: (dataUrl: string) => void;
}

export function Capture({ onImage }: CaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    onImage(dataUrl);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 pb-10">
      <div className="text-center">
        <div className="text-6xl animate-float">📸</div>
        <h2 className="mt-3 text-2xl font-black text-leaf-dark">בואו נצלם צמח!</h2>
        <p className="mt-1 text-leaf-dark/70">כוונו את המצלמה לעלה, לפרח או לעץ</p>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <button
        onClick={() => {
          playPop();
          cameraRef.current?.click();
        }}
        className="big-btn w-full max-w-xs bg-gradient-to-b from-leaf to-leaf-dark"
      >
        📷 פתחו מצלמה
      </button>

      <button
        onClick={() => {
          playPop();
          galleryRef.current?.click();
        }}
        className="big-btn w-full max-w-xs bg-sky"
      >
        🖼️ בחרו תמונה מהגלריה
      </button>
    </div>
  );
}
