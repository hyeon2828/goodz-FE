"use client";

import { Clock, MapPin, Star } from "lucide-react";
import type { AnimationData, StoreData } from "@/types/domain";
import { TypeBadge } from "./TypeBadge";

export function StoreCard({
  store,
  animations,
  onClick,
}: {
  store: StoreData;
  animations: AnimationData[];
  onClick: () => void;
}) {
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
            {store.region} · {store.address.split(" ").slice(0, 3).join(" ")}
          </p>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="flex items-center gap-1 justify-end">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-foreground">{store.rating}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">({store.reviewCount.toLocaleString()})</p>
        </div>
      </div>
      {store.type === "popup" && store.startDate && (
        <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1 font-mono">
          <Clock size={9} />
          {store.startDate} ~ {store.endDate}
        </p>
      )}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{store.description}</p>
      <div className="flex flex-wrap items-center gap-1">
        {animations.slice(0, 3).map((a) => (
          <span key={a.id} className="text-[10px] bg-white/5 border border-border px-1.5 py-0.5 rounded-full text-muted-foreground">
            {a.emoji} {a.title}
          </span>
        ))}
        {animations.length > 3 && <span className="text-[10px] text-muted-foreground">+{animations.length - 3}</span>}
      </div>
    </div>
  );
}
