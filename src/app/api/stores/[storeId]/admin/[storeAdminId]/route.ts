import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; storeAdminId: string }> }
) {
  const { storeId, storeAdminId } = await params;
  try {
    const { ok, status, body } = await callSpringBootAuthenticated(
      request,
      `/api/v1/stores/${storeId}/admin/${storeAdminId}`,
      { method: "DELETE" }
    );
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "관리자 삭제에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
