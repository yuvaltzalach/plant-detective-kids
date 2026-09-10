// שכבת חשבון אמיתי (בין מכשירים): כל ילד/ה מקבל/ת קוד אישי שמסנכרן את החשבון.
// עטוף ב-try/catch — אם השרת/KV לא זמין, מחזיר null והאפליקציה ממשיכה מקומית.
import type { ProgressState } from "../types";

export interface CloudAccount {
  code: string;
  name: string;
  avatar: string;
  progress: ProgressState | null;
  updatedAt: number;
}

export async function createAccount(
  name: string,
  avatar: string,
  progress: ProgressState
): Promise<CloudAccount | null> {
  try {
    const res = await fetch("/api/account/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, avatar, progress })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { account?: CloudAccount };
    return data.account ?? null;
  } catch {
    return null;
  }
}

export type GetAccountResult =
  | { ok: true; account: CloudAccount }
  | { ok: false; reason: "offline" | "not-found" };

export async function getAccount(code: string): Promise<GetAccountResult> {
  try {
    const res = await fetch("/api/account/get?code=" + encodeURIComponent(code));
    if (res.status === 404) return { ok: false, reason: "not-found" };
    if (!res.ok) return { ok: false, reason: "offline" };
    const data = (await res.json()) as { account?: CloudAccount };
    if (!data.account) return { ok: false, reason: "not-found" };
    return { ok: true, account: data.account };
  } catch {
    return { ok: false, reason: "offline" };
  }
}

export async function saveAccount(
  code: string,
  payload: { name: string; avatar: string; progress: ProgressState }
): Promise<boolean> {
  try {
    const res = await fetch("/api/account/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, ...payload })
    });
    return res.ok;
  } catch {
    return false;
  }
}
