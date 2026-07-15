"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserRole } from "@/types/domain";
import { logout as logoutRequest } from "./api";

interface AuthContextValue {
  loggedIn: boolean;
  userRole: UserRole | null;
  userEmail: string;
  login: (role: UserRole, email: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// 실제 인증 토큰(gm_access_token/gm_refresh_token)은 httpOnly라 이 파일에서
// 절대 안 다룸 — app/api/auth/*/route.ts가 Set-Cookie로 전담. 여기서 읽는
// 건 gm_session(non-httpOnly, {role, email}만 담은 UI 힌트 쿠키)뿐.
const SESSION_HINT_COOKIE = "gm_session";

function readSessionHint(): { role: UserRole; email: string } | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_HINT_COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as { role: UserRole; email: string };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // 마운트 시 gm_session 쿠키로 재복원. SSR 중엔 document가 없어서 이
  // 시점 전까진 항상 "로그아웃" 상태로 렌더 — 새로고침 시 렌더 1회
  // 추가 소모는 불가피(로컬스토리지 쓰던 시절과 동일한 이유).
  useEffect(() => {
    const hint = readSessionHint();
    if (!hint) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(true);
    setUserRole(hint.role);
    setUserEmail(hint.email);
  }, []);

  // 네트워크 호출 없음 — 이미 features/auth/api.ts의 loginMember/
  // loginBusiness가 성공해서 Route Handler가 쿠키를 심은 뒤에 호출되는,
  // "로그인 성공을 화면에 반영"만 하는 함수.
  const login = (role: UserRole, email: string) => {
    setLoggedIn(true);
    setUserRole(role);
    setUserEmail(email);
  };

  const logout = async () => {
    await logoutRequest();
    setLoggedIn(false);
    setUserRole(null);
    setUserEmail("");
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
