"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { PlannerProvider } from "@/features/planner/PlannerProvider";
import { ManagedStoreProvider } from "@/features/store/ManagedStoreProvider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ManagedStoreProvider>
        <PlannerProvider>
          {children}
          <Toaster position="bottom-right" closeButton />
        </PlannerProvider>
      </ManagedStoreProvider>
    </AuthProvider>
  );
}
