import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; storeGoodsId: string }> }
) {
  const { storeId, storeGoodsId } = await params;
  try {
    const { imagePath } = (await request.json()) as { imagePath: string };
    const { ok, status, body } = await callSpringBootAuthenticated(
      request,
      `/api/v1/stores/${storeId}/goods/${storeGoodsId}/image-path`,
      { method: "PUT", body: JSON.stringify({ imagePath }) }
    );
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "이미지 등록에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
