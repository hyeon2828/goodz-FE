import { getAnimations, getRegions, searchGoods } from "@/features/goods/api";
import { getStores } from "@/features/store/api";
import { safeFetch } from "@/lib/apiClient";
import { ExploreClient } from "./ExploreClient";

export default async function GoodsPage() {
  const [goodsResult, storesResult, animationsResult, regionsResult] = await Promise.all([
    safeFetch(searchGoods(), []),
    safeFetch(getStores(), []),
    safeFetch(getAnimations(), []),
    safeFetch(getRegions(), []),
  ]);

  return (
    <ExploreClient
      goods={goodsResult.data}
      goodsError={goodsResult.error}
      stores={storesResult.data}
      storesError={storesResult.error}
      animations={animationsResult.data}
      regions={regionsResult.data}
    />
  );
}
