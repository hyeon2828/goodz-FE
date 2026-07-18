import type { StoreGoodsItem } from "@/types/domain";

export interface RawStoreGoodsResponse {
  id: number;
  storeId: number;
  goodsInfo: { id: number; name: string; animationId: number; animationName: string };
  price: number;
  stock: number;
  imagePath: string | null;
}

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
