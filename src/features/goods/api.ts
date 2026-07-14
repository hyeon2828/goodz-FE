import type { AnimationData, GoodsData } from "@/types/domain";
import { ANIMATIONS, GOODS, REGIONS } from "./mock-data";

// mock 기반 데이터 계층. 모든 export 현재는 동기적으로 resolve하지만,
// async(fetch 형태) 계약 유지하여 각 함수 내부만 실제 Spring Boot API
// `fetch()` 호출로 교체 시 호출부 변경 불필요.

export async function getAnimations(): Promise<AnimationData[]> {
  return ANIMATIONS;
}

export async function getAnimationById(id: number): Promise<AnimationData | null> {
  return ANIMATIONS.find((a) => a.id === id) ?? null;
}

export async function getRegions(): Promise<string[]> {
  return REGIONS;
}

export async function getGoodsList(): Promise<GoodsData[]> {
  return GOODS;
}

export async function getGoodsById(id: number): Promise<GoodsData | null> {
  return GOODS.find((g) => g.id === id) ?? null;
}

export async function getGoodsByStoreId(storeId: number): Promise<GoodsData[]> {
  return GOODS.filter((g) => g.storeId === storeId);
}
