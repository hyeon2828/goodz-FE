import type { ManagedGoods, StoreData } from "@/types/domain";

// STORES는 이 feature 내부 전용 — api.ts만 import할 것.
// GRADIENTS/pickGradient는 로컬 UI 유틸(실제 사진 없는 관리자 등록
// 굿즈에 색상 자동 배정)이라 카탈로그 데이터 아님, 직접 import 유지.

export const STORES: StoreData[] = [
  { id: 1, name: "애니메이트 홍대점", type: "permanent", address: "서울 마포구 와우산로 21", region: "서울", description: "국내 최대 규모 애니메이션 굿즈 전문샵.", rating: 4.8, reviewCount: 1243 },
  { id: 2, name: "귀멸의 칼날 공식 팝업", type: "popup", address: "서울 강남구 강남대로 396", region: "서울", startDate: "2025-06-01", endDate: "2025-07-31", description: "극장판 연계 공식 팝업. 한정판 굿즈 판매.", rating: 4.9, reviewCount: 876 },
  { id: 3, name: "주술회전 팝업 @AK플라자", type: "popup", address: "경기 성남시 분당구 황새울로 360", region: "경기", startDate: "2025-06-15", endDate: "2025-07-20", description: "주술회전 시즌3 기념 한정판 굿즈.", rating: 4.7, reviewCount: 532 },
  { id: 4, name: "오타쿠 천국 부산점", type: "permanent", address: "부산 부산진구 중앙대로 692", region: "부산", description: "부산 최대 규모 애니 굿즈 전문점.", rating: 4.5, reviewCount: 389 },
  { id: 5, name: "히어로 아카데미아 10주년 팝업", type: "popup", address: "서울 송파구 올림픽로 300", region: "서울", startDate: "2025-07-01", endDate: "2025-08-15", description: "나의 히어로 아카데미아 10주년 기념 특별 팝업.", rating: 4.6, reviewCount: 210 },
];

export const GRADIENTS = [
  "from-violet-600 to-pink-500", "from-blue-500 to-indigo-400",
  "from-emerald-500 to-teal-400", "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400", "from-cyan-500 to-blue-400",
  "from-orange-500 to-red-400", "from-green-500 to-emerald-400",
];

export function pickGradient(goods: ManagedGoods[]) {
  return GRADIENTS[goods.length % GRADIENTS.length];
}
