export interface ApiResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

let reissuePromise: Promise<boolean> | null = null;
let tokenVersion = 0;
let reissueEnabled = true;
let authTransitionCount = 0;
let sessionClearPromise: Promise<void> | null = null;

function signalSessionExpired() {
  document.cookie = "gm_session=; Max-Age=0; path=/";
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

function clearSession() {
  if (!sessionClearPromise) {
    sessionClearPromise = fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        signalSessionExpired();
        sessionClearPromise = null;
      });
  }
  return sessionClearPromise;
}

export async function beginAuthTransition() {
  authTransitionCount += 1;
  reissueEnabled = false;
  await reissuePromise;
}

export function endAuthTransition() {
  authTransitionCount = Math.max(0, authTransitionCount - 1);
  reissueEnabled = authTransitionCount === 0;
}

function reissueAccessToken() {
  if (!reissueEnabled) return Promise.resolve(false);
  if (!reissuePromise) {
    reissuePromise = fetch("/api/auth/reissue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (response.ok) tokenVersion += 1;
        else if (reissueEnabled && (response.status === 401 || response.status === 403)) signalSessionExpired();
        return response.ok;
      })
      .catch(() => false)
      .finally(() => {
        reissuePromise = null;
      });
  }
  return reissuePromise;
}

export async function callAuthenticatedRoute<T = undefined>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const requestTokenVersion = tokenVersion;
  const request = () =>
    fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      credentials: "include",
    });

  try {
    let response = await request();
    if (response.status === 401) {
      const canRetry = requestTokenVersion !== tokenVersion || (await reissueAccessToken());
      if (canRetry) {
        response = await request();
        if (response.status === 401 && reissueEnabled) await clearSession();
      }
    }
    return (await response.json()) as ApiResult<T>;
  } catch {
    return { success: false, message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}
