import { NextResponse } from "next/server";
import { clearAllAuthCookies } from "@/app/api/auth/_lib/springBoot";

// Spring Boot에 /logout 엔드포인트가 없음(JWT는 stateless) — 로컬 쿠키만 제거.
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAllAuthCookies(response);
  return response;
}
