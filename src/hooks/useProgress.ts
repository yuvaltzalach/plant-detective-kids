import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FindOutcome,
  completeChallengeManually,
  emptyState,
  levelForPoints,
  recordFind
} from "../lib/progress";
import {
  activeChallenge,
  addPlayer,
  ensureActivePlayer,
  findPlayerByCloud,
  getActivePlayerId,
  loadPlayers,
  loadProgressFor,
  loadSettings,
  removePlayer,
  renamePlayer,
  saveProgressFor,
  setActivePlayerId,
  setCustomChallenge,
  setPlayerCloudCode
} from "../lib/players";
import { createAccount, getAccount, saveAccount } from "../lib/account";
import type { AppSettings, CustomChallenge, PlantResult, Player, ProgressState } from "../types";

export interface LeaderRow {
  player: Player;
  points: number;
  stickers: number;
  badges: number;
  level: number;
}

export function useProgress() {
  const [players, setPlayers] = useState<Player[]>(() => ensureActivePlayer());
  const [activeId, setActiveId] = useState<string>(() => getActivePlayerId()!);
  const [state, setState] = useState<ProgressState>(() => loadProgressFor(getActivePlayerId()!));
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const record = useCallback(
    (result: PlantResult): FindOutcome => {
      const outcome = recordFind(
        loadProgressFor(activeId),
        result,
        new Date(),
        activeChallenge(loadSettings())
      );
      saveProgressFor(activeId, outcome.state);
      setState(outcome.state);
      return outcome;
    },
    [activeId]
  );

  const completeChallenge = useCallback((): FindOutcome => {
    const outcome = completeChallengeManually(loadProgressFor(activeId));
    saveProgressFor(activeId, outcome.state);
    setState(outcome.state);
    return outcome;
  }, [activeId]);

  const switchPlayer = useCallback((id: string) => {
    setActivePlayerId(id);
    setActiveId(id);
    setState(loadProgressFor(id));
  }, []);

  const createPlayer = useCallback((name: string, avatar: string) => {
    const p = addPlayer(name, avatar);
    setPlayers(loadPlayers());
    switchPlayer(p.id);
    return p;
  }, [switchPlayer]);

  const editPlayer = useCallback((id: string, name: string, avatar?: string) => {
    renamePlayer(id, name, avatar);
    setPlayers(loadPlayers());
  }, []);

  const deletePlayer = useCallback((id: string) => {
    removePlayer(id);
    ensureActivePlayer();
    setPlayers(loadPlayers());
    const na = getActivePlayerId()!;
    setActiveId(na);
    setState(loadProgressFor(na));
  }, []);

  const resetActive = useCallback(() => {
    const fresh = emptyState();
    saveProgressFor(activeId, fresh);
    setState(fresh);
  }, [activeId]);

  const updateCustomChallenge = useCallback((challenge: CustomChallenge | null) => {
    setCustomChallenge(challenge);
    setSettings(loadSettings());
  }, []);

  // סנכרון אוטומטי לענן עבור משתתף שמקושר לחשבון אונליין
  useEffect(() => {
    const ap = players.find((x) => x.id === activeId);
    if (ap?.cloudCode) {
      void saveAccount(ap.cloudCode, { name: ap.name, avatar: ap.avatar, progress: state });
    }
  }, [activeId, state, players]);

  /** יוצר חשבון אונליין למשתתף ומקשר אותו — מחזיר את הקוד האישי. */
  const linkPlayerToCloud = useCallback(async (id: string): Promise<string | null> => {
    const pl = loadPlayers().find((x) => x.id === id);
    if (!pl) return null;
    if (pl.cloudCode) return pl.cloudCode;
    const acc = await createAccount(pl.name, pl.avatar, loadProgressFor(id));
    if (!acc) return null;
    setPlayerCloudCode(id, acc.code);
    setPlayers(loadPlayers());
    return acc.code;
  }, []);

  /** התחברות עם קוד אישי — מושך את החשבון ומסנכרן אותו למכשיר הזה. */
  const loginWithCode = useCallback(
    async (rawCode: string): Promise<"ok" | "not-found" | "offline"> => {
      const code = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
      if (!code) return "not-found";
      const res = await getAccount(code);
      if (!res.ok) return res.reason;

      const acc = res.account;
      const prog: ProgressState = { ...emptyState(), ...(acc.progress ?? {}) };
      const existing = findPlayerByCloud(code);
      let targetId: string;
      if (existing) {
        renamePlayer(existing.id, acc.name, acc.avatar);
        saveProgressFor(existing.id, prog);
        targetId = existing.id;
      } else {
        const pl = addPlayer(acc.name, acc.avatar);
        setPlayerCloudCode(pl.id, code);
        saveProgressFor(pl.id, prog);
        targetId = pl.id;
      }
      setPlayers(loadPlayers());
      switchPlayer(targetId);
      return "ok";
    },
    [switchPlayer]
  );

  const leaderboard = useMemo<LeaderRow[]>(() => {
    return players
      .map((p) => {
        const st = p.id === activeId ? state : loadProgressFor(p.id);
        return {
          player: p,
          points: st.points,
          stickers: Object.keys(st.stickers).length,
          badges: st.badges.length,
          level: levelForPoints(st.points).level
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [players, activeId, state]);

  const activePlayer = players.find((p) => p.id === activeId) ?? null;

  return {
    state,
    settings,
    players,
    activePlayer,
    leaderboard,
    challenge: activeChallenge(settings),
    level: levelForPoints(state.points),
    stickerCount: Object.keys(state.stickers).length,
    record,
    completeChallenge,
    switchPlayer,
    createPlayer,
    editPlayer,
    deletePlayer,
    resetActive,
    updateCustomChallenge,
    linkPlayerToCloud,
    loginWithCode
  };
}
