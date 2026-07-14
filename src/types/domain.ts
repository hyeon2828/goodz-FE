export type StoreType = "popup" | "permanent";
export type UserRole = "user" | "store";

export interface AnimationData {
  id: number;
  title: string;
  gradient: string;
  emoji: string;
}

export interface StoreData {
  id: number;
  name: string;
  type: StoreType;
  address: string;
  region: string;
  startDate?: string;
  endDate?: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface GoodsData {
  id: number;
  name: string;
  animationId: number;
  storeId: number;
  price: number;
  stock: number;
  category: string;
  gradient: string;
  description: string;
}

export interface Plan {
  uid: string;
  title: string;
  date: string;
}

export interface PlanEntry {
  uid: string;
  planUid: string;
  goodsId: number;
  storeId: number;
}

export interface ManagedGoods {
  uid: string;
  name: string;
  animationName: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  gradient: string;
  imagePreview?: string;
}

export interface ManagedStore {
  uid: string;
  name: string;
  address: string;
  type: StoreType;
  startDate?: string;
  endDate?: string;
  description: string;
  subAdmins: string[];
  goods: ManagedGoods[];
}
