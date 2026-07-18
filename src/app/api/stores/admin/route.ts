import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";
import { mapStoreTypeFromBackend } from "@/lib/enumMap";

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

export async function GET(request: NextRequest) {
  try {
    const { ok, status, body } = await callSpringBootAuthenticated<RawStoreResponse[]>(request, "/api/v1/stores/admin");
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "업체 목록을 불러오지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data.map((s) => ({ ...s, type: mapStoreTypeFromBackend(s.type) })) });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
