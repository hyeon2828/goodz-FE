import type { AnimationData, GoodsData } from "@/types/domain";

// 이 feature 내부 전용 — api.ts만 여기서 import할 것. 다른 모든 모듈은
// ./api.ts의 async 함수를 거쳐 읽어서, 나중에 실제 백엔드로 교체해도
// 호출부 변경 불필요.

export const ANIMATIONS: AnimationData[] = [
  { id: 1, title: "귀멸의 칼날", gradient: "from-red-600 to-orange-500", emoji: "⚔️" },
  { id: 2, title: "주술회전", gradient: "from-violet-600 to-indigo-500", emoji: "👁️" },
  { id: 3, title: "나의 히어로 아카데미아", gradient: "from-emerald-500 to-teal-400", emoji: "💪" },
  { id: 4, title: "원피스", gradient: "from-amber-500 to-yellow-400", emoji: "☠️" },
  { id: 5, title: "스파이 패밀리", gradient: "from-rose-500 to-pink-400", emoji: "🕵️" },
  { id: 6, title: "하이큐", gradient: "from-orange-500 to-amber-400", emoji: "🏐" },
  { id: 7, title: "진격의 거인", gradient: "from-slate-500 to-zinc-600", emoji: "⚡" },
];

export const REGIONS = ["서울", "경기", "부산", "대구", "인천", "대전"];

export const GOODS: GoodsData[] = [
  { id: 1, name: "탄지로 아크릴 스탠드", animationId: 1, storeId: 2, price: 15000, stock: 24, category: "아크릴", gradient: "from-red-600 to-orange-500", description: "극장판 연계 한정판 아크릴 스탠드. 투명 베이스 포함, 높이 약 12cm." },
  { id: 2, name: "네즈코 키링", animationId: 1, storeId: 2, price: 9000, stock: 48, category: "키링", gradient: "from-pink-500 to-rose-400", description: "핑크 특수 도색이 적용된 네즈코 키링." },
  { id: 3, name: "탄지로&카나오 포스터", animationId: 1, storeId: 1, price: 12000, stock: 15, category: "포스터", gradient: "from-red-500 to-amber-500", description: "A3 사이즈 광택 포스터." },
  { id: 4, name: "우즈이 텐겐 선글라스 키링", animationId: 1, storeId: 2, price: 11000, stock: 32, category: "키링", gradient: "from-amber-500 to-red-500", description: "우즈이 특유의 화려한 선글라스를 모티프로 한 메탈 키링." },
  { id: 5, name: "고조 사토루 아크릴 스탠드", animationId: 2, storeId: 3, price: 18000, stock: 30, category: "아크릴", gradient: "from-blue-500 to-indigo-400", description: "생일 기념 한정 일러스트. 안대 버전과 눈 뜬 버전 2종 세트." },
  { id: 6, name: "이타도리 유지 머그컵", animationId: 2, storeId: 3, price: 22000, stock: 12, category: "머그컵", gradient: "from-violet-600 to-purple-400", description: "전자레인지·식기세척기 사용 가능. 350ml 용량." },
  { id: 7, name: "주술회전 에코백", animationId: 2, storeId: 1, price: 28000, stock: 20, category: "에코백", gradient: "from-violet-500 to-blue-400", description: "내구성 높은 캔버스 소재." },
  { id: 8, name: "나나미 켄토 포스터", animationId: 2, storeId: 3, price: 13000, stock: 9, category: "포스터", gradient: "from-indigo-500 to-violet-600", description: "인기 캐릭터 나나미의 단독 일러스트. B2 사이즈." },
  { id: 9, name: "데쿠 피규어 (10cm)", animationId: 3, storeId: 5, price: 45000, stock: 8, category: "피규어", gradient: "from-green-500 to-emerald-400", description: "10주년 기념 특제 피규어. 풀 파워 폼 재현." },
  { id: 10, name: "올마이트 포스터 세트", animationId: 3, storeId: 1, price: 19000, stock: 35, category: "포스터", gradient: "from-teal-500 to-green-400", description: "히어로 활동기·은퇴 후 2종 포스터 세트." },
  { id: 11, name: "루피 키링", animationId: 4, storeId: 1, price: 8000, stock: 60, category: "키링", gradient: "from-amber-500 to-orange-400", description: "밀짚모자를 쓴 루피 SD 버전 키링." },
  { id: 12, name: "조로 아크릴 스탠드", animationId: 4, storeId: 4, price: 16000, stock: 18, category: "아크릴", gradient: "from-green-600 to-lime-500", description: "삼도류 자세를 취한 조로 아크릴 스탠드." },
  { id: 13, name: "아냐 포르저 봉제인형", animationId: 5, storeId: 1, price: 35000, stock: 25, category: "인형", gradient: "from-rose-500 to-pink-400", description: "폭신폭신한 아냐 인형. 높이 약 20cm." },
  { id: 14, name: "로이드 포르저 키링", animationId: 5, storeId: 4, price: 9000, stock: 40, category: "키링", gradient: "from-pink-600 to-rose-500", description: "정장 차림의 로이드 SD 키링." },
  { id: 15, name: "히나타 쇼요 아크릴 스탠드", animationId: 6, storeId: 4, price: 14000, stock: 22, category: "아크릴", gradient: "from-orange-500 to-amber-400", description: "점프 장면을 포착한 역동적인 구도." },
  { id: 16, name: "에렌 예거 피규어 (15cm)", animationId: 7, storeId: 1, price: 52000, stock: 5, category: "피규어", gradient: "from-slate-600 to-stone-500", description: "최종화 기념 한정 피규어. 15cm 대형." },
];
