import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./components/TopBar";
import { getAllPlants } from "./lib/content";
import { setMuted } from "./lib/sound";
import { applyUpdateIfReady, onUpdateReady } from "./lib/appUpdate";
import { dateKey } from "./data/challenges";
import { useAuth } from "./hooks/useAuth";
import { useOnlineGroup } from "./hooks/useOnlineGroup";
import { Album } from "./screens/Album";
import { Auth } from "./screens/Auth";
import { Capture } from "./screens/Capture";
import { Challenges } from "./screens/Challenges";
import { Encyclopedia } from "./screens/Encyclopedia";
import { Games, type GameId } from "./screens/Games";
import { QuizGame } from "./screens/games/QuizGame";
import { MemoryGame } from "./screens/games/MemoryGame";
import { SortGame } from "./screens/games/SortGame";
import { TimedGame } from "./screens/games/TimedGame";
import { MatchGame } from "./screens/games/MatchGame";
import { PuzzleGame } from "./screens/games/PuzzleGame";
import { TrueFalseGame } from "./screens/games/TrueFalseGame";
import { Home } from "./screens/Home";
import { Identifying } from "./screens/Identifying";
import { OnlineGroup } from "./screens/OnlineGroup";
import type { HuntOutcome } from "./screens/RacePlay";
import { Parents } from "./screens/Parents";
import { PlantDetail } from "./screens/PlantDetail";
import { StickerDetail } from "./screens/StickerDetail";
import { saveStickerPhoto } from "./lib/photos";
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
  | "sticker"
  | "games"
  | "game"
  | "profile"
  | "parents";

const GAME_COMPONENTS = {
  quiz: QuizGame,
  memory: MemoryGame,
  sort: SortGame,
  timed: TimedGame,
  match: MatchGame,
  puzzle: PuzzleGame,
  truefalse: TrueFalseGame
} as const;

const MUTE_KEY = "plant-detective:muted";
// תמונה שצולמה ועוד לא זוהתה — אם הדף נטען מחדש באמצע (הטלפון סגר אותו ברקע), ממשיכים
// ישר לזיהוי במקום לחזור למסך הבית ולאבד את הצילום.
const PENDING_IMAGE_KEY = "pdk:pendingImage";

function loadPendingImage(): string | null {
  try {
    return sessionStorage.getItem(PENDING_IMAGE_KEY);
  } catch {
    return null;
  }
}

function savePendingImage(dataUrl: string | null) {
  try {
    if (dataUrl) sessionStorage.setItem(PENDING_IMAGE_KEY, dataUrl);
    else sessionStorage.removeItem(PENDING_IMAGE_KEY);
  } catch {
    /* מתעלמים (למשל אם אין מקום) */
  }
}

