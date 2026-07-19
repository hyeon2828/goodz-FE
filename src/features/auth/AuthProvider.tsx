"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SESSION_EXPIRED_EVENT } from "@/lib/authenticatedApi";
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
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const hint = readSessionHint();
    if (!hint) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(true);
    setUserRole(hint.role);
    setUserEmail(hint.email);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setLoggedIn(false);
      setUserRole(null);
      setUserEmail("");
      router.replace("/login");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [router]);

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
