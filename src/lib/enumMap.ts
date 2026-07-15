import type { StoreType } from "@/types/domain";

// features/store/api.ts에도 같은 방향 매핑이 로컬 함수로 따로 있음(그쪽은
// 브라우저에서 Spring Boot를 직접 호출하는 공개 조회 전용이라 파일이
// 분리돼 있음) — 여기는 app/api/stores/*.route.ts(관리자 쓰기, 서버
// 사이드 전용)가 양방향(응답 역정규화 + 요청 정규화)으로 공유해서 씀.

export function mapStoreTypeFromBackend(raw: string): StoreType {
  return raw === "POPUP" ? "popup" : "permanent";
}

export function mapStoreTypeToBackend(type: StoreType): "POPUP" | "STORE" {
  return type === "popup" ? "POPUP" : "STORE";
}
