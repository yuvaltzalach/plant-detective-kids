// חשבון אמיתי: הרשמה/כניסה עם שם משתמש+סיסמה, token להתחברות אוטומטית,
// סנכרון התקדמות לענן, וקישור ילדים להורה. עטוף ב-try/catch לשגיאות רשת.
import type { ProgressState } from "../types";

export interface PublicAccount {
  username: string;
  age: number;
  avatar: string;
  isParent: boolean;
}

export interface ChildAccount extends PublicAccount {
  progress: ProgressState | null;
}

export type AuthResult =
  | { ok: true; token: string; account: PublicAccount; progress: ProgressState | null }
  | { ok: false; error: string };

async function postJson(url: string, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export async function signup(
  username: string,
  age: number,
  password: string,
  avatar: string
): Promise<AuthResult> {
  try {
    const { data } = await postJson("/api/auth/signup", { username, age, password, avatar });
    if (data?.ok) return { ok: true, token: data.token, account: data.account, progress: data.progress };
    return { ok: false, error: data?.error ?? "server-error" };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    const { data } = await postJson("/api/auth/login", { username, password });
    if (data?.ok) return { ok: true, token: data.token, account: data.account, progress: data.progress };
    return { ok: false, error: data?.error ?? "server-error" };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export type MeResult =
  | { ok: true; account: PublicAccount; progress: ProgressState | null }
  | { ok: false; reason: "unauthorized" | "offline" };

export async function me(token: string): Promise<MeResult> {
  try {
    const res = await fetch("/api/auth/me?token=" + encodeURIComponent(token));
    if (res.status === 401) return { ok: false, reason: "unauthorized" };
    if (!res.ok) return { ok: false, reason: "offline" };
    const data = await res.json();
    if (data?.ok) return { ok: true, account: data.account, progress: data.progress };
    return { ok: false, reason: "unauthorized" };
  } catch {
    return { ok: false, reason: "offline" };
  }
}

export async function saveProgress(
  token: string,
  progress: ProgressState,
  avatar?: string
): Promise<boolean> {
  try {
    const { status } = await postJson("/api/auth/save", { token, progress, avatar });
    return status === 200;
  } catch {
    return false;
  }
}

export async function linkChild(
  token: string,
  childUsername: string,
  childPassword: string
): Promise<{ ok: true; child: PublicAccount } | { ok: false; error: string }> {
  try {
    const { data } = await postJson("/api/auth/link", { token, childUsername, childPassword });
    if (data?.ok) return { ok: true, child: data.child };
    return { ok: false, error: data?.error ?? "server-error" };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export async function renameAccount(
  token: string,
  newUsername: string
): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  try {
    const { data } = await postJson("/api/auth/rename", { token, newUsername });
    if (data?.ok) return { ok: true, account: data.account };
    return { ok: false, error: data?.error ?? "server-error" };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export async function resetChildPassword(
  token: string,
  childUsername: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { data } = await postJson("/api/auth/reset-child-password", {
      token,
      childUsername,
      newPassword
    });
    if (data?.ok) return { ok: true };
    return { ok: false, error: data?.error ?? "server-error" };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export async function updateProfile(
  token: string,
  fields: { age?: number; password?: string; avatar?: string }
): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  try {
    const { data } = await postJson("/api/auth/update-profile", { token, ...fields });
    if (data?.ok) return { ok: true, account: data.account };
    return { ok: false, error: data?.error ?? "server-error" };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export interface ForgotInfo {
  exists: boolean;
  hasParent: boolean;
  isParent: boolean;
}

export async function forgotInfo(username: string): Promise<ForgotInfo | null> {
  try {
    const res = await fetch("/api/auth/forgot?username=" + encodeURIComponent(username));
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ok ? { exists: !!data.exists, hasParent: !!data.hasParent, isParent: !!data.isParent } : null;
  } catch {
    return null;
  }
}

export async function deleteChild(token: string, childUsername: string): Promise<boolean> {
  try {
    const { status } = await postJson("/api/auth/delete-child", { token, childUsername });
    return status === 200;
  } catch {
    return false;
  }
}

export async function listChildren(token: string): Promise<ChildAccount[] | null> {
  try {
    const res = await fetch("/api/auth/children?token=" + encodeURIComponent(token));
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ok ? (data.children as ChildAccount[]) : null;
  } catch {
    return null;
  }
}
