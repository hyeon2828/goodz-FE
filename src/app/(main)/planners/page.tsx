import { getAnimations, getGoodsList } from "@/features/goods/api";
import { getStores } from "@/features/store/api";
import { PlannerClient } from "./PlannerClient";

export default async function PlannerPage() {
  const [goods, stores, animations] = await Promise.all([getGoodsList(), getStores(), getAnimations()]);

  return <PlannerClient goods={goods} stores={stores} animations={animations} />;
}
