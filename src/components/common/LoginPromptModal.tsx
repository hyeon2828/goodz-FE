"use client";

export function LoginPromptModal({
  onLogin,
  onClose,
  message,
}: {
  onLogin: () => void;
  onClose: () => void;
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-xs shadow-2xl">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-2xl mx-auto mb-3">
            🔒
          </div>
          <h3 className="font-bold text-foreground text-sm mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            로그인이 필요해요
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {message ?? "이 기능을 사용하려면\n로그인 또는 회원가입이 필요합니다"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onLogin}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/30"
          >
            로그인 / 회원가입
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium"
          >
            계속 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
