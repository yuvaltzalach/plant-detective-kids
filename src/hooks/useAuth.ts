import { useCallback, useEffect, useState } from "react";
import {
  AuthResult,
  ChildAccount,
  PublicAccount,
  deleteChild,
  linkChild,
  listChildren,
  login,
  me,
  saveProgress,
  signup
} from "../lib/auth";
import {
  FindOutcome,
  completeChallengeManually,
  emptyState,
  levelForPoints,
  recordFind
} from "../lib/progress";
import { activeChallenge, loadSettings, setCustomChallenge } from "../lib/players";
import type { AppSettings, CustomChallenge, PlantResult, ProgressState } from "../types";

interface Session {
  token: string;
  account: PublicAccount;
}

const SESSION_KEY = "pdk:session";
const progKey = (username: string) => `pdk:prog:${username.toLowerCase()}`;

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function persistSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* מתעלמים */
  }
}

function loadCachedProgress(username: string): ProgressState {
  try {
    const raw = localStorage.getItem(progKey(username));
    if (raw) return { ...emptyState(), ...(JSON.parse(raw) as Partial<ProgressState>) };
  } catch {
    /* מתעלמים */
  }
  return emptyState();
}

function cacheProgress(username: string, prog: ProgressState) {
  try {
    localStorage.setItem(progKey(username), JSON.stringify(prog));
  } catch {
    /* מתעלמים */
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [state, setState] = useState<ProgressState>(() =>
    session ? loadCachedProgress(session.account.username) : emptyState()
  );
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [children, setChildren] = useState<ChildAccount[] | null>(null);

  // כניסה אוטומטית: מרעננים מהשרת אם יש session
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    void me(session.token).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setSession((s) => (s ? { ...s, account: res.account } : s));
        const prog = res.progress ? { ...emptyState(), ...res.progress } : loadCachedProgress(session.account.username);
        setState(prog);
        cacheProgress(session.account.username, prog);
      } else if (res.reason === "unauthorized") {
        persistSession(null);
        setSession(null);
        setState(emptyState());
      }
      // offline: ממשיכים עם המטמון המקומי
    });
    return () => {
      cancelled = true;
    };
  }, [session?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyProgress = useCallback(
    (next: ProgressState) => {
      setState(next);
      if (session) {
        cacheProgress(session.account.username, next);
        void saveProgress(session.token, next, session.account.avatar);
      }
    },
    [session]
  );

  const record = useCallback(
    (result: PlantResult): FindOutcome => {
      const outcome = recordFind(state, result, new Date(), activeChallenge(loadSettings()));
      applyProgress(outcome.state);
      return outcome;
    },
    [state, applyProgress]
  );

  const completeChallenge = useCallback((): FindOutcome => {
    const outcome = completeChallengeManually(state);
    applyProgress(outcome.state);
    return outcome;
  }, [state, applyProgress]);

  const resetProgress = useCallback(() => applyProgress(emptyState()), [applyProgress]);

  const doSignup = useCallback(
    async (username: string, age: number, password: string, avatar: string): Promise<AuthResult> => {
      const res = await signup(username, age, password, avatar);
      if (res.ok) {
        const prog = res.progress ? { ...emptyState(), ...res.progress } : emptyState();
        persistSession({ token: res.token, account: res.account });
        setSession({ token: res.token, account: res.account });
        setState(prog);
        cacheProgress(res.account.username, prog);
      }
      return res;
    },
    []
  );

  const doLogin = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const res = await login(username, password);
    if (res.ok) {
      const prog = res.progress ? { ...emptyState(), ...res.progress } : emptyState();
      persistSession({ token: res.token, account: res.account });
      setSession({ token: res.token, account: res.account });
      setState(prog);
      cacheProgress(res.account.username, prog);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
    setSession(null);
    setState(emptyState());
    setChildren(null);
  }, []);

  const refreshChildren = useCallback(async () => {
    if (!session) return;
    const list = await listChildren(session.token);
    setChildren(list);
  }, [session]);

  const linkChildAccount = useCallback(
    async (childUsername: string, childPassword: string) => {
      if (!session) return { ok: false as const, error: "offline" };
      const res = await linkChild(session.token, childUsername, childPassword);
      if (res.ok) void refreshChildren();
      return res;
    },
    [session, refreshChildren]
  );

  const deleteChildAccount = useCallback(
    async (childUsername: string) => {
      if (!session) return false;
      const ok = await deleteChild(session.token, childUsername);
      if (ok) void refreshChildren();
      return ok;
    },
    [session, refreshChildren]
  );

  /** עדכון הדמות (אווטאר) של המשתמש/ת המחובר/ת. */
  const updateAvatar = useCallback(
    (avatar: string) => {
      if (!session) return;
      const account = { ...session.account, avatar };
      persistSession({ token: session.token, account });
      setSession({ token: session.token, account });
      void saveProgress(session.token, state, avatar);
    },
    [session, state]
  );

  const updateCustomChallenge = useCallback((c: CustomChallenge | null) => {
    setCustomChallenge(c);
    setSettings(loadSettings());
  }, []);

  return {
    account: session?.account ?? null,
    isLoggedIn: !!session,
    state,
    settings,
    children,
    challenge: activeChallenge(settings),
    level: levelForPoints(state.points),
    stickerCount: Object.keys(state.stickers).length,
    record,
    completeChallenge,
    resetProgress,
    signup: doSignup,
    login: doLogin,
    logout,
    refreshChildren,
    linkChildAccount,
    deleteChildAccount,
    updateAvatar,
    updateCustomChallenge
  };
}
