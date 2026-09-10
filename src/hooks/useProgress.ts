import { useCallback, useEffect, useState } from "react";
import {
  FindOutcome,
  levelForPoints,
  loadState,
  recordFind,
  saveState
} from "../lib/progress";
import type { PlantResult, ProgressState } from "../types";

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const record = useCallback((result: PlantResult): FindOutcome => {
    const outcome = recordFind(loadState(), result);
    setState(outcome.state);
    return outcome;
  }, []);

  const reset = useCallback(() => {
    const fresh = loadState();
    setState({ ...fresh, points: 0, stickers: {}, badges: [], challengeStreak: 0, todayCount: 0 });
  }, []);

  const level = levelForPoints(state.points);

  return {
    state,
    record,
    reset,
    level,
    stickerCount: Object.keys(state.stickers).length
  };
}
