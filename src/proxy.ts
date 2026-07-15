import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/planners", "/admin"];

// gm_access_token(httpOnly, app/api/auth/_lib/springBoot.ts ACCESS_TOKEN_COOKIE와
// 동일한 이름 — 문자열 그대로 유지, import는 안 함) 존재 여부만 확인.
// httpOnly 쿠키지만 여긴 서버 사이드라 정상적으로 읽힘(httpOnly는 브라우저
// JS만 못 읽게 막는 것). 서명/만료 검증까지는 안 함 — 그건 Spring Boot가
// 매 요청마다 하고, 여긴 "로그인 자체를 안 한 사람" 차단이 목적.
// 세밀한 권한(업체 역할, 업체별 서브관리자 여부)은 페이지 컴포넌트에서
// 계속 처리 — 엣지/서버 라우트 레벨에서는 볼 수 없는 데이터라 필요.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has("gm_access_token");
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/planners/:path*", "/admin/:path*"],
};
