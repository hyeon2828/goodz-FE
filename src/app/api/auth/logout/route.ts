import { NextResponse } from "next/server";
import { clearAllAuthCookies } from "@/app/api/auth/_lib/springBoot";

// Spring Boot 명세에 /logout 엔드포인트가 없음(JWT는 stateless라 서버가
// 세션을 따로 안 갖고 있음) — httpOnly 쿠키는 우리 Next.js 서버만 지울 수
// 있어서, Spring Boot 호출 없이 로컬 쿠키만 제거.
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAllAuthCookies(response);
  return response;
}
