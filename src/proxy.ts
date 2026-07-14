import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/planners", "/admin"];

// mock 단계 게이트: 세션 마커 쿠키 존재 여부만 확인 (features/auth/AuthProvider.tsx
// 참고). 6단계에서 Spring Boot 로그인 API가 httpOnly 쿠키 발급하면 실제 JWT
// 검증으로 교체 예정. 세밀한 권한(업체 역할, 업체별 서브관리자 여부)은
// 페이지 컴포넌트에서 계속 처리 — 엣지에서는 볼 수 없는 데이터라 필요.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has("gm_auth");
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/planners/:path*", "/admin/:path*"],
};
