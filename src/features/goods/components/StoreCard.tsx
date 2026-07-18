"use client";

import { Clock, MapPin } from "lucide-react";
import type { StoreData } from "@/types/domain";
import { TypeBadge } from "./TypeBadge";

export function StoreCard({ store, onClick }: { store: StoreData; onClick: () => void }) {
  const regionLabel = store.address.split(" ")[0];

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:border-violet-500/30 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/20 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 min-w-0">
          <TypeBadge type={store.type} />
          <h3 className="font-bold text-foreground mt-1.5 text-sm leading-snug" style={{ fontFamily: "Outfit, sans-serif" }}>
            {store.name}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
            <MapPin size={9} className="shrink-0" />
            {regionLabel} · {store.address.split(" ").slice(0, 3).join(" ")}
          </p>
        </div>
        {store.goodsCount !== undefined && (
          <span className="text-[11px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full shrink-0 ml-2">{store.goodsCount}종</span>
        )}
      </div>
      {store.type === "popup" && store.startDate && (
        <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1 font-mono">
          <Clock size={9} />
          {store.startDate} ~ {store.endDate}
        </p>
      )}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{store.description}</p>
    </div>
  );
}
