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
import { Parents } from "./screens/Parents";
import { Players } from "./screens/Players";
import { Result } from "./screens/Result";
import type { PlantResult } from "./types";

type Screen =
  | "home"
  | "capture"
  | "identifying"
  | "result"
  | "album"
  | "challenges"
  | "players"
  | "parents";

const MUTE_KEY = "plant-detective:muted";

export default function App() {
  const p = useProgress();
  const [screen, setScreen] = useState<Screen>("home");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [muted, setMutedState] = useState(() => localStorage.getItem(MUTE_KEY) === "1");

  useEffect(() => {
    setMuted(muted);
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  const totalPlants = getAllPlants().length;
  const challengeDoneToday = p.state.lastChallengeDate === dateKey();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {screen !== "home" && (
        <TopBar
          points={p.state.points}
          level={p.level.level}
          inLevel={p.level.inLevel}
          onHome={() => setScreen("home")}
          muted={muted}
          onToggleMute={() => setMutedState((m) => !m)}
        />
      )}

      {screen === "home" && (
        <Home
          activePlayer={p.activePlayer}
          playerCount={p.players.length}
          stickerCount={p.stickerCount}
          totalPlants={totalPlants}
          challenge={p.challenge}
          challengeDoneToday={challengeDoneToday}
          onCapture={() => setScreen("capture")}
          onAlbum={() => setScreen("album")}
          onChallenges={() => setScreen("challenges")}
          onPlayers={() => setScreen("players")}
          onParents={() => setScreen("parents")}
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
          record={p.record}
          onCapture={() => setScreen("capture")}
          onAlbum={() => setScreen("album")}
        />
      )}

      {screen === "album" && <Album state={p.state} onCapture={() => setScreen("capture")} />}

      {screen === "challenges" && (
        <Challenges
          state={p.state}
          challenge={p.challenge}
          onCapture={() => setScreen("capture")}
          onCompleteManually={p.completeChallenge}
        />
      )}

      {screen === "players" && (
        <Players
          leaderboard={p.leaderboard}
          activeId={p.activePlayer?.id ?? ""}
          onSwitch={(id) => {
            p.switchPlayer(id);
            setScreen("home");
          }}
          onCreate={p.createPlayer}
        />
      )}

      {screen === "parents" && (
        <Parents
          settings={p.settings}
          players={p.players}
          activeId={p.activePlayer?.id ?? ""}
          onSetChallenge={p.updateCustomChallenge}
          onClearChallenge={() => p.updateCustomChallenge(null)}
          onResetActive={p.resetActive}
          onCreatePlayer={p.createPlayer}
          onEditPlayer={p.editPlayer}
          onDeletePlayer={p.deletePlayer}
        />
      )}
    </div>
  );
}
