import { NextRequest, NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE, callSpringBoot, clearAllAuthCookies, setTokenCookies } from "@/app/api/auth/_lib/springBoot";

interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    const response = NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    clearAllAuthCookies(response);
    return response;
  }

  const { ok, status, body: result } = await callSpringBoot<LoginTokens>("/api/v1/auth/reissue", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!ok || !result?.success || !result.data) {
    const response = NextResponse.json(
      { success: false, message: result?.message ?? "세션이 만료됐습니다. 다시 로그인해주세요." },
      { status: ok ? 401 : status }
    );
    if (ok || status === 401 || status === 403) clearAllAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ success: true, message: result.message });
  setTokenCookies(response, result.data.accessToken, result.data.refreshToken);
  return response;
}
