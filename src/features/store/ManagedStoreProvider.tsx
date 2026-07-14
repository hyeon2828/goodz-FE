"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { genUid } from "@/lib/helpers";
import { useAuth } from "@/features/auth/AuthProvider";
import type { ManagedStore, StoreType } from "@/types/domain";

interface NewStoreInput {
  name: string;
  address: string;
  type: StoreType;
  startDate?: string;
  endDate?: string;
  description: string;
}

interface ManagedStoreContextValue {
  managedStores: ManagedStore[];
  addStore: (input: NewStoreInput) => void;
  updateStore: (uid: string, updates: Partial<ManagedStore>) => void;
}

const ManagedStoreContext = createContext<ManagedStoreContextValue | null>(null);

export function ManagedStoreProvider({ children }: { children: ReactNode }) {
  const [managedStores, setManagedStores] = useState<ManagedStore[]>([]);

  // features/goods/api.ts, features/store/api.ts와 달리 이 mutation들은
  // 아직 api.ts 스타일 래퍼를 안 거침 — 영속시킬 백엔드가 없어 로컬
  // Context state에 직접 기록.
  //
  // TODO(백엔드 연동): addStore/updateStore가 관리자 대시보드의 모든
  // 쓰기 동작(업체 추가, 굿즈 수정, 서브관리자 추가/삭제 등)의 실제
  // 처리 지점. Spring Boot API 생기면 이 함수들을 POST/PUT 호출하는
  // `async` 함수로 교체 필요, 이때 모든 요청에 로그인 사용자의 JWT
  // 반드시 포함(Authorization 헤더 또는 AuthProvider가 최종 채택할
  // 방식에 맞춘 인증 쿠키) — 이 대시보드는 업체주/서브관리자 전용이라
  // 클라이언트가 뭘 보내든 서버에서 미인증 쓰기는 거부해야 함.
  const addStore = (input: NewStoreInput) => {
    setManagedStores((prev) => [
      ...prev,
      {
        uid: genUid(),
        name: input.name,
        address: input.address,
        type: input.type,
        startDate: input.type === "popup" ? input.startDate : undefined,
        endDate: input.type === "popup" ? input.endDate : undefined,
        description: input.description,
        subAdmins: [],
        goods: [],
      },
    ]);
  };

  const updateStore = (uid: string, updates: Partial<ManagedStore>) => {
    setManagedStores((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...updates } : s)));
  };

  return (
    <ManagedStoreContext.Provider value={{ managedStores, addStore, updateStore }}>
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
  const { userRole, userEmail } = useAuth();
  const { managedStores } = useManagedStores();
  return userRole === "user" && managedStores.some((s) => s.subAdmins.includes(userEmail));
}
