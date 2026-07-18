"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { addPlannerGoods, createPlanner, deletePlanner, getPlanners, removePlannerGoods } from "./api";
import type { PendingPlanItem, Plan } from "@/types/domain";

interface ActionResult {
  success: boolean;
  message: string;
}

interface PlannerContextValue {
  plans: Plan[];
  totalPlans: number;
  visitDays: number;
  loading: boolean;
  refreshPlans: () => Promise<void>;
  createEmptyPlan: (title: string, date: string) => Promise<ActionResult>;
  createPlanWithEntry: (title: string, date: string, item: PendingPlanItem) => Promise<ActionResult>;
  addEntryToPlan: (plannerId: number, date: string, item: PendingPlanItem) => Promise<ActionResult>;
  removePlan: (plannerId: number) => Promise<ActionResult>;
  removeEntry: (plannerId: number, plannerGoodsId: number) => Promise<ActionResult>;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const { loggedIn } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [visitDays, setVisitDays] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshPlans = async () => {
    setLoading(true);
    const result = await getPlanners();
    if (result.success && result.data) {
      setPlans(result.data.planners);
      setTotalPlans(result.data.totalPlans);
      setVisitDays(result.data.visitDays);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshPlans();
    } else {
      setPlans([]);
      setTotalPlans(0);
      setVisitDays(0);
    }
  }, [loggedIn]);

  const createEmptyPlan = async (title: string, date: string): Promise<ActionResult> => {
    const result = await createPlanner(title, date);
    if (result.success) await refreshPlans();
    return { success: result.success, message: result.message };
  };

  const createPlanWithEntry = async (title: string, date: string, item: PendingPlanItem): Promise<ActionResult> => {
    const planResult = await createPlanner(title, date);
    if (!planResult.success || !planResult.data) {
      return { success: false, message: planResult.message || "플랜 생성에 실패했습니다." };
    }
    const entryResult = await addPlannerGoods(planResult.data.id, date, item.storeGoodsId);
    await refreshPlans();
    if (!entryResult.success) {
      return { success: false, message: "플랜은 생성됐지만 굿즈 담기에 실패했습니다" };
    }
    return { success: true, message: entryResult.message };
  };

  const addEntryToPlan = async (plannerId: number, date: string, item: PendingPlanItem): Promise<ActionResult> => {
    const result = await addPlannerGoods(plannerId, date, item.storeGoodsId);
    if (result.success) await refreshPlans();
    return { success: result.success, message: result.message };
  };

  const removePlan = async (plannerId: number): Promise<ActionResult> => {
    const result = await deletePlanner(plannerId);
    if (result.success) await refreshPlans();
    return { success: result.success, message: result.message };
  };

  const removeEntry = async (plannerId: number, plannerGoodsId: number): Promise<ActionResult> => {
    const result = await removePlannerGoods(plannerId, plannerGoodsId);
    if (result.success) await refreshPlans();
    return { success: result.success, message: result.message };
  };

  return (
    <PlannerContext.Provider
      value={{ plans, totalPlans, visitDays, loading, refreshPlans, createEmptyPlan, createPlanWithEntry, addEntryToPlan, removePlan, removeEntry }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within a PlannerProvider");
  return ctx;
}
