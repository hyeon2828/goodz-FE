import type { StoreData } from "@/types/domain";
import { STORES } from "./mock-data";

// mock 기반 데이터 계층 — 근거는 features/goods/api.ts 참고.
// 현재는 동기적으로 resolve, Spring Boot API 준비되면 함수 내부만
// 실제 `fetch()` 호출로 교체.

export async function getStores(): Promise<StoreData[]> {
  return STORES;
}

export async function getStoreById(id: number): Promise<StoreData | null> {
  return STORES.find((s) => s.id === id) ?? null;
}
