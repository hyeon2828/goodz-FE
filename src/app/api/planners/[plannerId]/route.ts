import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

interface RawPlannerGoods {
  id: number;
  storeGoodsId: number;
  goodsName: string;
  animationTitle: string;
  price: number;
  store: { id: number; name: string };
}

interface RawPlannerDetail {
  id: number;
  title: string;
  date: string;
  goods: RawPlannerGoods[];
}

function normalizeDetail(raw: RawPlannerDetail) {
  return {
    id: raw.id,
    title: raw.title,
    date: raw.date,
    goods: raw.goods.map((g) => ({
      id: g.id,
      plannerId: raw.id,
      storeGoodsId: g.storeGoodsId,
      goodsName: g.goodsName,
      animationTitle: g.animationTitle,
      storeId: g.store.id,
      storeName: g.store.name,
      price: g.price,
    })),
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ plannerId: string }> }) {
  const { plannerId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated<RawPlannerDetail>(request, `/api/v1/planners/${plannerId}`);
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "플랜 정보를 불러오지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: normalizeDetail(body.data) });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ plannerId: string }> }) {
  const { plannerId } = await params;
  try {
    const { title, date } = await request.json();
    const { ok, status, body } = await callSpringBootAuthenticated<{ id: number; title: string; date: string }>(
      request,
      `/api/v1/planners/${plannerId}`,
      { method: "PATCH", body: JSON.stringify({ title, date }) }
    );
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "플랜 수정에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ plannerId: string }> }) {
  const { plannerId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated(request, `/api/v1/planners/${plannerId}`, { method: "DELETE" });
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "플랜 삭제에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
