"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, LayoutList, Map as MapIcon, Search } from "lucide-react";
import { LoginPromptModal } from "@/components/common/LoginPromptModal";
import { MockMap } from "@/components/map/MockMap";
import { useAuth } from "@/features/auth/AuthProvider";
import { GoodsCard } from "@/features/goods/components/GoodsCard";
import { GoodsDetailModal } from "@/features/goods/components/GoodsDetailModal";
import { StoreCard } from "@/features/goods/components/StoreCard";
import { AddToPlanModal } from "@/features/planner/components/AddToPlanModal";
import type { AnimationData, GoodsData, StoreData } from "@/types/domain";

type ViewMode = "list" | "map";

export function ExploreClient({
  goods,
  stores,
  animations,
  regions,
}: {
  goods: GoodsData[];
  stores: StoreData[];
  animations: AnimationData[];
  regions: string[];
}) {
  const router = useRouter();
  const { loggedIn } = useAuth();

  const animById = useMemo(() => new Map(animations.map((a) => [a.id, a])), [animations]);
  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);

  const [query, setQuery] = useState("");
  const [selectedAnim, setSelectedAnim] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [tab, setTab] = useState<"goods" | "stores">("goods");
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [detailGoods, setDetailGoods] = useState<GoodsData | null>(null);
  const [pendingGoods, setPendingGoods] = useState<GoodsData | null>(null);

  const goToStore = (s: StoreData) => router.push(`/stores/${s.id}`);

  const filteredGoods = useMemo(
    () =>
      goods.filter((g) => {
        if (selectedAnim && g.animationId !== selectedAnim) return false;
        if (selectedRegion && storeById.get(g.storeId)?.region !== selectedRegion) return false;
        if (query) {
          const a = animById.get(g.animationId);
          return g.name.includes(query) || (a?.title.includes(query) ?? false);
        }
        return true;
      }),
    [goods, storeById, animById, selectedAnim, selectedRegion, query]
  );

  const filteredStores = useMemo(
    () =>
      stores.filter((s) => {
        if (selectedRegion && s.region !== selectedRegion) return false;
        if (selectedAnim && !goods.some((g) => g.storeId === s.id && g.animationId === selectedAnim)) return false;
        if (query) return s.name.includes(query) || s.address.includes(query);
        return true;
      }),
    [stores, goods, selectedAnim, selectedRegion, query]
  );

  const storeAnimations = (storeId: number) => {
    const ids = [...new Set(goods.filter((g) => g.storeId === storeId).map((g) => g.animationId))];
    return ids.map((id) => animById.get(id)).filter((a): a is AnimationData => !!a);
  };

  const activeFilters = (selectedAnim ? 1 : 0) + (selectedRegion ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className="bg-gradient-to-b from-violet-950/50 via-violet-950/20 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            굿즈 탐색
          </h1>
          <p className="text-muted-foreground mb-4 md:mb-6 text-sm">애니별 · 지역별로 원하는 굿즈를 찾고 방문 계획을 세워보세요</p>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="굿즈명, 작품명, 업체명 검색..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                showFilters || activeFilters > 0 ? "bg-violet-600 border-violet-600 text-white" : "bg-card border-border text-muted-foreground"
              }`}
            >
              <Filter size={14} />
              {activeFilters > 0 && <span className="text-xs">{activeFilters}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="hidden md:block space-y-3 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-semibold w-6">작품</span>
            <button
              onClick={() => setSelectedAnim(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !selectedAnim ? "bg-violet-600 text-white shadow-md shadow-violet-900/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              전체
            </button>
            {animations.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAnim(selectedAnim === a.id ? null : a.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedAnim === a.id ? "bg-violet-600 text-white shadow-md shadow-violet-900/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.emoji} {a.title}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-semibold w-6">지역</span>
            <button
              onClick={() => setSelectedRegion(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !selectedRegion ? "bg-pink-600 text-white shadow-md shadow-pink-900/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              전체
            </button>
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(selectedRegion === r ? null : r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedRegion === r ? "bg-pink-600 text-white shadow-md shadow-pink-900/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="md:hidden bg-card border border-border rounded-xl p-4 mb-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2">작품</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedAnim(null)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${!selectedAnim ? "bg-violet-600 text-white" : "bg-muted border border-border text-muted-foreground"}`}
                >
                  전체
                </button>
                {animations.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAnim(selectedAnim === a.id ? null : a.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${selectedAnim === a.id ? "bg-violet-600 text-white" : "bg-muted border border-border text-muted-foreground"}`}
                  >
                    {a.emoji} {a.title}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2">지역</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedRegion(null)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${!selectedRegion ? "bg-pink-600 text-white" : "bg-muted border border-border text-muted-foreground"}`}
                >
                  전체
                </button>
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(selectedRegion === r ? null : r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${selectedRegion === r ? "bg-pink-600 text-white" : "bg-muted border border-border text-muted-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 md:mb-5">
          {viewMode === "list" ? (
            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
              {([
                ["goods", `굿즈 ${filteredGoods.length}`],
                ["stores", `업체 ${filteredStores.length}`],
              ] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors ${tab === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">업체 {filteredStores.length}곳</p>
          )}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${viewMode === "map" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <MapIcon size={14} />
            </button>
          </div>
        </div>

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
        {detailGoods && (
          <GoodsDetailModal
            goods={detailGoods}
            anim={animById.get(detailGoods.animationId)!}
            store={storeById.get(detailGoods.storeId)!}
            onAdd={(g) => setPendingGoods(g)}
            onClose={() => setDetailGoods(null)}
          />
        )}
        {pendingGoods && (
          <AddToPlanModal goods={pendingGoods} anim={animById.get(pendingGoods.animationId)!} onClose={() => setPendingGoods(null)} />
        )}

        {viewMode === "list" ? (
          tab === "goods" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredGoods.map((g) => (
                <GoodsCard
                  key={g.id}
                  goods={g}
                  anim={animById.get(g.animationId)!}
                  store={storeById.get(g.storeId)!}
                  onAdd={(goods) => setPendingGoods(goods)}
                  isLoggedIn={loggedIn}
                  onLoginPrompt={() => setShowLoginPrompt(true)}
                  onShowDetail={loggedIn ? (goods) => setDetailGoods(goods) : undefined}
                />
              ))}
              {filteredGoods.length === 0 && <div className="col-span-4 text-center py-16 text-muted-foreground text-sm">검색 결과가 없습니다</div>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredStores.map((s) => (
                <StoreCard key={s.id} store={s} animations={storeAnimations(s.id)} onClick={() => goToStore(s)} />
              ))}
              {filteredStores.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground text-sm">검색 결과가 없습니다</div>}
            </div>
          )
        ) : (
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="w-full md:flex-1 h-72 md:h-[560px] rounded-xl overflow-hidden">
              <MockMap stores={filteredStores} onSelect={goToStore} />
            </div>
            <div className="w-full md:w-72 max-h-72 md:max-h-[560px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3 pb-2">
              {filteredStores.map((s) => (
                <StoreCard key={s.id} store={s} animations={storeAnimations(s.id)} onClick={() => goToStore(s)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="h-6 md:hidden" />
    </div>
  );
}
