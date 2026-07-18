interface ApiResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

async function callLocalAuthRoute<T = undefined>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      credentials: "include",
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { success: false, message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}

function postJson<T = undefined>(path: string, body: unknown) {
  return callLocalAuthRoute<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function signupMember(input: { name: string; email: string; password: string }) {
  return postJson("/api/auth/signup/member", input);
}

export function signupBusiness(input: { name: string; email: string; password: string }) {
  return postJson("/api/auth/signup/business", input);
}

export function checkEmail(email: string) {
  return callLocalAuthRoute<boolean>(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
}

export function verifyEmail(input: { email: string; authCode: string }) {
  return postJson("/api/auth/verify-email", input);
}

export function loginMember(input: { email: string; password: string }) {
  return postJson("/api/auth/login/member", input);
}

export function loginBusiness(input: { email: string; password: string }) {
  return postJson("/api/auth/login/business", input);
}

export function reissueToken() {
  return postJson("/api/auth/reissue", {});
}

export function logout() {
  return postJson("/api/auth/logout", {});
}
