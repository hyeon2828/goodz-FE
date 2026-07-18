import type { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import type { UserRole } from "@/types/domain";

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
    // JSON이 아닌 응답 대비 — body는 null로 두고 status만으로 처리.
  }
  return { ok: res.ok, status: res.status, body };
}

export const ACCESS_TOKEN_COOKIE = "gm_access_token";
export const REFRESH_TOKEN_COOKIE = "gm_refresh_token";
// non-httpOnly, 토큰 없이 {role, email}만 담음 — 탈취돼도 실질적 피해 없음.
export const SESSION_HINT_COOKIE = "gm_session";

const FALLBACK_ACCESS_MAX_AGE = 60 * 15; // 15분
const FALLBACK_REFRESH_MAX_AGE = 60 * 60 * 24 * 14; // 14일

// 서명 검증 없이 payload(exp)만 읽음 — 위변조 여부는 Spring Boot가 매
// 요청마다 검증하므로, 여기선 쿠키 maxAge를 맞추는 용도로만 사용.
function jwtMaxAgeSeconds(token: string, fallback: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
    if (typeof payload.exp !== "number") return fallback;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallback;
  }
}

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
