"use client";

import { useEffect, useState } from "react";
import { CheckCircle, MapPin, Plus, Sparkles, X } from "lucide-react";
import { fmtPrice } from "@/lib/helpers";
import { gradientForId } from "@/lib/gradient";
import type { GoodsStoreOffer, PendingPlanItem } from "@/types/domain";
import { getGoodsDetail } from "../api";
import { StockBadge } from "./StockBadge";

export function GoodsDetailModal({
  goodsId,
  onAdd,
  onClose,
}: {
  goodsId: number;
  onAdd: (item: PendingPlanItem) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState<string | null>(null);
  const [animationTitle, setAnimationTitle] = useState("");
  const [stores, setStores] = useState<GoodsStoreOffer[]>([]);
  const [error, setError] = useState("");
  const [addedStoreGoodsId, setAddedStoreGoodsId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGoodsDetail(goodsId)
      .then((detail) => {
        if (cancelled) return;
        setName(detail.name);
        setAnimationTitle(detail.animationTitle);
        setStores(detail.stores);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "굿즈 정보를 불러오지 못했습니다");
      });
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  const handleAdd = (offer: GoodsStoreOffer) => {
    if (!name) return;
    onAdd({
      storeGoodsId: offer.storeGoodsId,
      goodsName: name,
      animationTitle,
      storeId: offer.storeId,
      storeName: offer.storeName,
      price: offer.price,
    });
    setAddedStoreGoodsId(offer.storeGoodsId);
    setTimeout(() => setAddedStoreGoodsId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative h-32 sm:h-40 bg-gradient-to-br ${gradientForId(goodsId)} flex items-center justify-center shrink-0`}>
          <div className="absolute inset-0 bg-black/10" />
          <Sparkles size={48} className="text-white/70 drop-shadow-xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {error && <p className="text-sm text-red-400 text-center py-8">{error}</p>}
          {!error && !name && <p className="text-sm text-muted-foreground text-center py-8">불러오는 중...</p>}
          {name && (
            <>
              <p className="text-xs text-muted-foreground mb-1 font-medium">{animationTitle}</p>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
                {name}
              </h2>
              {stores.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">판매 중인 업체가 없습니다</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground font-semibold mb-1">판매 업체 {stores.length}곳</p>
                  {stores.map((offer) => (
                    <div key={offer.storeGoodsId} className="border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{offer.storeName}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin size={9} className="shrink-0" />
                          {offer.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                            {fmtPrice(offer.price)}
                          </span>
                          <StockBadge stock={offer.stock} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdd(offer)}
                        className={`flex items-center gap-1 text-[11px] px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
                          addedStoreGoodsId === offer.storeGoodsId
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                            : "bg-violet-600 hover:bg-violet-500 text-white"
                        }`}
                      >
                        {addedStoreGoodsId === offer.storeGoodsId ? (
                          <>
                            <CheckCircle size={13} /> 담김
                          </>
                        ) : (
                          <>
                            <Plus size={13} /> 담기
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
