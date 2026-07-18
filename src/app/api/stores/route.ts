import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";
import { mapStoreTypeFromBackend, mapStoreTypeToBackend } from "@/lib/enumMap";
import type { StoreType } from "@/types/domain";

interface RawStoreResponse {
  id: number;
  name: string;
  description: string;
  type: string;
  startDate?: string;
  endDate?: string;
  address: string;
  lat: number;
  lng: number;
}

function normalize(raw: RawStoreResponse) {
  return { ...raw, type: mapStoreTypeFromBackend(raw.type) };
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, type, startDate, endDate, address } = (await request.json()) as {
      name: string;
      description: string;
      type: StoreType;
      startDate?: string;
      endDate?: string;
      address: string;
    };
    // lat/lng는 요청에 없음 — 백엔드가 address를 지오코딩해서 응답에 채워줌.
    const { ok, status, body } = await callSpringBootAuthenticated<RawStoreResponse>(request, "/api/v1/stores", {
      method: "POST",
      body: JSON.stringify({ name, description, type: mapStoreTypeToBackend(type), startDate, endDate, address }),
    });
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "업체 등록에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: normalize(body.data), message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
