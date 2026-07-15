import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

// 발급받은 uploadUrl은 이 Route Handler를 거치지 않고 브라우저가 S3로
// 직접 PUT함(presigned URL 자체가 인증이라 JWT 불필요, 서버가 파일
// 바이트를 중계할 필요도 없음) — 이 엔드포인트는 그 URL을 받아오는
// 것까지만 담당.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; storeGoodsId: string }> }
) {
  const { storeId, storeGoodsId } = await params;
  try {
    const { fileName, contentType, fileSize } = (await request.json()) as {
      fileName: string;
      contentType: string;
      fileSize: number;
    };
    const { ok, status, body } = await callSpringBootAuthenticated<PresignedUploadResponse>(
      request,
      `/api/v1/stores/${storeId}/goods/${storeGoodsId}/presigned-url`,
      { method: "POST", body: JSON.stringify({ fileName, contentType, fileSize }) }
    );
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "업로드 URL 발급에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
