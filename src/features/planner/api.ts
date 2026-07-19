import type { Plan, PlanEntry } from "@/types/domain";
import { callAuthenticatedRoute } from "@/lib/authenticatedApi";

export interface PlannerListData {
  totalPlans: number;
  visitDays: number;
  planners: Plan[];
}

export function getPlanners() {
  return callAuthenticatedRoute<PlannerListData>("/api/planners");
}

export interface PlannerDetailData {
  id: number;
  title: string;
  date: string;
  goods: PlanEntry[];
}

export function getPlannerDetail(plannerId: number) {
  return callAuthenticatedRoute<PlannerDetailData>(`/api/planners/${plannerId}`);
}

export function createPlanner(title: string, date: string) {
  return callAuthenticatedRoute<{ id: number; title: string; date: string }>("/api/planners", {
    method: "POST",
    body: JSON.stringify({ title, date }),
  });
}

export function updatePlanner(plannerId: number, title: string, date: string) {
  return callAuthenticatedRoute<{ id: number; title: string; date: string }>(`/api/planners/${plannerId}`, {
    method: "PATCH",
    body: JSON.stringify({ title, date }),
  });
}

export function deletePlanner(plannerId: number) {
  return callAuthenticatedRoute(`/api/planners/${plannerId}`, { method: "DELETE" });
}

export function addPlannerGoods(plannerId: number, date: string, storeGoodsId: number) {
  return callAuthenticatedRoute<{ plannerId: number; plannerGoodsId: number }>("/api/planner-goods", {
    method: "POST",
    body: JSON.stringify({ plannerId, date, storeGoodsId }),
  });
}

export function removePlannerGoods(plannerId: number, plannerGoodsId: number) {
  return callAuthenticatedRoute(`/api/planners/${plannerId}/goods/${plannerGoodsId}`, { method: "DELETE" });
}
