import { notFound } from "next/navigation";
import { getAnimations, getGoodsByStoreId } from "@/features/goods/api";
import { getStoreById } from "@/features/store/api";
import { StoreDetailClient } from "./StoreDetailClient";

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await getStoreById(Number(storeId));
  if (!store) notFound();

  const [storeGoods, animations] = await Promise.all([getGoodsByStoreId(store.id), getAnimations()]);

  return <StoreDetailClient store={store} storeGoods={storeGoods} animations={animations} />;
}
