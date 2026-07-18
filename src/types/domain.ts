export type StoreType = "popup" | "permanent";
export type UserRole = "user" | "store";

export interface AnimationData {
  id: number;
  title: string;
}

export interface GoodsSummary {
  id: number;
  name: string;
  animationId: number;
  animationTitle: string;
}

export interface GoodsStoreOffer {
  storeGoodsId: number;
  storeId: number;
  storeName: string;
  address: string;
  price: number;
  stock: number;
  imagePath: string | null;
}

// 같은 굿즈를 파는 업체가 여럿일 수 있어 stores 배열 (굿즈 1:업체 1 가정 아님).
export interface GoodsDetail {
  id: number;
  name: string;
  animationId: number;
  animationTitle: string;
  stores: GoodsStoreOffer[];
}

export interface StoreData {
  id: number;
  name: string;
  type: StoreType;
  address: string;
  lat: number;
  lng: number;
  startDate?: string;
  endDate?: string;
  description: string;
  goodsCount?: number;
}

export interface StoreMapItem {
  id: number;
  name: string;
  type: StoreType;
  address: string;
  lat: number;
  lng: number;
  startDate?: string;
  endDate?: string;
  distance: number;
}

export interface StoreGoodsItem {
  storeGoodsId: number;
  goodsId: number;
  goodsName: string;
  animationTitle: string;
  price: number;
  stock: number;
  imagePath: string | null;
}

export interface Plan {
  id: number;
  title: string;
  date: string;
  goodsCount: number;
}

// 담을 당시 가격을 스냅샷으로 저장 — 나중에 업체가 가격을 바꿔도 유지됨.
export interface PlanEntry {
  id: number;
  plannerId: number;
  storeGoodsId: number;
  goodsName: string;
  animationTitle: string;
  storeId: number;
  storeName: string;
  price: number;
}

export type PendingPlanItem = Omit<PlanEntry, "id" | "plannerId">;

export interface StoreAdmin {
  id: number;
  storeId: number;
  userId: number;
  name: string;
  email: string;
}
