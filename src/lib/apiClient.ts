import { API_BASE_URL } from "./env";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

// 404는 "진짜 없음", 500/403은 서버·설정 버그 — 호출부가 status로 구분함.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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

export async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<{ data: T; error: string | null }> {
  try {
    return { data: await promise, error: null };
  } catch (e) {
    return { data: fallback, error: e instanceof Error ? e.message : "불러오지 못했습니다" };
  }
}
