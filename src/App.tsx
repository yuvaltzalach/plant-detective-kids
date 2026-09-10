import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./components/TopBar";
import { getAllPlants } from "./lib/content";
import { setMuted } from "./lib/sound";
import { dateKey } from "./data/challenges";
import { useProgress } from "./hooks/useProgress";
import { useOnlineGroup } from "./hooks/useOnlineGroup";
import { Album } from "./screens/Album";
import { Capture } from "./screens/Capture";
import { Challenges } from "./screens/Challenges";
import { Encyclopedia } from "./screens/Encyclopedia";
import { Games } from "./screens/Games";
import { Home } from "./screens/Home";
import { Identifying } from "./screens/Identifying";
import { Login } from "./screens/Login";
import { OnlineGroup } from "./screens/OnlineGroup";
import { Parents } from "./screens/Parents";
import { Players } from "./screens/Players";
import { Result } from "./screens/Result";
import type { PlantResult } from "./types";

type Screen =
  | "login"
  | "home"
  | "capture"
  | "identifying"
  | "result"
  | "album"
  | "challenges"
  | "players"
  | "online"
  | "encyclopedia"
  | "games"
  | "parents";

const MUTE_KEY = "plant-detective:muted";

export default function App() {
  const p = useProgress();
  const [screen, setScreen] = useState<Screen>("login");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [encOpenId, setEncOpenId] = useState<string | undefined>(undefined);
  const [muted, setMutedState] = useState(() => localStorage.getItem(MUTE_KEY) === "1");

  useEffect(() => {
    setMuted(muted);
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  const plants = getAllPlants();
  const totalPlants = plants.length;
  const challengeDoneToday = p.state.lastChallengeDate === dateKey();

  // צמח היום — קבוע לפי התאריך
  const plantOfDay = useMemo(() => {
    const dayNumber = Math.floor(Date.now() / 86_400_000);
    return plants[dayNumber % plants.length];
  }, [plants]);

  // אונליין — מסנכרן את נתוני השחקן/ית הפעיל/ה
  const stats = {
    points: p.state.points,
    stickers: p.stickerCount,
    badges: p.state.badges.length,
    level: p.level.level
  };
  const online = useOnlineGroup(p.activePlayer, stats);

  const openEncyclopedia = (id?: string) => {
    setEncOpenId(id);
    setScreen("encyclopedia");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {screen !== "home" && screen !== "login" && (
        <TopBar
          points={p.state.points}
          level={p.level.level}
          inLevel={p.level.inLevel}
          onHome={() => setScreen("home")}
          muted={muted}
          onToggleMute={() => setMutedState((m) => !m)}
        />
      )}

      {screen === "login" && (
        <Login
          players={p.players}
          onSelect={(id) => {
            p.switchPlayer(id);
            setScreen("home");
          }}
          onCreate={(name, avatar) => {
            p.createPlayer(name, avatar);
            setScreen("home");
          }}
        />
      )}

      {screen === "home" && (
        <Home
          activePlayer={p.activePlayer}
          playerCount={p.players.length}
          level={p.level.level}
          stickerCount={p.stickerCount}
          totalPlants={totalPlants}
          challenge={p.challenge}
          challengeDoneToday={challengeDoneToday}
          plantOfDay={plantOfDay}
          onCapture={() => setScreen("capture")}
          onAlbum={() => setScreen("album")}
          onChallenges={() => setScreen("challenges")}
          onPlayers={() => setScreen("players")}
          onOnline={() => setScreen("online")}
          onEncyclopedia={() => openEncyclopedia(undefined)}
          onPlantOfDay={() => openEncyclopedia(plantOfDay.id)}
          onGames={() => setScreen("games")}
          onSwitchAccount={() => setScreen("login")}
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

      {screen === "album" && (
        <Album
          state={p.state}
          player={p.activePlayer}
          points={p.state.points}
          level={p.level.level}
          onCapture={() => setScreen("capture")}
        />
      )}

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

      {screen === "online" && (
        <OnlineGroup
          code={online.code}
          members={online.members}
          challenge={online.challenge}
          status={online.status}
          me={p.activePlayer}
          onJoin={online.join}
          onLeave={online.leave}
          onRefresh={online.refresh}
          onSetChallenge={online.updateGroupChallenge}
          onCompleteChallenge={online.completeGroupChallenge}
        />
      )}

      {screen === "encyclopedia" && <Encyclopedia state={p.state} initialOpenId={encOpenId} />}

      {screen === "games" && <Games />}

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
          online={{
            code: online.code,
            challenge: online.challenge,
            join: online.join,
            leave: online.leave,
            updateGroupChallenge: online.updateGroupChallenge
          }}
        />
      )}
    </div>
  );
}
