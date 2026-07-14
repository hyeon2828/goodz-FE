import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16 flex items-center justify-center px-4 md:px-6 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 md:w-64 h-48 md:h-64 bg-pink-600/8 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-7 md:mb-8">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-2xl shadow-violet-900/50 mx-auto mb-3">
            G
          </div>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            Goodz
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">애니 굿즈 탐색 &amp; 방문 플래너</p>
        </div>
        {children}
      </div>
    </div>
  );
}
