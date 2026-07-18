import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@/app/api/auth/_lib/springBoot";

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
    // JSON이 아닌 응답(예: 처리되지 않은 예외의 HTML 에러 페이지) 대비.
  }
  return { ok: res.ok, status: res.status, body };
}

export function unauthenticatedResponse() {
  return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
}
