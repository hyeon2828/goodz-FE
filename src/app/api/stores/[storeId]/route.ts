import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";
import { mapStoreTypeFromBackend, mapStoreTypeToBackend } from "@/lib/enumMap";
import type { StoreType } from "@/types/domain";

interface RawStoreDetailResponse {
  id: number;
  name: string;
  description: string;
  type: string;
  startDate?: string;
  endDate?: string;
  address: string;
  lat: number;
  lng: number;
  goodsCount: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated<RawStoreDetailResponse>(request, `/api/v1/stores/${storeId}`);
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "업체 정보를 불러오지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: { ...body.data, type: mapStoreTypeFromBackend(body.data.type) } });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  try {
    const { name, description, type, startDate, endDate, address } = (await request.json()) as {
      name: string;
      description: string;
      type: StoreType;
      startDate?: string;
      endDate?: string;
      address: string;
    };
    const { ok, status, body } = await callSpringBootAuthenticated<Omit<RawStoreDetailResponse, "goodsCount">>(
      request,
      `/api/v1/stores/${storeId}`,
      { method: "PATCH", body: JSON.stringify({ name, description, type: mapStoreTypeToBackend(type), startDate, endDate, address }) }
    );
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "업체 정보 수정에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: { ...body.data, type: mapStoreTypeFromBackend(body.data.type) }, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
