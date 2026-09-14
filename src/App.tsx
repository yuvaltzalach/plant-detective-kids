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
import { PlantDetail } from "./screens/PlantDetail";
import { Profile } from "./screens/Profile";
import { Result } from "./screens/Result";
import { BotiMascot } from "./components/BotiMascot";
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
  | "plant"
  | "games"
  | "profile"
  | "parents";

const MUTE_KEY = "plant-detective:muted";

export default function App() {
  const a = useAuth();
  const [stack, setStack] = useState<Screen[]>(["home"]);
  const screen = stack[stack.length - 1];

  // ניווט: כל העמקה דוחפת רשומת היסטוריה, כדי שכפתור "חזור" (של האפליקציה ושל אנדרואיד)
  // יחזור צעד אחד אחורה בלבד.
  const pushHistory = (n: number) => {
    for (let i = 0; i < n; i++) {
      try {
        history.pushState({ pdk: true }, "");
      } catch {
        /* מתעלמים */
      }
    }
  };
  const navTo = (next: Screen[]) => {
    pushHistory(Math.max(0, next.length - stack.length));
    setStack(next);
  };
  const go = (s: Screen) => navTo([...stack, s]);
  const startCapture = () => navTo(["home", "capture"]);

  useEffect(() => {
    const onPop = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
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

  const openDetail = (id: string) => {
    setDetailId(id);
    go("plant");
  };

  // לא מחוברים → מסך חשבון
  if (!a.isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col">
        <Auth onSignup={a.signup} onLogin={a.login} onForgot={a.forgotInfo} />
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
          onEncyclopedia={() => go("encyclopedia")}
          onPlantOfDay={() => openDetail(plantOfDay.id)}
          onGames={() => go("games")}
          onParents={() => go("parents")}
          onLogout={a.logout}
          onProfile={() => go("profile")}
        />
      )}

      {screen === "capture" && (
        <Capture
          onImage={(dataUrl) => {
            setImage(dataUrl);
            setResult(null);
            navTo(["home", "identifying"]);
          }}
        />
      )}

      {screen === "identifying" && image && (
        <Identifying
          imageDataUrl={image}
          onResult={(r) => {
            setResult(r);
            navTo(["home", "result"]);
          }}
          onRetry={startCapture}
        />
      )}

      {screen === "result" && result && (
        <Result
          result={result}
          record={a.record}
          onCapture={startCapture}
          onAlbum={() => navTo(["home", "album"])}
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

      {screen === "encyclopedia" && (
        <Encyclopedia state={a.state} onOpenPlant={openDetail} />
      )}

      {screen === "plant" &&
        (() => {
          const plant = plants.find((pl) => pl.id === detailId);
          return plant ? (
            <PlantDetail plant={plant} collected={!!a.state.stickers[plant.id]} />
          ) : null;
        })()}

      {screen === "games" && <Games />}

      {screen === "profile" && a.account && (
        <Profile
          account={a.account}
          onChangeUsername={a.changeUsername}
          onUpdateProfile={a.updateProfile}
        />
      )}

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

      <BotiMascot />
    </div>
  );
}
