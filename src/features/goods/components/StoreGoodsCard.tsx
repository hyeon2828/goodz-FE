"use client";

import { useState } from "react";
import { CheckCircle, Plus, Sparkles } from "lucide-react";
import { fmtPrice } from "@/lib/helpers";
import { gradientForId } from "@/lib/gradient";
import type { StoreGoodsItem } from "@/types/domain";
import { StockBadge } from "./StockBadge";

export function StoreGoodsCard({
  item,
  onAdd,
  isLoggedIn,
  onLoginPrompt,
}: {
  item: StoreGoodsItem;
  onAdd: (item: StoreGoodsItem) => void;
  isLoggedIn: boolean;
  onLoginPrompt: () => void;
}) {
  const [state, setState] = useState<"idle" | "added">("idle");

  const handleAdd = () => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    onAdd(item);
    setState("added");
    setTimeout(() => setState("idle"), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-950/20 group">
      <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${gradientForId(item.goodsId)} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <Sparkles size={40} className="text-white/70 opacity-80 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
        <div className="absolute top-2 right-2">
          <StockBadge stock={item.stock} />
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-0.5 font-medium">{item.animationTitle}</p>
        <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug mb-2.5" style={{ fontFamily: "Outfit, sans-serif" }}>
          {item.goodsName}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-foreground text-xs sm:text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
            {fmtPrice(item.price)}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 text-[11px] px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 shrink-0 ${
              state === "added"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            }`}
          >
            {state === "added" ? (
              <>
                <CheckCircle size={11} /> 담김
              </>
            ) : (
              <>
                <Plus size={11} /> 담기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
