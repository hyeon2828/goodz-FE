"use client";

import { Sparkles } from "lucide-react";
import { gradientForId } from "@/lib/gradient";
import type { GoodsSummary } from "@/types/domain";

// 목록(/goods, /goods/search) 전용 — 가격/재고/업체 정보가 API에 없어서
// 최소 정보(이름+작품명)만 보여주고 클릭하면 상세(GoodsDetailModal)로
// 이동. 업체별 가격은 상세에서만 알 수 있음.
export function GoodsCard({ goods, onClick }: { goods: GoodsSummary; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-950/20 group cursor-pointer"
    >
      <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${gradientForId(goods.animationId)} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <Sparkles size={40} className="text-white/70 opacity-80 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-0.5 font-medium">{goods.animationTitle}</p>
        <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          {goods.name}
        </h3>
        <p className="text-[11px] text-violet-400 font-semibold group-hover:text-violet-300 transition-colors">자세히 보기 →</p>
      </div>
    </div>
  );
}
