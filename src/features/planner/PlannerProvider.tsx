"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { genUid } from "@/lib/helpers";
import type { Plan, PlanEntry } from "@/types/domain";

interface PlannerContextValue {
  plans: Plan[];
  entries: PlanEntry[];
  createEmptyPlan: (title: string, date: string) => void;
  createPlanWithEntry: (title: string, date: string, goodsId: number, storeId: number) => void;
  addEntryToPlan: (planUid: string, goodsId: number, storeId: number) => void;
  removePlan: (planUid: string) => void;
  removeEntry: (entryUid: string) => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [entries, setEntries] = useState<PlanEntry[]>([]);

  const createEmptyPlan = (title: string, date: string) => {
    setPlans((prev) => [...prev, { uid: genUid(), title, date }]);
  };

  const createPlanWithEntry = (title: string, date: string, goodsId: number, storeId: number) => {
    const planUid = genUid();
    setPlans((prev) => [...prev, { uid: planUid, title, date }]);
    setEntries((prev) => [...prev, { uid: genUid(), planUid, goodsId, storeId }]);
  };

  const addEntryToPlan = (planUid: string, goodsId: number, storeId: number) => {
    setEntries((prev) => [...prev, { uid: genUid(), planUid, goodsId, storeId }]);
  };

  const removePlan = (planUid: string) => {
    setPlans((prev) => prev.filter((p) => p.uid !== planUid));
    setEntries((prev) => prev.filter((e) => e.planUid !== planUid));
  };

  const removeEntry = (entryUid: string) => {
    setEntries((prev) => prev.filter((e) => e.uid !== entryUid));
  };

  return (
    <PlannerContext.Provider
      value={{ plans, entries, createEmptyPlan, createPlanWithEntry, addEntryToPlan, removePlan, removeEntry }}
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
