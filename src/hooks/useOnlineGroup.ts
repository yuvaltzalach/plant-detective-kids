import { useCallback, useEffect, useState } from "react";
import {
  OnlineMember,
  PlayerStats,
  endRace as endRaceApi,
  fetchGroup,
  getGroupCode,
  normalizeCode,
  sendRaceProgress,
  setGroupCode,
  startRace as startRaceApi,
  syncGroup
} from "../lib/online";
import type { Mission, Race, RaceResult } from "../lib/race";
import type { Player } from "../types";

export type OnlineStatus = "idle" | "loading" | "offline" | "ok";

/**
 * מנהל את חברות המכשיר בקבוצה אונליין:
 * - שומר את קוד הקבוצה
 * - מסנכרן אוטומטית את נתוני השחקן הפעיל בכל שינוי בנקודות/מדבקות
 * - מביא את טבלת הניצחונות ומרוץ המשימות המשותפים
 */
export function useOnlineGroup(player: Player | null, stats: PlayerStats) {
  const [code, setCode] = useState<string | null>(() => getGroupCode());
  const [members, setMembers] = useState<OnlineMember[] | null>(null);
  const [status, setStatus] = useState<OnlineStatus>("idle");
  const [race, setRace] = useState<Race | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);

  const refresh = useCallback(async () => {
    if (!code) return;
    setStatus("loading");
    const data = await fetchGroup(code);
    if (!data) {
      setStatus("offline");
      return;
    }
    setMembers(data.members);
    setRace(data.race);
    setRaceResults(data.raceResults);
    setStatus("ok");
  }, [code]);

  // סנכרון אוטומטי בכל שינוי בנתוני השחקן הפעיל
  useEffect(() => {
    if (!code || !player) return;
    let cancelled = false;
    syncGroup(code, { id: player.id, name: player.name, avatar: player.avatar }, stats).then(
      (ok) => {
        if (cancelled) return;
        if (ok) void refresh();
        else setStatus("offline");
      }
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, player?.id, player?.name, player?.avatar, stats.points, stats.stickers, stats.badges, stats.level]);

  const join = useCallback(
    async (raw: string) => {
      const cc = normalizeCode(raw);
      if (!cc) return;
      setGroupCode(cc);
      setCode(cc);
      if (player) {
        await syncGroup(cc, { id: player.id, name: player.name, avatar: player.avatar }, stats);
      }
    },
    [player, stats]
  );

  const leave = useCallback(() => {
    setGroupCode(null);
    setCode(null);
    setMembers(null);
    setRace(null);
    setRaceResults([]);
    setStatus("idle");
  }, []);

  const startRace = useCallback(
    async (missions: Mission[]) => {
      if (!code) return false;
      const created = await startRaceApi(code, missions, player?.name);
      if (created) {
        setRace(created);
        setRaceResults([]);
      }
      void refresh();
      return !!created;
    },
    [code, player?.name, refresh]
  );

  const endRace = useCallback(async () => {
    if (!code) return;
    await endRaceApi(code);
    void refresh();
  }, [code, refresh]);

  /** מדווח התקדמות במרוץ ומעדכן מיד את השורה שלי בטבלה (בלי לחכות לרענון). */
  const reportRaceProgress = useCallback(
    async (raceId: string, done: number, score: number) => {
      if (!code || !player) return;
      const mine = await sendRaceProgress(
        code,
        raceId,
        { id: player.id, name: player.name, avatar: player.avatar },
        done,
        score
      );
      if (mine) setRaceResults((rs) => [...rs.filter((r) => r.id !== mine.id), mine]);
    },
    [code, player]
  );

  return {
    code,
    members,
    race,
    raceResults,
    status,
    refresh,
    join,
    leave,
    startRace,
    endRace,
    reportRaceProgress
  };
}
