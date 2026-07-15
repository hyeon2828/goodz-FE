import { NextResponse } from "next/server";
import { callSpringBoot } from "@/app/api/auth/_lib/springBoot";

export async function POST(request: Request) {
  const body = await request.json();
  const { ok, status, body: result } = await callSpringBoot("/api/v1/auth/signup/business", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!ok || !result?.success) {
    return NextResponse.json({ success: false, message: result?.message ?? "회원가입에 실패했습니다." }, { status: ok ? 400 : status });
  }
  return NextResponse.json({ success: true, message: result.message });
}
