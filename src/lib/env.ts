// Spring Boot API base URL을 읽는 중앙 지점. 아직 실제 엔드포인트 호출
// 없음(features/goods/api.ts, features/store/api.ts 여전히 mock 기반),
// 나중에 연동 시 여기서부터 읽어감.
//
// 컨벤션: API_BASE_URL은 origin만 포함(scheme + host + port), 예:
// "http://localhost:8080" — /api나 /api/v1 미포함. 각 fetch 호출부가
// 버전 접두사 포함한 전체 경로 책임:
//
//   fetch(`${API_BASE_URL}/api/v1/auth/signup/member`, { ... })
//
// /api/v1을 이 상수에 미리 넣으면 호출부에서 또 붙여야 하는지 헷갈리고,
// 같은 접두사를 안 쓰는 엔드포인트가 나오면(생길 경우) 별도 예외 처리 필요.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
