"use client";

import { useState } from "react";
import type { StoreData } from "@/types/domain";

const MAP_POSITIONS: Record<number, { x: string; y: string }> = {
  1: { x: "33%", y: "40%" }, 2: { x: "54%", y: "62%" }, 3: { x: "70%", y: "28%" },
  4: { x: "18%", y: "72%" }, 5: { x: "60%", y: "48%" },
};

export function MockMap({ stores, onSelect }: { stores: StoreData[]; onSelect: (s: StoreData) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="relative w-full h-full bg-[#0D1B2E] overflow-hidden rounded-xl">
      <svg className="absolute inset-0 w-full h-full opacity-15">
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4466BB" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-25">
        <line x1="0" y1="43%" x2="100%" y2="47%" stroke="#2244AA" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="62%" x2="100%" y2="60%" stroke="#2244AA" strokeWidth="1.5" />
        <line x1="38%" y1="0" x2="40%" y2="100%" stroke="#2244AA" strokeWidth="3" strokeLinecap="round" />
        <line x1="60%" y1="0" x2="62%" y2="100%" stroke="#2244AA" strokeWidth="1.5" />
        <path d="M 10% 15% Q 45% 55% 90% 85%" fill="none" stroke="#2244AA" strokeWidth="1.5" />
      </svg>
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[9px] text-white/40 px-2 py-1 rounded-md font-mono">
        카카오맵 API 연동 예정
      </div>
      {stores.map((store) => {
        const pos = MAP_POSITIONS[store.id];
        if (!pos) return null;
        return (
          <button
            key={store.id}
            onClick={() => onSelect(store)}
            onMouseEnter={() => setHovered(store.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ left: pos.x, top: pos.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-sm shadow-xl transition-transform duration-200 ${
                  hovered === store.id ? "scale-125" : "scale-100"
                } ${
                  store.type === "popup"
                    ? "bg-rose-500 border-rose-300 shadow-rose-900/60"
                    : "bg-violet-600 border-violet-400 shadow-violet-900/60"
                }`}
              >
                {store.type === "popup" ? "🎪" : "🏪"}
              </div>
              {hovered === store.id && (
                <div className="absolute top-10 md:top-12 bg-background/95 backdrop-blur-sm border border-border text-foreground text-[11px] px-3 py-2 rounded-xl whitespace-nowrap shadow-xl z-10 text-left min-w-max">
                  <div className="font-bold">{store.name}</div>
                  <div className="text-muted-foreground mt-0.5">{store.address.split(" ").slice(0, 3).join(" ")}</div>
                </div>
              )}
            </div>
          </button>
        );
      })}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-2 text-[10px] space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0" />
          <span className="text-white/70">팝업</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block shrink-0" />
          <span className="text-white/70">상설</span>
        </div>
      </div>
    </div>
  );
}
