import { NextResponse } from "next/server";
import { callSpringBoot, setSessionHintCookie, setTokenCookies } from "@/app/api/auth/_lib/springBoot";

interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: Request) {
  const { email, password } = await request.json();
  // role은 이 라우트 전용 고정값 — 업체 회원 로그인은 항상 STORE.
  const { ok, status, body: result } = await callSpringBoot<LoginTokens>("/api/v1/auth/login/business", {
    method: "POST",
    body: JSON.stringify({ email, password, role: "STORE" }),
  });

  if (!ok || !result?.success || !result.data) {
    return NextResponse.json({ success: false, message: result?.message ?? "로그인에 실패했습니다." }, { status: ok ? 401 : status });
  }

  const response = NextResponse.json({ success: true, message: result.message });
  setTokenCookies(response, result.data.accessToken, result.data.refreshToken);
  setSessionHintCookie(response, "store", email);
  return response;
}
