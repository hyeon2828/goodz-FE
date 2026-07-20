import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";
import { normalizeStoreGoods, type RawStoreGoodsResponse } from "@/app/api/stores/_lib/normalize";

export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  try {
    const { goodsId, price, stock } = (await request.json()) as { goodsId: number; price: number; stock: number };
    const { ok, status, body } = await callSpringBootAuthenticated<RawStoreGoodsResponse>(
      request,
      `/api/v1/stores/${storeId}/goods`,
      { method: "POST", body: JSON.stringify({ goodsId, price, stock }) }
    );
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "기존 굿즈 등록에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: normalizeStoreGoods(body.data), message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
