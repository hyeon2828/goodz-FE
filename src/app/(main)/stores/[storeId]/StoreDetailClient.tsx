"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { LoginPromptModal } from "@/components/common/LoginPromptModal";
import { useAuth } from "@/features/auth/AuthProvider";
import { StoreGoodsCard } from "@/features/goods/components/StoreGoodsCard";
import { TypeBadge } from "@/features/goods/components/TypeBadge";
import { AddToPlanModal } from "@/features/planner/components/AddToPlanModal";
import type { PendingPlanItem, StoreData, StoreGoodsItem } from "@/types/domain";

export function StoreDetailClient({
  store,
  storeGoods,
  storeGoodsError,
}: {
  store: StoreData;
  storeGoods: StoreGoodsItem[];
  storeGoodsError?: string | null;
}) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingItem, setPendingItem] = useState<PendingPlanItem | null>(null);

  const animationTitles = [...new Set(storeGoods.map((g) => g.animationTitle))];

  const handleAdd = (item: StoreGoodsItem) => {
    setPendingItem({
      storeGoodsId: item.storeGoodsId,
      goodsName: item.goodsName,
      animationTitle: item.animationTitle,
      storeId: store.id,
      storeName: store.name,
      price: item.price,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className={`border-b border-border ${store.type === "popup" ? "bg-gradient-to-b from-rose-950/40 to-transparent" : "bg-gradient-to-b from-violet-950/40 to-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5 pb-6 md:pb-8">
          <button
            onClick={() => router.push("/goods")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors font-medium"
          >
            <ArrowLeft size={14} /> 목록으로
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <TypeBadge type={store.type} />
              <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 mb-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                {store.name}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm flex items-center gap-1.5 mb-1">
                <MapPin size={12} />
                {store.address}
              </p>
              {store.type === "popup" && store.startDate && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Clock size={11} />
                  {store.startDate} ~ {store.endDate}
                </p>
              )}
              {animationTitles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {animationTitles.map((t) => (
                    <span key={t} className="text-[10px] bg-white/5 border border-border px-1.5 py-0.5 rounded-full text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs md:text-sm text-muted-foreground mt-2.5 leading-relaxed">{store.description}</p>
            </div>
            <div className="relative w-44 h-28 rounded-xl overflow-hidden bg-[#0D1B2E] shrink-0 hidden md:block">
              <svg className="absolute inset-0 w-full h-full opacity-15">
                <defs>
                  <pattern id="g2" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4466BB" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#g2)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shadow-xl ${store.type === "popup" ? "bg-rose-500" : "bg-violet-600"}`}>
                  {store.type === "popup" ? "🎪" : "🏪"}
                </div>
              </div>
              <div className="absolute bottom-1.5 left-2 text-[9px] text-white/30 font-mono">카카오맵 API 예정</div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h2 className="font-bold text-foreground mb-4 text-sm md:text-base" style={{ fontFamily: "Outfit, sans-serif" }}>
          판매 굿즈 <span className="text-muted-foreground font-normal text-sm">{storeGoods.length}종</span>
        </h2>
        {showLoginPrompt && (
          <LoginPromptModal
            onLogin={() => {
              setShowLoginPrompt(false);
              router.push("/login");
            }}
            onClose={() => setShowLoginPrompt(false)}
            message={"플래너에 굿즈를 담으려면\n로그인 또는 회원가입이 필요합니다"}
          />
        )}
        {pendingItem && <AddToPlanModal item={pendingItem} onClose={() => setPendingItem(null)} />}
        {storeGoodsError ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-400 font-medium mb-1">굿즈 목록을 불러오지 못했습니다</p>
            <p className="text-xs text-muted-foreground">{storeGoodsError}</p>
          </div>
        ) : storeGoods.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {storeGoods.map((g) => (
              <StoreGoodsCard key={g.storeGoodsId} item={g} onAdd={handleAdd} isLoggedIn={loggedIn} onLoginPrompt={() => setShowLoginPrompt(true)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground text-sm">등록된 굿즈가 없습니다</div>
        )}
      </div>
    </div>
  );
}
