"use client";

import { useRouter } from "next/navigation";

export function DashboardAccessDenied({ onGoAuth }: { onGoAuth: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-3xl mx-auto mb-4">
          🔒
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          업체 회원 전용 페이지입니다
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          업체 관리 페이지는 업체 회원 또는 초대받은 하위 관리자만 이용할 수 있습니다.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onGoAuth}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/30"
          >
            업체 회원으로 가입하기
          </button>
          <button
            onClick={() => router.push("/goods")}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors"
          >
            굿즈 탐색하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
