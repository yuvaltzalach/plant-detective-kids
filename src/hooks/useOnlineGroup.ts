import { useCallback, useEffect, useState } from "react";
import {
  GroupChallenge,
  OnlineMember,
  PlayerStats,
  fetchGroup,
  getGroupCode,
  normalizeCode,
  setGroupChallenge,
  setGroupCode,
  syncGroup
} from "../lib/online";
import type { Player } from "../types";

export type OnlineStatus = "idle" | "loading" | "offline" | "ok";

/**
 * מנהל את חברות המכשיר בקבוצה אונליין:
 * - שומר את קוד הקבוצה
 * - מסנכרן אוטומטית את נתוני השחקן הפעיל בכל שינוי בנקודות/מדבקות
 * - מביא את טבלת הניצחונות והאתגר הקבוצתי המשותפים
 */
export function useOnlineGroup(player: Player | null, stats: PlayerStats) {
  const [code, setCode] = useState<string | null>(() => getGroupCode());
  const [members, setMembers] = useState<OnlineMember[] | null>(null);
  const [challenge, setChallenge] = useState<GroupChallenge | null>(null);
  const [status, setStatus] = useState<OnlineStatus>("idle");

  const refresh = useCallback(async () => {
    if (!code) return;
    setStatus("loading");
    const data = await fetchGroup(code);
    if (!data) {
      setStatus("offline");
      return;
    }
    setMembers(data.members);
    setChallenge(data.challenge);
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
    setChallenge(null);
    setStatus("idle");
  }, []);

  const updateGroupChallenge = useCallback(
    async (c: { text: string; emoji: string; category?: string } | null) => {
      if (!code) return;
      await setGroupChallenge(code, c ? { ...c, by: player?.name } : null);
      void refresh();
    },
    [code, player?.name, refresh]
  );

  const completeGroupChallenge = useCallback(async () => {
    if (!code || !player) return;
    await syncGroup(
      code,
      { id: player.id, name: player.name, avatar: player.avatar },
      stats,
      Date.now()
    );
    void refresh();
  }, [code, player, stats, refresh]);

  return {
    code,
    members,
    challenge,
    status,
    refresh,
    join,
    leave,
    updateGroupChallenge,
    completeGroupChallenge
  };
}
