"use client";

import { useState } from "react";
import { CheckCircle, MapPin, Plus } from "lucide-react";
import { fmtPrice } from "@/lib/helpers";
import type { AnimationData, GoodsData, StoreData } from "@/types/domain";
import { StockBadge } from "./StockBadge";

export function GoodsCard({
  goods,
  anim,
  store,
  onAdd,
  isLoggedIn,
  onLoginPrompt,
  onShowDetail,
}: {
  goods: GoodsData;
  anim: AnimationData;
  store: StoreData;
  onAdd: (g: GoodsData) => void;
  isLoggedIn: boolean;
  onLoginPrompt: () => void;
  onShowDetail?: (g: GoodsData) => void;
}) {
  const [state, setState] = useState<"idle" | "added">("idle");

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    onAdd(goods);
    setState("added");
    setTimeout(() => setState("idle"), 2000);
  };

  return (
    <div
      onClick={() => onShowDetail?.(goods)}
      className={`bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-950/20 group ${
        onShowDetail ? "cursor-pointer" : ""
      }`}
    >
      <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${goods.gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <span className="text-4xl sm:text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
          {anim.emoji}
        </span>
        <div className="absolute top-2 right-2">
          <StockBadge stock={goods.stock} />
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] bg-black/40 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full font-medium">
            {goods.category}
          </span>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-0.5 font-medium">
          {anim.emoji} {anim.title}
        </p>
        <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          {goods.name}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 mb-2.5">
          <MapPin size={8} className="shrink-0" />
          <span className="truncate">{store.name}</span>
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-foreground text-xs sm:text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
            {fmtPrice(goods.price)}
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
