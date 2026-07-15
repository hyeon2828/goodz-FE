import { NextResponse } from "next/server";
import { callSpringBoot } from "@/app/api/auth/_lib/springBoot";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ success: false, message: "email 쿼리 파라미터가 필요합니다." }, { status: 400 });
  }

  const { ok, status, body: result } = await callSpringBoot<boolean>(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`);

  if (!ok || !result) {
    return NextResponse.json({ success: false, message: result?.message ?? "이메일 확인에 실패했습니다." }, { status: ok ? 400 : status });
  }
  return NextResponse.json({ success: result.success, data: result.data, message: result.message });
}