export default function App() {
  const a = useAuth();
  const [stack, setStack] = useState<Screen[]>(() =>
    loadPendingImage() ? ["home", "identifying"] : ["home"]
  );
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

  const [image, setImage] = useState<string | null>(() => loadPendingImage());

  useEffect(() => {
    // חזרנו לזיהוי שנקטע — רשומת היסטוריה כדי ש"חזור" יחזיר למסך הבית
    if (stack.length > 1) pushHistory(stack.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // גרסה חדשה של האפליקציה מוחלת רק במסך הבית — לא באמצע צילום, זיהוי או משחק
  useEffect(() => {
    if (screen !== "home") return;
    savePendingImage(null); // חזרו לבית — הצילום הקודם כבר לא רלוונטי
    applyUpdateIfReady();
    return onUpdateReady(applyUpdateIfReady);
  }, [screen]);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  const [stickerId, setStickerId] = useState<string | undefined>(undefined);
  const [gameId, setGameId] = useState<GameId | null>(null);
  // משימת צילום במרוץ: אחרי הזיהוי חוזרים למרוץ עם הצמח שנמצא
  const [pendingHunt, setPendingHunt] = useState<{ raceId: string; index: number } | null>(null);
  const [huntOutcome, setHuntOutcome] = useState<HuntOutcome | null>(null);
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
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col">
        <div className="app-bg" aria-hidden="true" />
        <Auth onSignup={a.signup} onLogin={a.login} onForgot={a.forgotInfo} />
      </div>
    );
  }

  return (
    <div className={`relative mx-auto flex min-h-screen max-w-lg flex-col ${screen === "home" ? "" : "garden-inner"}`}>
      <div className="app-bg" aria-hidden="true" />
      {screen !== "home" && screen !== "game" && (
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
          onCapture={() => {
            setPendingHunt(null);
            startCapture();
          }}
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
            savePendingImage(dataUrl);
            setImage(dataUrl);
            setResult(null);
            navTo(pendingHunt ? ["home", "online", "identifying"] : ["home", "identifying"]);
          }}
        />
      )}

      {screen === "identifying" && image && (
        <Identifying
          imageDataUrl={image}
          onResult={(r) => {
            savePendingImage(null);
            // הצילום נשמר (מוקטן, רק במכשיר) כדי להופיע במדבקה באלבום
            if (a.account && image) void saveStickerPhoto(a.account.username, r.collectId, image);
            setResult(r);
            if (pendingHunt) {
              setHuntOutcome({ ...pendingHunt, category: r.category, plantName: r.hebrewName });
              setPendingHunt(null);
              navTo(["home", "online", "result"]);
            } else {
              navTo(["home", "result"]);
            }
          }}
          onRetry={() => {
            savePendingImage(null);
            startCapture();
          }}
        />
      )}

      {screen === "result" && result && (
        <Result
          result={result}
          record={a.record}
          onCapture={startCapture}
          onAlbum={() => navTo(["home", "album"])}
          onBackToRace={huntOutcome ? () => history.back() : undefined}
        />
      )}

      {screen === "album" && (
        <Album
          state={a.state}
          player={meAsPlayer}
          points={a.state.points}
          level={a.level.level}
          username={a.account?.username ?? ""}
          onCapture={startCapture}
          onOpenSticker={(id) => {
            setStickerId(id);
            go("sticker");
          }}
          onDeleteStickers={a.deleteStickers}
        />
      )}

      {screen === "sticker" &&
        (() => {
          const sticker = stickerId ? a.state.stickers[stickerId] : undefined;
          if (!sticker) return null;
          return (
            <StickerDetail
              sticker={sticker}
              plant={plants.find((pl) => pl.id === sticker.collectId)}
              username={a.account?.username ?? ""}
              onDelete={() => {
                a.deleteStickers([sticker.collectId]);
                history.back();
              }}
            />
          );
        })()}

      {screen === "challenges" && (
        <Challenges
          state={a.state}
          challenge={a.challenge}
          onCapture={startCapture}
        />
      )}

      {screen === "online" && (
        <OnlineGroup
          code={online.code}
          members={online.members}
          race={online.race}
          raceResults={online.raceResults}
          status={online.status}
          me={meAsPlayer}
          onJoin={online.join}
          onLeave={online.leave}
          onRefresh={online.refresh}
          onStartRace={online.startRace}
          onEndRace={online.endRace}
          onRaceProgress={online.reportRaceProgress}
          onHunt={(raceId, index) => {
            setPendingHunt({ raceId, index });
            setHuntOutcome(null);
            navTo(["home", "online", "capture"]);
          }}
          huntOutcome={huntOutcome}
          onHuntConsumed={() => setHuntOutcome(null)}
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

      {screen === "games" && (
        <Games
          onOpen={(id) => {
            setGameId(id);
            go("game");
          }}
        />
      )}

      {screen === "game" &&
        gameId &&
        (() => {
          const GameComp = GAME_COMPONENTS[gameId];
          return <GameComp onBack={() => history.back()} />;
        })()}

      {screen === "profile" && a.account && (
        <Profile
          account={a.account}
          onChangeUsername={a.changeUsername}
          onUpdateProfile={a.updateProfile}
        />
      )}

      {screen === "parents" && (
        <Parents
          children={a.children}
          onRefreshChildren={a.refreshChildren}
          onLinkChild={a.linkChildAccount}
          onDeleteChild={a.deleteChildAccount}
          onResetChildPassword={a.resetChildPassword}
        />
      )}

      {/* במסך הבית הכלבלב הגדול הוא בּוֹטִי — אין צורך בדמות הצפה */}
      {screen !== "home" && <BotiMascot />}
    </div>
  );
}
