"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bookmark, Menu, X } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { usePlanner } from "@/features/planner/PlannerProvider";
import { useIsSubAdmin } from "@/features/store/ManagedStoreProvider";
import { LoginPromptModal } from "@/components/common/LoginPromptModal";

const NAV_ITEMS = [
  { href: "/goods", label: "탐색" },
  { href: "/planners", label: "플래너" },
  { href: "/", label: "이용 가이드" },
] as const;

const MOBILE_ITEMS = [
  { href: "/goods", label: "탐색", sub: "굿즈 & 업체 찾기" },
  { href: "/planners", label: "플래너", sub: null },
  { href: "/", label: "이용 가이드", sub: "서비스 소개 & 사용법" },
  { href: "/admin/stores", label: "업체 관리", sub: "굿즈·행사 등록" },
] as const;

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { loggedIn, logout } = useAuth();
  const { totalPlans } = usePlanner();
  const isSubAdmin = useIsSubAdmin();
  const planCount = totalPlans;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    if (mobileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  const go = (href: string) => {
    if (!loggedIn && href === "/planners") {
      setMobileOpen(false);
      setShowLoginRequired(true);
      return;
    }
    router.push(href);
    setMobileOpen(false);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const dashboardActive = pathname.startsWith("/admin/stores");

  const dashBtnDesktop = isSubAdmin
    ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-900/30 hover:opacity-90"
    : dashboardActive
      ? "bg-white/10 text-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-white/5";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-14 md:h-16 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 h-full flex items-center justify-between">
        <button onClick={() => go("/goods")} className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-900/40">
            G
          </div>
          <span className="font-bold text-base md:text-lg tracking-tight text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            Goodz
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => go(href)}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive(href) ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {label}
              {href === "/planners" && planCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {planCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => go("/admin/stores")} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${dashBtnDesktop}`}>
            업체 관리
          </button>
          {loggedIn ? (
            <button
              onClick={async () => {
                await logout();
                router.push("/goods");
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-border text-muted-foreground hover:text-foreground text-sm font-semibold rounded-lg transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-violet-900/30"
            >
              로그인
            </button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => go("/planners")} className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <Bookmark size={20} />
            {planCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {planCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen((o) => !o)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div ref={menuRef} className="md:hidden absolute top-14 inset-x-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl">
          <div className="px-4 py-3 space-y-1">
            {MOBILE_ITEMS.map(({ href, label, sub }) => (
              <button
                key={href}
                onClick={() => go(href)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${
                  (href === "/admin/stores" ? dashboardActive : isActive(href))
                    ? "bg-white/10 text-foreground"
                    : href === "/admin/stores" && isSubAdmin
                      ? "bg-gradient-to-r from-violet-600/15 to-pink-500/15 border border-violet-500/25 text-foreground"
                      : "text-foreground hover:bg-white/5"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">
                    {label}
                    {href === "/admin/stores" && isSubAdmin && (
                      <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full">관리자</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {href === "/planners" ? `방문 계획 (${planCount}개)` : sub}
                  </div>
                </div>
                {href === "/planners" && planCount > 0 && (
                  <span className="w-5 h-5 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {planCount}
                  </span>
                )}
              </button>
            ))}
            <div className="pt-2 pb-1">
              {loggedIn ? (
                <button
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                    router.push("/goods");
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-border text-muted-foreground text-sm font-bold rounded-xl transition-colors"
                >
                  로그아웃
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/login");
                  }}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  로그인 / 회원가입
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoginRequired && (
        <LoginPromptModal
          onLogin={() => {
            setShowLoginRequired(false);
            router.push("/login");
          }}
          onClose={() => setShowLoginRequired(false)}
          message={"이 기능은 로그인 후 이용할 수 있습니다.\n로그인 또는 회원가입을 해주세요."}
        />
      )}
    </nav>
  );
}
