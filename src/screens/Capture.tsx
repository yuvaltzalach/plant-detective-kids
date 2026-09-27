import { useEffect, useRef, useState } from "react";
import { drawToJpeg, prepareImage } from "../lib/identify";
import { playPop } from "../lib/sound";

interface CaptureProps {
  onImage: (dataUrl: string) => void;
}

type CameraState = "starting" | "live" | "unavailable";

/**
 * צילום בתוך האפליקציה (getUserMedia): הדף לא עובר לאפליקציית המצלמה של הטלפון, ולכן
 * אנדרואיד לא "הורג" אותו באמצע (מה שהחזיר למסך הבית בלי זיהוי). אם אין הרשאה או
 * שהדפדפן לא תומך — חוזרים למצלמה הרגילה של הטלפון / לגלריה.
 */
export function Capture({ onImage }: CaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<CameraState>("starting");
  const [busy, setBusy] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("unavailable");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          void video.play().catch(() => undefined);
        }
        setCamera("live");
      })
      .catch(() => {
        if (!cancelled) setCamera("unavailable");
      });
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, []);

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || busy) return;
    playPop();
    setBusy(true);
    const dataUrl = drawToJpeg(video, video.videoWidth, video.videoHeight);
    stopCamera();
    onImage(dataUrl);
  };

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    stopCamera();
    onImage(await prepareImage(file));
  }

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );

  const galleryButton = (
    <button
      onClick={() => {
        playPop();
        galleryRef.current?.click();
      }}
      className="big-btn w-full max-w-xs bg-sky"
    >
      🖼️ בחרו תמונה מהגלריה
    </button>
  );

  if (camera !== "unavailable") {
    return (
      <div className="flex flex-1 flex-col items-center gap-4 px-5 pb-8 pt-2">
        {inputs}
        <p className="text-center font-bold text-leaf-dark">כוונו את המצלמה לעלה, לפרח או לעץ 🌿</p>
        <div className="relative w-full max-w-md overflow-hidden rounded-blob bg-black shadow-lg">
          <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover" />
          {camera === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
              פותחים מצלמה… 📷
            </div>
          )}
        </div>
        <button
          onClick={snap}
          disabled={camera !== "live" || busy}
          aria-label="צלמו"
          className="h-20 w-20 rounded-full border-8 border-white bg-leaf shadow-xl active:scale-90 disabled:opacity-40"
        />
        {galleryButton}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 pb-10">
      {inputs}
      <div className="text-center">
        <div className="text-6xl animate-float">📸</div>
        <h2 className="mt-3 text-2xl font-black text-leaf-dark">בואו נצלם צמח!</h2>
        <p className="mt-1 text-leaf-dark/80">כוונו את המצלמה לעלה, לפרח או לעץ</p>
      </div>

      <button
        onClick={() => {
          playPop();
          cameraRef.current?.click();
        }}
        disabled={busy}
        className="big-btn w-full max-w-xs bg-gradient-to-b from-leaf to-leaf-dark"
      >
        📷 פתחו מצלמה
      </button>

      {galleryButton}
    </div>
  );
}
