import { NextRequest, NextResponse } from "next/server";
import { callSpringBootAuthenticated, UnauthenticatedError, unauthenticatedResponse } from "@/app/api/_lib/authenticatedFetch";

interface PlannerListData {
  totalPlans: number;
  visitDays: number;
  planners: Array<{ id: number; title: string; date: string; goodsCount: number }>;
}

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get("month");
    const qs = month ? `?month=${encodeURIComponent(month)}` : "";
    const { ok, status, body } = await callSpringBootAuthenticated<PlannerListData>(request, `/api/v1/planners${qs}`);
    if (!ok || !body?.success) {
      return NextResponse.json({ success: false, message: body?.message ?? "플래너 목록을 불러오지 못했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, date } = await request.json();
    const { ok, status, body } = await callSpringBootAuthenticated<{ id: number; title: string; date: string }>(
      request,
      "/api/v1/planners",
      { method: "POST", body: JSON.stringify({ title, date }) }
    );
    if (!ok || !body?.success || !body.data) {
      return NextResponse.json({ success: false, message: body?.message ?? "플랜 생성에 실패했습니다." }, { status: ok ? 400 : status });
    }
    return NextResponse.json({ success: true, data: body.data, message: body.message });
  } catch (e) {
    if (e instanceof UnauthenticatedError) return unauthenticatedResponse();
    throw e;
  }
}
