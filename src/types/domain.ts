export type StoreType = "popup" | "permanent";
export type UserRole = "user" | "store";

export interface AnimationData {
  id: number;
  title: string;
}

// /goods, /goods/search 목록 응답 — 가격/재고/업체 정보 없음(업체마다
// 다르므로 상세에서만 제공).
export interface GoodsSummary {
  id: number;
  name: string;
  animationId: number;
  animationTitle: string;
}

// 굿즈 하나를 파는 업체 한 곳의 판매 정보 (= storeGoods, 실제 가격/재고의
// 주인). GoodsDetail.stores[]의 원소.
export interface GoodsStoreOffer {
  storeGoodsId: number;
  storeId: number;
  storeName: string;
  address: string;
  price: number;
  stock: number;
  imagePath: string | null;
}

// /goods/{goodsId} 상세 응답 — 같은 굿즈를 파는 업체가 여럿일 수 있어
// stores 배열로 내려옴 (굿즈 1:업체 1 가정 아님).
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

// /stores/map 응답 — 좌표 기준 검색이라 거리(distance)가 추가로 옴.
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

// /stores/{storeId}/goods 응답 — 특정 업체 기준이라 storeGoods 관점에서
// 이미 가격/재고/굿즈명/작품명이 한 번에 옴 (추가 조회 불필요).
export interface StoreGoodsItem {
  storeGoodsId: number;
  goodsId: number;
  goodsName: string;
  animationTitle: string;
  price: number;
  stock: number;
  imagePath: string | null;
}

// GET /planners 목록 응답의 원소 — goodsCount만 요약으로 오고 실제 담긴
// 굿즈 목록(goods[])은 없음. 상세가 필요하면 GET /planners/{id}를 따로 호출.
export interface Plan {
  id: number;
  title: string;
  date: string;
  goodsCount: number;
}

// storeGoodsId(= 실제 판매 단위) 기준. 담을 당시의 표시 정보를 스냅샷으로
// 같이 저장해서, 플래너 화면이 굿즈/업체 카탈로그를 다시 조회할 필요가
// 없고, 나중에 업체가 가격을 바꿔도 이미 담은 항목의 가격은 유지됨.
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

// "플래너에 담기" 직전 상태 — PlanEntry에서 아직 id/plannerId가 없는 것뿐.
// GoodsDetailModal(여러 업체 중 하나 선택) / StoreGoodsCard(이미 업체
// 하나로 좁혀진 컨텍스트) 양쪽 다 여기로 귀결됨.
export type PendingPlanItem = Omit<PlanEntry, "id" | "plannerId">;

// GET/POST/DELETE /stores/{storeId}/admin 응답 원소 — 서브 관리자 한 명.
// 메인 관리자(업체주 본인)는 이 목록에 포함되는지 스펙만으론 알 수
// 없어서, 호출부가 로그인한 본인 이메일과 일치하는 항목은 방어적으로
// 걸러내고 별도 고정 행으로 표시함.
export interface StoreAdmin {
  id: number;
  storeId: number;
  userId: number;
  name: string;
  email: string;
}
