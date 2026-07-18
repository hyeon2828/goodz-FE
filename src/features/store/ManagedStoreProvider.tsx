"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { createStore, getManagedStores, updateStore as updateStoreRequest } from "./adminApi";
import type { StoreData, StoreType } from "@/types/domain";

interface ActionResult {
  success: boolean;
  message: string;
}

interface StoreInput {
  name: string;
  address: string;
  type: StoreType;
  startDate?: string;
  endDate?: string;
  description: string;
}

interface ManagedStoreContextValue {
  managedStores: StoreData[];
  loading: boolean;
  refreshStores: () => Promise<void>;
  addStore: (input: StoreInput) => Promise<ActionResult>;
  updateStore: (storeId: number, updates: StoreInput) => Promise<ActionResult>;
}

const ManagedStoreContext = createContext<ManagedStoreContextValue | null>(null);

export function ManagedStoreProvider({ children }: { children: ReactNode }) {
  const { loggedIn } = useAuth();
  const [managedStores, setManagedStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshStores = async () => {
    setLoading(true);
    const result = await getManagedStores();
    if (result.success && result.data) setManagedStores(result.data);
    setLoading(false);
  };

  useEffect(() => {
    if (loggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshStores();
    } else {
      setManagedStores([]);
    }
  }, [loggedIn]);

  const addStore = async (input: StoreInput): Promise<ActionResult> => {
    const result = await createStore({
      name: input.name,
      description: input.description,
      type: input.type,
      startDate: input.type === "popup" ? input.startDate : undefined,
      endDate: input.type === "popup" ? input.endDate : undefined,
      address: input.address,
    });
    if (result.success) await refreshStores();
    return { success: result.success, message: result.message };
  };

  const updateStore = async (storeId: number, updates: StoreInput): Promise<ActionResult> => {
    const result = await updateStoreRequest(storeId, {
      name: updates.name,
      description: updates.description,
      type: updates.type,
      startDate: updates.type === "popup" ? updates.startDate : undefined,
      endDate: updates.type === "popup" ? updates.endDate : undefined,
      address: updates.address,
    });
    if (result.success) await refreshStores();
    return { success: result.success, message: result.message };
  };

  return (
    <ManagedStoreContext.Provider value={{ managedStores, loading, refreshStores, addStore, updateStore }}>
      {children}
    </ManagedStoreContext.Provider>
  );
}

export function useManagedStores() {
  const ctx = useContext(ManagedStoreContext);
  if (!ctx) throw new Error("useManagedStores must be used within a ManagedStoreProvider");
  return ctx;
}

export function useIsSubAdmin() {
  const { userRole } = useAuth();
  const { managedStores } = useManagedStores();
  return userRole === "user" && managedStores.length > 0;
}
