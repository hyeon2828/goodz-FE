// 브라우저에서 부르는 클라이언트 계층 — Spring Boot(api.pinnedsignal.site)를
// 직접 호출하지 않고, 항상 같은 출처의 app/api/auth/*/route.ts를 호출함
// (그래서 CORS 대상 아님, 토큰은 그 Route Handler가 httpOnly 쿠키로 관리).
// role(USER/STORE) 매핑도 Route Handler 쪽 고정값으로 처리되어 있어서
// 여기서는 신경 쓸 필요 없음 — loginMember/loginBusiness를 어떤 걸
// 호출하느냐로 이미 역할이 정해짐.

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
