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

// 로그인한 사용자가 관리하는(메인 관리자 또는 서브 관리자로 배정된) 업체
// 목록 — role(개인/업체)과 무관하게 서버가 JWT로 스코핑해서 내려줌.
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
