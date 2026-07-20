import type { StoreAdmin, StoreData, StoreGoodsItem, StoreType } from "@/types/domain";
import { callAuthenticatedRoute, type ApiResult } from "@/lib/authenticatedApi";

interface StoreInput {
  name: string;
  description: string;
  type: StoreType;
  startDate?: string;
  endDate?: string;
  address: string;
}

export function createStore(input: StoreInput) {
  return callAuthenticatedRoute<StoreData>("/api/stores", { method: "POST", body: JSON.stringify(input) });
}

export function getManagedStores() {
  return callAuthenticatedRoute<StoreData[]>("/api/stores/admin");
}

export function getManagedStoreDetail(storeId: number) {
  return callAuthenticatedRoute<StoreData>(`/api/stores/${storeId}`);
}

export function updateStore(storeId: number, input: StoreInput) {
  return callAuthenticatedRoute<StoreData>(`/api/stores/${storeId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function getStoreAdmins(storeId: number) {
  return callAuthenticatedRoute<StoreAdmin[]>(`/api/stores/${storeId}/admin`);
}

export function addStoreAdmin(storeId: number, email: string) {
  return callAuthenticatedRoute<StoreAdmin>(`/api/stores/${storeId}/admin`, { method: "POST", body: JSON.stringify({ email }) });
}

export function removeStoreAdmin(storeId: number, storeAdminId: number) {
  return callAuthenticatedRoute(`/api/stores/${storeId}/admin/${storeAdminId}`, { method: "DELETE" });
}

export function createStoreGoods(storeId: number, input: { animationId: number; name: string; price: number; stock: number }) {
  return callAuthenticatedRoute<StoreGoodsItem>(`/api/stores/${storeId}/goods/new`, { method: "POST", body: JSON.stringify(input) });
}

export function addExistingStoreGoods(storeId: number, input: { goodsId: number; price: number; stock: number }) {
  return callAuthenticatedRoute<StoreGoodsItem>(`/api/stores/${storeId}/goods`, { method: "POST", body: JSON.stringify(input) });
}

export function updateStoreGoods(storeId: number, storeGoodsId: number, input: { price: number; stock: number; imagePath?: string }) {
  return callAuthenticatedRoute<StoreGoodsItem>(`/api/stores/${storeId}/goods/${storeGoodsId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteStoreGoods(storeId: number, storeGoodsId: number) {
  return callAuthenticatedRoute(`/api/stores/${storeId}/goods/${storeGoodsId}`, { method: "DELETE" });
}

interface PresignedUploadData {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

function getPresignedUploadUrl(storeId: number, storeGoodsId: number, file: File) {
  return callAuthenticatedRoute<PresignedUploadData>(`/api/stores/${storeId}/goods/${storeGoodsId}/presigned-url`, {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
  });
}

function setStoreGoodsImagePath(storeId: number, storeGoodsId: number, imagePath: string) {
  return callAuthenticatedRoute(`/api/stores/${storeId}/goods/${storeGoodsId}/image-path`, {
    method: "PUT",
    body: JSON.stringify({ imagePath }),
  });
}

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
