import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";
import type { StoreAdmin } from "@/types/domain";

export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated<StoreAdmin[]>(request, `/api/v1/stores/${storeId}/admin`);
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "관리자 목록을 불러오지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  try {
    const { email } = await request.json();
    const { ok, status, body } = await callSpringBootAuthenticated<StoreAdmin>(request, `/api/v1/stores/${storeId}/admin`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "관리자 추가에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
