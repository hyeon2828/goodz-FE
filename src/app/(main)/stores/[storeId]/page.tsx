import { notFound } from "next/navigation";
import { safeFetch } from "@/lib/apiClient";
import { getStoreById, getStoreGoods } from "@/features/store/api";
import { StoreDetailClient } from "./StoreDetailClient";

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;

  const storeResult = await safeFetch(getStoreById(Number(storeId)), null);
  if (storeResult.error) {
    return (
      <div className="min-h-screen bg-background pt-14 md:pt-16 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red-400 font-medium mb-2">업체 정보를 불러오지 못했습니다</p>
          <p className="text-xs text-muted-foreground">{storeResult.error}</p>
        </div>
      </div>
    );
  }
  if (!storeResult.data) notFound();

  const goodsResult = await safeFetch(getStoreGoods(storeResult.data.id), []);

  return <StoreDetailClient store={storeResult.data} storeGoods={goodsResult.data} storeGoodsError={goodsResult.error} />;
}
