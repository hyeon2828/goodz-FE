import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

export async function POST(request: NextRequest) {
  try {
    const { plannerId, date, storeGoodsId } = await request.json();
    const { ok, status, body } = await callSpringBootAuthenticated<{ plannerId: number; plannerGoodsId: number }>(
      request,
      "/api/v1/planner-goods",
      { method: "POST", body: JSON.stringify({ plannerId, date, storeGoodsId }) }
    );
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "굿즈를 담지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
