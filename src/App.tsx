import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./components/TopBar";
import { getAllPlants } from "./lib/content";
import { setMuted } from "./lib/sound";
import { dateKey } from "./data/challenges";
import { useAuth } from "./hooks/useAuth";
import { useOnlineGroup } from "./hooks/useOnlineGroup";
import { Album } from "./screens/Album";
import { Auth } from "./screens/Auth";
import { Capture } from "./screens/Capture";
import { Challenges } from "./screens/Challenges";
import { Encyclopedia } from "./screens/Encyclopedia";
import { Games } from "./screens/Games";
import { Home } from "./screens/Home";
import { Identifying } from "./screens/Identifying";
import { OnlineGroup } from "./screens/OnlineGroup";
import { Parents } from "./screens/Parents";
import { Result } from "./screens/Result";
import type { PlantResult, Player } from "./types";

type Screen =
  | "home"
  | "capture"
  | "identifying"
  | "result"
  | "album"
  | "challenges"
  | "online"
  | "encyclopedia"
  | "games"
  | "parents";

const MUTE_KEY = "plant-detective:muted";

export default function App() {
  const a = useAuth();
  const [stack, setStack] = useState<Screen[]>(["home"]);
  const screen = stack[stack.length - 1];

  // ניווט: כל העמקה דוחפת רשומת היסטוריה, כדי שכפתור "חזור" של אנדרואיד יעבוד
  const navigate = (next: Screen[]) => {
    setStack((prev) => {
      const diff = next.length - prev.length;
      for (let i = 0; i < diff; i++) {
        try {
          history.pushState({ pdk: true }, "");
        } catch {
          /* מתעלמים */
        }
      }
      return next;
    });
  };
  const go = (s: Screen) => navigate([...stack, s]);
  const startCapture = () => navigate(["home", "capture"]);

  useEffect(() => {
    const onPop = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [encOpenId, setEncOpenId] = useState<string | undefined>(undefined);
  const [muted, setMutedState] = useState(() => localStorage.getItem(MUTE_KEY) === "1");

  useEffect(() => {
    setMuted(muted);
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  const plants = getAllPlants();
  const challengeDoneToday = a.state.lastChallengeDate === dateKey();
  const plantOfDay = useMemo(() => {
    const dayNumber = Math.floor(Date.now() / 86_400_000);
    return plants[dayNumber % plants.length];
  }, [plants]);

  const meAsPlayer: Player | null = a.account
    ? { id: a.account.username, name: a.account.username, avatar: a.account.avatar, createdAt: 0 }
    : null;
  const stats = {
    points: a.state.points,
    stickers: a.stickerCount,
    badges: a.state.badges.length,
    level: a.level.level
  };
  const online = useOnlineGroup(meAsPlayer, stats);

  const openEncyclopedia = (id?: string) => {
    setEncOpenId(id);
    go("encyclopedia");
  };

  // לא מחוברים → מסך חשבון
  if (!a.isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col">
        <Auth onSignup={a.signup} onLogin={a.login} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {screen !== "home" && (
        <TopBar
          points={a.state.points}
          level={a.level.level}
          inLevel={a.level.inLevel}
          showProgress={screen !== "parents"}
          onBack={() => history.back()}
          muted={muted}
          onToggleMute={() => setMutedState((m) => !m)}
        />
      )}

      {screen === "home" && (
        <Home
          account={a.account}
          level={a.level.level}
          stickerCount={a.stickerCount}
          totalPlants={plants.length}
          challenge={a.challenge}
          challengeDoneToday={challengeDoneToday}
          plantOfDay={plantOfDay}
          onCapture={startCapture}
          onAlbum={() => go("album")}
          onChallenges={() => go("challenges")}
          onOnline={() => go("online")}
          onEncyclopedia={() => openEncyclopedia(undefined)}
          onPlantOfDay={() => openEncyclopedia(plantOfDay.id)}
          onGames={() => go("games")}
          onParents={() => go("parents")}
          onLogout={a.logout}
          onUpdateAvatar={a.updateAvatar}
          onChangeUsername={a.changeUsername}
        />
      )}

      {screen === "capture" && (
        <Capture
          onImage={(dataUrl) => {
            setImage(dataUrl);
            setResult(null);
            navigate(["home", "identifying"]);
          }}
        />
      )}

      {screen === "identifying" && image && (
        <Identifying
          imageDataUrl={image}
          onResult={(r) => {
            setResult(r);
            navigate(["home", "result"]);
          }}
          onRetry={startCapture}
        />
      )}

      {screen === "result" && result && (
        <Result
          result={result}
          record={a.record}
          onCapture={startCapture}
          onAlbum={() => navigate(["home", "album"])}
        />
      )}

      {screen === "album" && (
        <Album
          state={a.state}
          player={meAsPlayer}
          points={a.state.points}
          level={a.level.level}
          onCapture={startCapture}
        />
      )}

      {screen === "challenges" && (
        <Challenges
          state={a.state}
          challenge={a.challenge}
          onCapture={startCapture}
          onCompleteManually={a.completeChallenge}
        />
      )}

      {screen === "online" && (
        <OnlineGroup
          code={online.code}
          members={online.members}
          challenge={online.challenge}
          status={online.status}
          me={meAsPlayer}
          onJoin={online.join}
          onLeave={online.leave}
          onRefresh={online.refresh}
          onSetChallenge={online.updateGroupChallenge}
          onCompleteChallenge={online.completeGroupChallenge}
        />
      )}

      {screen === "encyclopedia" && <Encyclopedia state={a.state} initialOpenId={encOpenId} />}

      {screen === "games" && <Games />}

      {screen === "parents" && (
        <Parents
          settings={a.settings}
          children={a.children}
          onRefreshChildren={a.refreshChildren}
          onLinkChild={a.linkChildAccount}
          onDeleteChild={a.deleteChildAccount}
          onResetChildPassword={a.resetChildPassword}
          onSetChallenge={a.updateCustomChallenge}
          onClearChallenge={() => a.updateCustomChallenge(null)}
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
