import { fetchApi } from "@/lib/apiClient";
import type { AnimationData, GoodsDetail, GoodsSummary } from "@/types/domain";

export async function getAnimations(keyword?: string): Promise<AnimationData[]> {
  const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
  return fetchApi<AnimationData[]>(`/api/v1/animations${qs}`);
}

export async function getRegions(): Promise<string[]> {
  return fetchApi<string[]>("/api/v1/region");
}

export async function searchGoodsByKeyword(q: string): Promise<GoodsSummary[]> {
  return fetchApi<GoodsSummary[]>(`/api/v1/goods?q=${encodeURIComponent(q)}`);
}

export async function searchGoods(params: { animationId?: number; region?: string; keyword?: string } = {}): Promise<GoodsSummary[]> {
  const qs = new URLSearchParams();
  if (params.animationId) qs.set("animationId", String(params.animationId));
  if (params.region) qs.set("region", params.region);
  if (params.keyword) qs.set("keyword", params.keyword);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return fetchApi<GoodsSummary[]>(`/api/v1/goods/search${suffix}`);
}

export async function getGoodsDetail(goodsId: number): Promise<GoodsDetail> {
  return fetchApi<GoodsDetail>(`/api/v1/goods/${goodsId}`);
}
