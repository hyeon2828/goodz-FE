import type { StoreType } from "@/types/domain";

export function mapStoreTypeFromBackend(raw: string): StoreType {
  return raw === "POPUP" ? "popup" : "permanent";
}

export function mapStoreTypeToBackend(type: StoreType): "POPUP" | "STORE" {
  return type === "popup" ? "POPUP" : "STORE";
}
