import type { StoreGoodsItem } from "@/types/domain";

export interface RawStoreGoodsResponse {
  id: number;
  storeId: number;
  goodsInfo: { id: number; name: string; animationId: number; animationName: string };
  price: number;
  stock: number;
  imagePath: string | null;
}

// StoreGoodsResponse(관리자 CRUD 응답)를 StoreGoodsItem(공개 /stores/{id}/goods
// 목록과 동일한 평탄화 모양)으로 맞춰서, 관리자 페이지가 두 응답을 같은
// 타입으로 다룰 수 있게 함.
export function normalizeStoreGoods(raw: RawStoreGoodsResponse): StoreGoodsItem {
  return {
    storeGoodsId: raw.id,
    goodsId: raw.goodsInfo.id,
    goodsName: raw.goodsInfo.name,
    animationTitle: raw.goodsInfo.animationName,
    price: raw.price,
    stock: raw.stock,
    imagePath: raw.imagePath,
  };
}
