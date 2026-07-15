import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@/app/api/auth/_lib/springBoot";

// app/api/auth 바깥의 인증 필요 엔드포인트(플래너 등)가 공통으로 쓰는
// 헬퍼 — 요청에 실린 httpOnly 액세스 토큰 쿠키를 읽어 Authorization
// 헤더로 실어서 Spring Boot를 호출함. 쿠키가 아예 없으면(로그인 안 함)
// Spring Boot까지 갈 필요 없이 바로 401.

export interface SpringBootEnvelope<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export class UnauthenticatedError extends Error {}

export async function callSpringBootAuthenticated<T = unknown>(
  request: NextRequest,
  path: string,
  init?: RequestInit
) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) throw new UnauthenticatedError();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...init?.headers },
    cache: "no-store",
  });
  let body: SpringBootEnvelope<T> | null = null;
  try {
    body = (await res.json()) as SpringBootEnvelope<T>;
  } catch {
    // 처리되지 않은 예외의 HTML 에러 페이지 등 JSON이 아닌 응답 대비.
  }
  return { ok: res.ok, status: res.status, body };
}

export function unauthenticatedResponse() {
  return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
}
