import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ plannerId: string; plannerGoodsId: string }> }
) {
  const { plannerId, plannerGoodsId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated(
      request,
      `/api/v1/planners/${plannerId}/goods/${plannerGoodsId}`,
      { method: "DELETE" }
    );
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "굿즈를 삭제하지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
