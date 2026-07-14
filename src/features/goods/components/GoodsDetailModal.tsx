"use client";

import { useState } from "react";
import { CheckCircle, MapPin, Plus, X } from "lucide-react";
import { fmtPrice } from "@/lib/helpers";
import type { AnimationData, GoodsData, StoreData } from "@/types/domain";
import { StockBadge } from "./StockBadge";
import { TypeBadge } from "./TypeBadge";

export function GoodsDetailModal({
  goods,
  anim,
  store,
  onAdd,
  onClose,
}: {
  goods: GoodsData;
  anim: AnimationData;
  store: StoreData;
  onAdd: (g: GoodsData) => void;
  onClose: () => void;
}) {
  const [addState, setAddState] = useState<"idle" | "added">("idle");

  const handleAdd = () => {
    onAdd(goods);
    setAddState("added");
    setTimeout(() => setAddState("idle"), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${goods.gradient} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-black/10" />
          <span className="text-6xl sm:text-7xl drop-shadow-xl">{anim.emoji}</span>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X size={15} />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="text-[11px] bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
              {goods.category}
            </span>
            <StockBadge stock={goods.stock} />
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-1 font-medium">
            {anim.emoji} {anim.title}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            {goods.name}
          </h2>
          {goods.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">{goods.description}</p>
          )}
          <div className="flex items-center gap-2 py-3 border-t border-border mb-4">
            <TypeBadge type={store.type} />
            <span className="text-xs font-semibold text-foreground">{store.name}</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 ml-auto">
              <MapPin size={9} />
              {store.address.split(" ").slice(0, 3).join(" ")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">판매가</p>
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                {fmtPrice(goods.price)}
              </p>
            </div>
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                addState === "added"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30"
              }`}
            >
              {addState === "added" ? (
                <>
                  <CheckCircle size={15} /> 담김
                </>
              ) : (
                <>
                  <Plus size={15} /> 플래너에 담기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
