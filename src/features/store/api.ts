import { ApiError, fetchApi } from "@/lib/apiClient";
import type { StoreData, StoreGoodsItem, StoreMapItem, StoreType } from "@/types/domain";

// 백엔드 enum(POPUP/STORE) ↔ 프론트 표기(popup/permanent).
function mapStoreType(raw: string): StoreType {
  return raw === "POPUP" ? "popup" : "permanent";
}

interface RawStore extends Omit<StoreData, "type"> {
  type: string;
}

function normalizeStore(raw: RawStore): StoreData {
  return { ...raw, type: mapStoreType(raw.type) };
}

export async function getStores(params: { animationId?: number; region?: string; keyword?: string } = {}): Promise<StoreData[]> {
  const qs = new URLSearchParams();
  if (params.animationId) qs.set("animationId", String(params.animationId));
  if (params.region) qs.set("region", params.region);
  if (params.keyword) qs.set("keyword", params.keyword);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const raw = await fetchApi<RawStore[]>(`/api/v1/stores${suffix}`);
  return raw.map(normalizeStore);
}

// 404("존재하지 않는 업체")만 null로 삼키고, 그 외(500/403 등 서버·설정
// 버그)는 그대로 던짐 — 호출부가 "없는 업체"와 "서버 에러"를 구분해서
// 다른 화면을 보여줄 수 있게 함.
export async function getStoreById(storeId: number): Promise<StoreData | null> {
  try {
    const raw = await fetchApi<RawStore>(`/api/v1/stores/${storeId}`);
    return normalizeStore(raw);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

interface RawStoreMapItem extends Omit<StoreMapItem, "type"> {
  type: string;
}

export async function getStoresNearby(params: {
  lat: number;
  lng: number;
  radius?: number;
  animationId?: number;
  region?: string;
}): Promise<StoreMapItem[]> {
  const qs = new URLSearchParams({ lat: String(params.lat), lng: String(params.lng) });
  if (params.radius) qs.set("radius", String(params.radius));
  if (params.animationId) qs.set("animationId", String(params.animationId));
  if (params.region) qs.set("region", params.region);
  const raw = await fetchApi<RawStoreMapItem[]>(`/api/v1/stores/map?${qs.toString()}`);
  return raw.map((s) => ({ ...s, type: mapStoreType(s.type) }));
}

export async function getStoreGoods(storeId: number): Promise<StoreGoodsItem[]> {
  return fetchApi<StoreGoodsItem[]>(`/api/v1/stores/${storeId}/goods`);
}
