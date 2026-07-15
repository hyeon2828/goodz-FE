import type { StoreAdmin, StoreData, StoreGoodsItem, StoreType } from "@/types/domain";

// 관리자 대시보드(업체 등록/수정, 관리자 초대, 굿즈 CRUD, 이미지 업로드)
// 전용 — 전부 JWT 필요라 같은 origin의 Route Handler(app/api/stores/*)만
// 호출함(features/store/api.ts의 공개 조회 함수들과 달리 Spring Boot를
// 직접 부르지 않음).

interface ApiResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

async function callLocalRoute<T = undefined>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      credentials: "include",
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { success: false, message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}

interface StoreInput {
  name: string;
  description: string;
  type: StoreType;
  startDate?: string;
  endDate?: string;
  address: string;
}

export function createStore(input: StoreInput) {
  return callLocalRoute<StoreData>("/api/stores", { method: "POST", body: JSON.stringify(input) });
}

export function getManagedStores() {
  return callLocalRoute<StoreData[]>("/api/stores/admin");
}

export function getManagedStoreDetail(storeId: number) {
  return callLocalRoute<StoreData>(`/api/stores/${storeId}`);
}

export function updateStore(storeId: number, input: StoreInput) {
  return callLocalRoute<StoreData>(`/api/stores/${storeId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function getStoreAdmins(storeId: number) {
  return callLocalRoute<StoreAdmin[]>(`/api/stores/${storeId}/admin`);
}

export function addStoreAdmin(storeId: number, email: string) {
  return callLocalRoute<StoreAdmin>(`/api/stores/${storeId}/admin`, { method: "POST", body: JSON.stringify({ email }) });
}

export function removeStoreAdmin(storeId: number, storeAdminId: number) {
  return callLocalRoute(`/api/stores/${storeId}/admin/${storeAdminId}`, { method: "DELETE" });
}

export function createStoreGoods(storeId: number, input: { animationId: number; name: string; price: number; stock: number }) {
  return callLocalRoute<StoreGoodsItem>(`/api/stores/${storeId}/goods/new`, { method: "POST", body: JSON.stringify(input) });
}

export function updateStoreGoods(storeId: number, storeGoodsId: number, input: { price: number; stock: number; imagePath?: string }) {
  return callLocalRoute<StoreGoodsItem>(`/api/stores/${storeId}/goods/${storeGoodsId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteStoreGoods(storeId: number, storeGoodsId: number) {
  return callLocalRoute(`/api/stores/${storeId}/goods/${storeGoodsId}`, { method: "DELETE" });
}

interface PresignedUploadData {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

function getPresignedUploadUrl(storeId: number, storeGoodsId: number, file: File) {
  return callLocalRoute<PresignedUploadData>(`/api/stores/${storeId}/goods/${storeGoodsId}/presigned-url`, {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
  });
}

function setStoreGoodsImagePath(storeId: number, storeGoodsId: number, imagePath: string) {
  return callLocalRoute(`/api/stores/${storeId}/goods/${storeGoodsId}/image-path`, {
    method: "PUT",
    body: JSON.stringify({ imagePath }),
  });
}

// presigned URL 발급 → S3 직접 업로드 → 최종 경로 등록, 3단계를 한 번에
// 처리. 중간 단계 실패 시 어느 단계에서 멈췄는지 메시지로 구분해서
// 반환(호출부가 "굿즈는 등록됐지만 이미지 업로드에 실패했습니다" 같은
// 안내를 붙일 수 있게).
export async function uploadStoreGoodsImage(storeId: number, storeGoodsId: number, file: File): Promise<ApiResult<{ imagePath: string }>> {
  const presigned = await getPresignedUploadUrl(storeId, storeGoodsId, file);
  if (!presigned.success || !presigned.data) {
    return { success: false, message: presigned.message || "업로드 URL 발급에 실패했습니다." };
  }

  try {
    const uploadRes = await fetch(presigned.data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadRes.ok) {
      return { success: false, message: `이미지 업로드에 실패했습니다 (${uploadRes.status})` };
    }
  } catch {
    return { success: false, message: "이미지 업로드 중 네트워크 오류가 발생했습니다." };
  }

  const registerResult = await setStoreGoodsImagePath(storeId, storeGoodsId, presigned.data.objectKey);
  if (!registerResult.success) {
    return { success: false, message: registerResult.message || "업로드된 이미지 등록에 실패했습니다." };
  }
  return { success: true, message: registerResult.message, data: { imagePath: presigned.data.objectKey } };
}
