"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

const USER_STEPS = [
  { emoji: "🔍", title: "굿즈 탐색", desc: "작품별·지역별 필터로 원하는 굿즈를 판매하는 업체를 찾아보세요. 목록 또는 지도 뷰로 확인할 수 있어요." },
  { emoji: "📋", title: "플래너에 담기", desc: "마음에 드는 굿즈를 플래너에 담고 방문 날짜와 플랜 이름을 설정하세요. 같은 날 여러 플랜도 만들 수 있어요." },
  { emoji: "🏪", title: "업체 방문 & 구매", desc: "계획한 날짜에 업체를 직접 방문해 굿즈를 구매하세요. 플래너로 동선을 미리 파악할 수 있어요." },
];

const STORE_STEPS = [
  { emoji: "📝", title: "업체 정보 등록", desc: "업체명, 주소, 운영 유형(팝업/상설)을 등록하세요. 팝업스토어는 행사 기간도 함께 설정할 수 있어요." },
  { emoji: "🎁", title: "굿즈 등록", desc: "판매할 굿즈의 원작 작품, 카테고리, 가격, 재고를 등록하세요. 사진도 첨부할 수 있어요." },
  { emoji: "📊", title: "재고 & 기간 관리", desc: "대시보드에서 굿즈 재고를 실시간으로 관리하고, 행사 기간을 언제든지 수정할 수 있어요." },
];

const FEATURES = [
  { emoji: "🗺️", title: "지도 기반 탐색", desc: "카카오맵으로 내 주변 업체를 한눈에 확인" },
  { emoji: "📅", title: "날짜별 플래너", desc: "방문 날짜에 맞춰 굿즈 구매 계획 수립" },
  { emoji: "⚔️", title: "작품별 필터", desc: "좋아하는 애니메이션 굿즈만 빠르게 탐색" },
  { emoji: "🔔", title: "팝업 일정 알림", desc: "관심 팝업스토어의 오픈·마감 일정 확인" },
];

export default function GuidePage() {
  const router = useRouter();
  const { loggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 pt-14 pb-16 md:pt-20 md:pb-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-violet-900/50 mx-auto mb-5">
            G
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            애니 굿즈 탐색,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">이제 한 곳에서</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Goodz는 팝업스토어와 상설매장의 굿즈를 한눈에 탐색하고,
            <br className="hidden md:block" />
            날짜별 방문 플랜을 세울 수 있는 애니 굿즈 전문 플랫폼입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/goods")}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-900/30 text-sm"
            >
              굿즈 탐색 시작하기 →
            </button>
            {!loggedIn && (
              <button
                onClick={() => router.push("/signup")}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-border text-foreground font-semibold rounded-xl transition-colors text-sm"
              >
                회원가입
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { emoji: "👤", role: "개인 회원", color: "violet", desc: "좋아하는 애니의 굿즈를 한 곳에서 탐색하고, 팝업 방문 일정을 플래너로 미리 준비하고 싶은 팬" },
            { emoji: "🏪", role: "업체 회원", color: "rose", desc: "팝업스토어나 상설매장을 운영하며 굿즈를 등록·관리하고 고객에게 발견되고 싶은 사장님" },
          ].map(({ emoji, role, color, desc }) => (
            <div key={role} className={`bg-card border rounded-2xl p-6 ${color === "violet" ? "border-violet-500/20" : "border-rose-500/20"}`}>
              <span className="text-3xl block mb-3">{emoji}</span>
              <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                {role}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          개인 회원 이용 방법
        </h2>
        <p className="text-muted-foreground text-sm mb-8">굿즈를 찾고, 계획하고, 구매하세요</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {USER_STEPS.map((step, i) => (
            <div key={i} className="relative bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < USER_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-muted-foreground/30 text-lg z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          업체 회원 이용 방법
        </h2>
        <p className="text-muted-foreground text-sm mb-8">굿즈를 등록하고 고객을 만나세요</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORE_STEPS.map((step, i) => (
            <div key={i} className="relative bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < STORE_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-muted-foreground/30 text-lg z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 border-t border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8" style={{ fontFamily: "Outfit, sans-serif" }}>
          주요 기능
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-2xl block mb-2">{f.emoji}</span>
              <p className="text-xs font-bold text-foreground mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {f.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 border-t border-border">
        <div className="bg-gradient-to-br from-violet-900/40 to-pink-900/20 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            지금 바로 시작해보세요
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {loggedIn ? "굿즈를 탐색하고 플래너로 방문 계획을 세워보세요" : "회원가입 후 바로 굿즈를 탐색하고 플래너를 활용할 수 있어요"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {loggedIn ? (
              <button
                onClick={() => router.push("/goods")}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-900/30 text-sm"
              >
                시작하기
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-900/30 text-sm"
                >
                  무료로 시작하기
                </button>
                <button
                  onClick={() => router.push("/goods")}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-border text-foreground font-semibold rounded-xl transition-colors text-sm"
                >
                  먼저 둘러보기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="h-8" />
    </div>
  );
}
