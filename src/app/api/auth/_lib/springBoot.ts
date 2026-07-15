import type { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import type { UserRole } from "@/types/domain";

// Spring Boot 인증 API를 서버 사이드에서만 호출하는 공용 헬퍼.
// 브라우저는 이 파일을 직접 쓰지 않고, app/api/auth/*/route.ts를 거쳐서만
// 여기까지 도달함 — 그래서 여기 있는 API_BASE_URL(https://api.pinnedsignal.site)
// 호출은 서버-서버 통신이라 CORS 대상이 아님.

export interface SpringBootEnvelope<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export async function callSpringBoot<T = unknown>(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  let body: SpringBootEnvelope<T> | null = null;
  try {
    body = (await res.json()) as SpringBootEnvelope<T>;
  } catch {
    // 백엔드가 JSON이 아닌 응답(예: 처리되지 않은 예외의 HTML 에러 페이지)을
    // 줄 가능성 있음 — 이 경우 body는 null로 두고 status만으로 처리.
  }
  return { ok: res.ok, status: res.status, body };
}

export const ACCESS_TOKEN_COOKIE = "gm_access_token";
export const REFRESH_TOKEN_COOKIE = "gm_refresh_token";
// non-httpOnly. {role, email}만 담음(토큰 없음) — 클라이언트가 "로그인
// 상태 UI를 보여줘도 되는지"만 판단하는 힌트용. 실제 인증은 항상
// httpOnly 토큰 쿠키가 담당하므로 이 쿠키가 탈취돼도 실질적 피해 없음.
export const SESSION_HINT_COOKIE = "gm_session";

const FALLBACK_ACCESS_MAX_AGE = 60 * 15; // 15분
const FALLBACK_REFRESH_MAX_AGE = 60 * 60 * 24 * 14; // 14일

// JWT는 서명 검증 없이도 payload(exp)를 읽을 수 있음(base64url 디코딩뿐,
// 위변조 여부는 어차피 Spring Boot가 매 요청마다 검증함) — 쿠키
// maxAge를 토큰 실제 만료 시각에 맞추기 위해서만 사용.
function jwtMaxAgeSeconds(token: string, fallback: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
    if (typeof payload.exp !== "number") return fallback;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallback;
  }
}

// secure는 NODE_ENV 기준 — 로컬 `next dev`는 development라 http에서도
// 쿠키가 심어지고, 배포 빌드(`next build`/`next start`)는 production이라
// secure가 켜짐(배포 사이트가 https로 서빙된다는 전제, EC2 앞단에 TLS
// 종료 프록시가 있어도 브라우저가 보는 주소가 https면 문제없음).
// sameSite는 Lax로 충분 — 브라우저가 Route Handler(같은 origin)만
// 호출하고 api.pinnedsignal.site에는 쿠키를 직접 안 보내는 구조라
// cross-site 쿠키 전송 자체가 필요 없음.
function authCookieOptions(maxAge: number, httpOnly: boolean) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setTokenCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions(jwtMaxAgeSeconds(accessToken, FALLBACK_ACCESS_MAX_AGE), true));
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, authCookieOptions(jwtMaxAgeSeconds(refreshToken, FALLBACK_REFRESH_MAX_AGE), true));
}

// 로그인 성공 시에만 호출 — refreshToken 만료 시각에 정확히 맞출 필요는
// 없어서(UI 힌트일 뿐 보안 경계가 아님) 고정값 사용, reissue 때는 갱신
// 안 함(reissue는 email/role을 모름 — refreshToken에서만 새 토큰을 받음).
export function setSessionHintCookie(response: NextResponse, role: UserRole, email: string) {
  response.cookies.set(
    SESSION_HINT_COOKIE,
    JSON.stringify({ role, email }),
    authCookieOptions(FALLBACK_REFRESH_MAX_AGE, false)
  );
}

export function clearAllAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", authCookieOptions(0, true));
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", authCookieOptions(0, true));
  response.cookies.set(SESSION_HINT_COOKIE, "", authCookieOptions(0, false));
}
