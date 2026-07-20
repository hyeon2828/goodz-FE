"use client";

import { useEffect, useId, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { searchGoodsByKeyword } from "@/features/goods/api";
import type { GoodsSummary } from "@/types/domain";

export function ExistingGoodsSelector({
  registeredGoodsIds,
  value,
  onChange,
  error,
}: {
  registeredGoodsIds: Set<number>;
  value: GoodsSummary | null;
  onChange: (goods: GoodsSummary | null) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoodsSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const inputId = useId();
  const errorId = `${inputId}-error`;

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword || value) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setSearchError("");
      searchGoodsByKeyword(keyword)
        .then((goods) => {
          if (!cancelled) setResults(goods);
        })
        .catch((e) => {
          if (!cancelled) {
            setResults([]);
            setSearchError(e instanceof Error ? e.message : "굿즈를 검색하지 못했습니다");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, value]);

  if (value) {
    return (
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          선택한 굿즈 <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{value.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{value.animationTitle}</p>
          </div>
          <button type="button" onClick={() => onChange(null)} aria-label="선택 취소" className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-xs text-muted-foreground mb-1.5 block font-medium">
        기존 굿즈 검색 <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          id={inputId}
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            setQuery(nextQuery);
            setResults([]);
            setSearchError("");
            setLoading(Boolean(nextQuery.trim()));
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder="굿즈명을 입력하세요"
          className={`w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${error ? "border-red-500/60" : "border-border focus:border-violet-500/50"}`}
        />
      </div>
      {error && <p id={errorId} className="mt-1 text-[11px] font-medium text-red-400">{error}</p>}
      {searchError && <p className="mt-1 text-[11px] font-medium text-red-400">{searchError}</p>}

      {query.trim() && (
        <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-border bg-card p-1">
          {loading ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">검색 중...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">검색 결과가 없습니다</p>
          ) : (
            results.map((goods) => {
              const registered = registeredGoodsIds.has(goods.id);
              return (
                <button
                  key={goods.id}
                  type="button"
                  disabled={registered}
                  onClick={() => onChange(goods)}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-foreground">{goods.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{goods.animationTitle}</span>
                  </span>
                  {registered && (
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Check size={11} /> 등록됨
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
