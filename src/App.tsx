import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { getAllPlants } from "./lib/content";
import { setMuted } from "./lib/sound";
import { dateKey } from "./data/challenges";
import { useProgress } from "./hooks/useProgress";
import { Album } from "./screens/Album";
import { Capture } from "./screens/Capture";
import { Challenges } from "./screens/Challenges";
import { Home } from "./screens/Home";
import { Identifying } from "./screens/Identifying";
import { Result } from "./screens/Result";
import type { PlantResult } from "./types";

type Screen = "home" | "capture" | "identifying" | "result" | "album" | "challenges";

const MUTE_KEY = "plant-detective:muted";

export default function App() {
  const { state, record, level, stickerCount } = useProgress();
  const [screen, setScreen] = useState<Screen>("home");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [muted, setMutedState] = useState(() => localStorage.getItem(MUTE_KEY) === "1");

  useEffect(() => {
    setMuted(muted);
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  const totalPlants = getAllPlants().length;
  const challengeDoneToday = state.lastChallengeDate === dateKey();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {screen !== "home" && (
        <TopBar
          points={state.points}
          level={level.level}
          inLevel={level.inLevel}
          onHome={() => setScreen("home")}
          muted={muted}
          onToggleMute={() => setMutedState((m) => !m)}
        />
      )}

      {screen === "home" && (
        <Home
          stickerCount={stickerCount}
          totalPlants={totalPlants}
          challengeDoneToday={challengeDoneToday}
          onCapture={() => setScreen("capture")}
          onAlbum={() => setScreen("album")}
          onChallenges={() => setScreen("challenges")}
        />
      )}

      {screen === "capture" && (
        <Capture
          onImage={(dataUrl) => {
            setImage(dataUrl);
            setResult(null);
            setScreen("identifying");
          }}
        />
      )}

      {screen === "identifying" && image && (
        <Identifying
          imageDataUrl={image}
          onResult={(r) => {
            setResult(r);
            setScreen("result");
          }}
          onRetry={() => setScreen("capture")}
        />
      )}

      {screen === "result" && result && (
        <Result
          result={result}
          record={record}
          onCapture={() => setScreen("capture")}
          onAlbum={() => setScreen("album")}
        />
      )}

      {screen === "album" && <Album state={state} onCapture={() => setScreen("capture")} />}

      {screen === "challenges" && (
        <Challenges state={state} onCapture={() => setScreen("capture")} />
      )}
    </div>
  );
}
