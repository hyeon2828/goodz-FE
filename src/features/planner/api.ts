import type { Plan, PlanEntry } from "@/types/domain";

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

export interface PlannerListData {
  totalPlans: number;
  visitDays: number;
  planners: Plan[];
}

export function getPlanners() {
  return callLocalRoute<PlannerListData>("/api/planners");
}

export interface PlannerDetailData {
  id: number;
  title: string;
  date: string;
  goods: PlanEntry[];
}

export function getPlannerDetail(plannerId: number) {
  return callLocalRoute<PlannerDetailData>(`/api/planners/${plannerId}`);
}

export function createPlanner(title: string, date: string) {
  return callLocalRoute<{ id: number; title: string; date: string }>("/api/planners", {
    method: "POST",
    body: JSON.stringify({ title, date }),
  });
}

export function updatePlanner(plannerId: number, title: string, date: string) {
  return callLocalRoute<{ id: number; title: string; date: string }>(`/api/planners/${plannerId}`, {
    method: "PATCH",
    body: JSON.stringify({ title, date }),
  });
}

export function deletePlanner(plannerId: number) {
  return callLocalRoute(`/api/planners/${plannerId}`, { method: "DELETE" });
}

export function addPlannerGoods(plannerId: number, date: string, storeGoodsId: number) {
  return callLocalRoute<{ plannerId: number; plannerGoodsId: number }>("/api/planner-goods", {
    method: "POST",
    body: JSON.stringify({ plannerId, date, storeGoodsId }),
  });
}

export function removePlannerGoods(plannerId: number, plannerGoodsId: number) {
  return callLocalRoute(`/api/planners/${plannerId}/goods/${plannerGoodsId}`, { method: "DELETE" });
}
