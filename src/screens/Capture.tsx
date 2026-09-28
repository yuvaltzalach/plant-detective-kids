import { useEffect, useRef, useState } from "react";
import { drawToJpeg, prepareImage } from "../lib/identify";
import { playPop } from "../lib/sound";

interface CaptureProps {
  onImage: (dataUrl: string) => void;
}

type CameraState = "starting" | "live" | "unavailable";
/** למה המצלמה הפנימית לא נפתחה — מוצג לילד/להורה במקום לעבור בשקט למצלמת הטלפון */
type CameraProblem = "denied" | "unsupported" | "inapp" | "error";

/** דפדפן מובנה של וואטסאפ/אינסטגרם/פייסבוק וכו' — לרוב לא מאפשר מצלמה בתוך הדף */
function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(navigator.userAgent);
}

const PROBLEM_TEXT: Record<CameraProblem, string> = {
  denied:
    "לא נתתם לאפליקציה הרשאה למצלמה. כדי לאשר: לוחצים על סמל המנעול ליד כתובת האתר (או בהגדרות האתר) ← מצלמה ← אישור, ואז \"נסו שוב\".",
  unsupported: "הדפדפן הזה לא מאפשר מצלמה בתוך האפליקציה. אפשר לצלם עם מצלמת הטלפון.",
  inapp: "האפליקציה נפתחה מתוך וואטסאפ/אינסטגרם, ושם אין מצלמה פנימית. פתחו את הקישור בכרום (⋮ ← פתיחה בדפדפן).",
  error: "המצלמה לא נפתחה (אולי אפליקציה אחרת משתמשת בה). נסו שוב, או צלמו עם מצלמת הטלפון."
};

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
  const [problem, setProblem] = useState<CameraProblem | null>(null);
  const [attempt, setAttempt] = useState(0);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    setCamera("starting");
    setProblem(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setProblem(isInAppBrowser() ? "inapp" : "unsupported");
      setCamera("unavailable");
      return;
    }
    // מנסים קודם באיכות גבוהה ובמצלמה האחורית; יש טלפונים שנכשלים עם דרישות — אז בפשטות
    const tries: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
      { video: { facingMode: "environment" }, audio: false },
      { video: true, audio: false }
    ];
    (async () => {
      let lastError: unknown = null;
      for (const c of tries) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(c);
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
          return;
        } catch (e) {
          lastError = e;
          // בלי הרשאה אין טעם לנסות שוב עם הגדרות אחרות
          if (e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError")) break;
        }
      }
      if (cancelled) return;
      const name = lastError instanceof DOMException ? lastError.name : "";
      setProblem(
        name === "NotAllowedError" || name === "SecurityError"
          ? isInAppBrowser()
            ? "inapp"
            : "denied"
          : isInAppBrowser()
            ? "inapp"
            : "error"
      );
      setCamera("unavailable");
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [attempt]);

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

      {problem && (
        <div className="w-full max-w-xs rounded-2xl bg-amber-100 p-3 text-center text-sm font-bold text-amber-800">
          {PROBLEM_TEXT[problem]}
          {problem !== "unsupported" && (
            <button
              onClick={() => {
                playPop();
                setAttempt((n) => n + 1);
              }}
              className="mt-2 block w-full rounded-full bg-amber-500 px-4 py-2 text-white"
            >
              🔄 נסו שוב את המצלמה של האפליקציה
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => {
          playPop();
          cameraRef.current?.click();
        }}
        disabled={busy}
        className="big-btn w-full max-w-xs bg-gradient-to-b from-leaf to-leaf-dark"
      >
        📷 צלמו עם מצלמת הטלפון
      </button>

      {galleryButton}
    </div>
  );
}
