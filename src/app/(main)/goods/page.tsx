import { getAnimations, getGoodsList, getRegions } from "@/features/goods/api";
import { getStores } from "@/features/store/api";
import { ExploreClient } from "./ExploreClient";

export default async function GoodsPage() {
  const [goods, stores, animations, regions] = await Promise.all([
    getGoodsList(),
    getStores(),
    getAnimations(),
    getRegions(),
  ]);

  return <ExploreClient goods={goods} stores={stores} animations={animations} regions={regions} />;
}
