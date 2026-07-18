"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { StoreData } from "@/types/domain";

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function KakaoMap({ stores, onSelect }: { stores: StoreData[]; onSelect: (s: StoreData) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || mapRef.current) return;
    mapRef.current = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 8,
    });
  }, [sdkReady]);

  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    const map = mapRef.current;

    const overlays = stores.map((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng);

      const el = document.createElement("div");
      el.className = "relative flex flex-col items-center cursor-pointer";

      const badge = document.createElement("div");
      badge.className = `w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-sm shadow-xl ${
        store.type === "popup" ? "bg-rose-500 border-rose-300 shadow-rose-900/60" : "bg-violet-600 border-violet-400 shadow-violet-900/60"
      }`;
      badge.textContent = store.type === "popup" ? "🎪" : "🏪";
      el.appendChild(badge);

      const tooltip = document.createElement("div");
      tooltip.className =
        "hidden absolute top-10 md:top-12 bg-background/95 backdrop-blur-sm border border-border text-foreground text-[11px] px-3 py-2 rounded-xl whitespace-nowrap shadow-xl z-10 text-left min-w-max";
      tooltip.innerHTML = `<div class="font-bold">${store.name}</div><div class="text-muted-foreground mt-0.5">${store.address
        .split(" ")
        .slice(0, 3)
        .join(" ")}</div>`;
      el.appendChild(tooltip);

      el.addEventListener("mouseenter", () => tooltip.classList.remove("hidden"));
      el.addEventListener("mouseleave", () => tooltip.classList.add("hidden"));
      el.addEventListener("click", () => onSelect(store));

      const overlay = new window.kakao.maps.CustomOverlay({ position, content: el, xAnchor: 0.5, yAnchor: 0.5 });
      overlay.setMap(map);
      return overlay;
    });
    overlaysRef.current = overlays;

    if (stores.length === 1) {
      // 좌표 하나로 setBounds하면 과도하게 확대된 레벨로 튐 — center+고정 level로 대신 처리.
      map.setCenter(new window.kakao.maps.LatLng(stores[0].lat, stores[0].lng));
      map.setLevel(5);
    } else if (stores.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds();
      stores.forEach((s) => bounds.extend(new window.kakao.maps.LatLng(s.lat, s.lng)));
      map.setBounds(bounds);
    }

    return () => {
      overlays.forEach((ov) => ov.setMap(null));
    };
  }, [stores, sdkReady, onSelect]);

  if (!KAKAO_MAP_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0D1B2E] rounded-xl text-xs text-muted-foreground">
        지도 API 키가 설정되지 않았습니다
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <Script
        id="kakao-maps-sdk"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => window.kakao.maps.load(() => setSdkReady(true))}
        onError={() => setLoadError("지도 기능을 준비 중입니다")}
      />
      {loadError ? (
        <div className="w-full h-full flex items-center justify-center bg-[#0D1B2E] text-xs text-muted-foreground">{loadError}</div>
      ) : (
        <div ref={containerRef} className="w-full h-full bg-[#0D1B2E]" />
      )}
    </div>
  );
}
