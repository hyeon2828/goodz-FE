import { API_BASE_URL } from "./env";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

// 에러 응답이 {success,data,message} 봉투가 아닐 수도 있음(예: 처리 안 된
// 예외는 {status,message,errors} 형태로 옴) — message 필드만 있으면
// 어느 쪽이든 집어낼 수 있게 status를 같이 들고 있음. 404는 "진짜 없음"과
// 500/403(서버·설정 버그)을 호출부가 구분해서 처리할 수 있게 해줌.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// 공개 카탈로그(goods/store) 조회 전용 — 인증 불필요. api.pinnedsignal.site가
// CORS를 이미 허용해서(Access-Control-Allow-Origin 반사 확인됨), 인증
// 엔드포인트와 달리 Route Handler로 우회할 필요 없이 서버/클라이언트 어디서든
// 직접 호출 가능.
export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, cache: "no-store" });
  let body: (Partial<ApiEnvelope<T>> & { message?: string | null }) | null = null;
  try {
    body = await res.json();
  } catch {
    // 본문이 JSON이 아닌 경우(빈 응답 등) — status만으로 처리.
  }
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.message || `요청 실패 (${res.status}): ${path}`, res.status);
  }
  return body.data as T;
}

// 실패해도 화면 전체가 죽지 않도록 감싸는 헬퍼 — 성공하면 데이터, 실패하면
// fallback + 에러 메시지를 같이 반환해서 호출부가 부분 실패를 우아하게
// 표시할 수 있게 함.
export async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<{ data: T; error: string | null }> {
  try {
    return { data: await promise, error: null };
  } catch (e) {
    return { data: fallback, error: e instanceof Error ? e.message : "불러오지 못했습니다" };
  }
}
