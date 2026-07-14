"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserRole } from "@/types/domain";

interface AuthContextValue {
  loggedIn: boolean;
  userRole: UserRole | null;
  userEmail: string;
  login: (role: UserRole, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// mock 단계 세션 마커. proxy.ts가 SESSION_COOKIE로 보호 라우트 게이트 처리,
// 이 Provider는 SESSION_STORAGE_KEY로 마운트 시 재복원하여 새로고침 시
// 상태 불일치 방지. 6단계에서 Spring Boot 로그인 응답의 실제 httpOnly
// JWT 쿠키로 둘 다 교체 예정.
const SESSION_COOKIE = "gm_auth";
const SESSION_STORAGE_KEY = "gm_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // 마운트 시 localStorage에서 1회성 재복원. effect 진짜 필요한 경우 —
  // localStorage는 SSR/렌더 중 접근 불가능하여 마운트 후 패스 외엔 읽을
  // 방법 없음, 이 패스는 렌더 1회 추가 소모 불가피 (서버는 "로그아웃"
  // 상태로 렌더, 클라이언트가 직후 보정). 6단계에서 실제 `/api/me` 호출로
  // 교체 예정, 방식은 동일 (로딩/익명 먼저 렌더 후 갱신).
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return;
    try {
      const { role, email } = JSON.parse(raw) as { role: UserRole; email: string };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoggedIn(true);
      setUserRole(role);
      setUserEmail(email);
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const login = (role: UserRole, email: string) => {
    setLoggedIn(true);
    setUserRole(role);
    setUserEmail(email);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ role, email }));
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=604800`;
  };

  const logout = () => {
    setLoggedIn(false);
    setUserRole(null);
    setUserEmail("");
    localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  };

  return (
    <AuthContext.Provider value={{ loggedIn, userRole, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
