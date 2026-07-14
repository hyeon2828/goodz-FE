"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { PlannerProvider } from "@/features/planner/PlannerProvider";
import { ManagedStoreProvider } from "@/features/store/ManagedStoreProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ManagedStoreProvider>
        <PlannerProvider>{children}</PlannerProvider>
      </ManagedStoreProvider>
    </AuthProvider>
  );
}
