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
  // מחסנית ניווט — כדי ש"חזרה" תחזור באמת למסך הקודם
  const [stack, setStack] = useState<Screen[]>(["login"]);
  const screen = stack[stack.length - 1];
  const go = (s: Screen) => setStack((st) => [...st, s]);
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
  const resetTo = (s: Screen) => setStack([s]);

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

  const plantOfDay = useMemo(() => {
    const dayNumber = Math.floor(Date.now() / 86_400_000);
    return plants[dayNumber % plants.length];
  }, [plants]);

  const stats = {
    points: p.state.points,
    stickers: p.stickerCount,
    badges: p.state.badges.length,
    level: p.level.level
  };
  const online = useOnlineGroup(p.activePlayer, stats);

  const startCapture = () => setStack(["home", "capture"]);
  const openEncyclopedia = (id?: string) => {
    setEncOpenId(id);
    go("encyclopedia");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {screen !== "home" && screen !== "login" && (
        <TopBar
          points={p.state.points}
          level={p.level.level}
          inLevel={p.level.inLevel}
          showProgress={screen !== "parents"}
          onBack={back}
          muted={muted}
          onToggleMute={() => setMutedState((m) => !m)}
        />
      )}

      {screen === "login" && (
        <Login
          players={p.players}
          onSelect={(id) => {
            p.switchPlayer(id);
            resetTo("home");
          }}
          onCreate={(name, avatar) => {
            p.createPlayer(name, avatar);
            resetTo("home");
          }}
          onLoginCode={async (code) => {
            const res = await p.loginWithCode(code);
            if (res === "ok") resetTo("home");
            return res;
          }}
          onParent={() => go("parents")}
        />
      )}

      {screen === "home" && (
        <Home
          activePlayer={p.activePlayer}
          level={p.level.level}
          stickerCount={p.stickerCount}
          totalPlants={totalPlants}
          challenge={p.challenge}
          challengeDoneToday={challengeDoneToday}
          plantOfDay={plantOfDay}
          onCapture={startCapture}
          onAlbum={() => go("album")}
          onChallenges={() => go("challenges")}
          onPlayers={() => go("players")}
          onOnline={() => go("online")}
          onEncyclopedia={() => openEncyclopedia(undefined)}
          onPlantOfDay={() => openEncyclopedia(plantOfDay.id)}
          onGames={() => go("games")}
          onLogout={() => resetTo("login")}
        />
      )}

      {screen === "capture" && (
        <Capture
          onImage={(dataUrl) => {
            setImage(dataUrl);
            setResult(null);
            setStack(["home", "identifying"]);
          }}
        />
      )}

      {screen === "identifying" && image && (
        <Identifying
          imageDataUrl={image}
          onResult={(r) => {
            setResult(r);
            setStack(["home", "result"]);
          }}
          onRetry={startCapture}
        />
      )}

      {screen === "result" && result && (
        <Result
          result={result}
          record={p.record}
          onCapture={startCapture}
          onAlbum={() => setStack(["home", "album"])}
        />
      )}

      {screen === "album" && (
        <Album
          state={p.state}
          player={p.activePlayer}
          points={p.state.points}
          level={p.level.level}
          onCapture={startCapture}
        />
      )}

      {screen === "challenges" && (
        <Challenges
          state={p.state}
          challenge={p.challenge}
          onCapture={startCapture}
          onCompleteManually={p.completeChallenge}
        />
      )}

      {screen === "players" && (
        <Players leaderboard={p.leaderboard} activeId={p.activePlayer?.id ?? ""} />
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
          children={p.children}
          onSetChallenge={p.updateCustomChallenge}
          onClearChallenge={() => p.updateCustomChallenge(null)}
          onCreatePlayer={p.createChild}
          onEditPlayer={p.editPlayer}
          onDeletePlayer={p.deletePlayer}
          onResetChild={p.resetChild}
          onLinkCloud={p.linkPlayerToCloud}
          onRefreshChild={p.refreshChild}
          onAddChildByCode={p.addChildByCode}
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
