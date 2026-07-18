// origin만 포함(예: "http://localhost:8080") — /api/v1 등 경로 접두사는
// 이 상수에 넣지 않고 각 fetch 호출부가 전체 경로를 붙임.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
