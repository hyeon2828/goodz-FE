import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";
import { normalizeStoreGoods, type RawStoreGoodsResponse } from "@/app/api/stores/_lib/normalize";

// 굿즈명/작품은 카탈로그 쪽 데이터라 이 엔드포인트로 못 바꿈(price/stock/imagePath만 가능).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; storeGoodsId: string }> }
) {
  const { storeId, storeGoodsId } = await params;
  try {
    const { price, stock, imagePath } = (await request.json()) as { price: number; stock: number; imagePath?: string };
    const { ok, status, body } = await callSpringBootAuthenticated<RawStoreGoodsResponse>(
      request,
      `/api/v1/stores/${storeId}/goods/${storeGoodsId}`,
      { method: "PATCH", body: JSON.stringify({ price, stock, imagePath }) }
    );
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "굿즈 수정에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: normalizeStoreGoods(body.data), message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; storeGoodsId: string }> }
) {
  const { storeId, storeGoodsId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated(
      request,
      `/api/v1/stores/${storeId}/goods/${storeGoodsId}`,
      { method: "DELETE" }
    );
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "굿즈 삭제에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
