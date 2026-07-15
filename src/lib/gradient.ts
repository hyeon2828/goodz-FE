// 실제 API 응답엔 굿즈/작품 전용 색상이 없어서, id를 결정론적으로
// 팔레트에 매핑해 장식용 그라디언트를 생성 — 같은 id는 항상 같은 색.
const GRADIENTS = [
  "from-violet-600 to-pink-500", "from-blue-500 to-indigo-400",
  "from-emerald-500 to-teal-400", "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400", "from-cyan-500 to-blue-400",
  "from-orange-500 to-red-400", "from-green-500 to-emerald-400",
];

export function gradientForId(id: number): string {
  return GRADIENTS[id % GRADIENTS.length];
}
