"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { AuthShell } from "@/features/auth/components/AuthShell";
import type { UserRole } from "@/types/domain";

function VerifyEmailForm() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = (searchParams.get("role") as UserRole | null) ?? "user";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifyState, setVerifyState] = useState<"idle" | "error" | "success">("idle");
  const [resent, setResent] = useState(false);
  const codeRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleCodeChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    setVerifyState("idle");
    if (digit && i < 5) codeRefs[i + 1].current?.focus();
  };
  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs[i - 1].current?.focus();
  };
  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      codeRefs[5].current?.focus();
    }
  };
  const handleVerify = () => {
    if (code.join("") === "123456") {
      setVerifyState("success");
      setTimeout(() => {
        login(role, email);
        router.push("/");
      }, 800);
    } else {
      setVerifyState("error");
      setCode(["", "", "", "", "", ""]);
      codeRefs[0].current?.focus();
    }
  };
  const handleResend = () => {
    setResent(true);
    setCode(["", "", "", "", "", ""]);
    setVerifyState("idle");
    codeRefs[0].current?.focus();
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthShell>
      <div className="bg-card border border-border rounded-2xl p-6 md:p-7">
        <button
          onClick={() => router.push("/signup")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5 font-medium"
        >
          <ArrowLeft size={13} /> 돌아가기
        </button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-2xl mx-auto mb-3">📧</div>
          <h2 className="font-bold text-foreground text-base mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            이메일 인증
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">{email}</span>으로
            <br />
            인증번호 6자리를 발송했습니다
          </p>
        </div>
        <div className="flex gap-2 justify-center mb-2" onPaste={handleCodePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={codeRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              className={`w-10 h-12 md:w-11 md:h-13 text-center text-lg font-bold rounded-xl border bg-background transition-all focus:outline-none ${
                verifyState === "error"
                  ? "border-red-500/60 text-red-400"
                  : verifyState === "success"
                    ? "border-emerald-500/60 text-emerald-400"
                    : digit
                      ? "border-violet-500/60 text-foreground"
                      : "border-border text-foreground focus:border-violet-500/60"
              }`}
            />
          ))}
        </div>
        <div className="h-5 text-center mb-4">
          {verifyState === "error" && <p className="text-xs text-red-400 font-medium">인증번호가 올바르지 않습니다</p>}
          {verifyState === "success" && <p className="text-xs text-emerald-400 font-medium">인증 성공! 이동 중...</p>}
          {resent && <p className="text-xs text-violet-400 font-medium">인증번호를 재발송했습니다</p>}
        </div>
        <button
          onClick={handleVerify}
          disabled={code.join("").length < 6 || verifyState === "success"}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-900/40 text-sm"
        >
          인증하기
        </button>
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            인증번호를 받지 못했나요?{" "}
            <button onClick={handleResend} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              다시 보내기
            </button>
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-3 font-mono">프로토타입 인증번호: 123456</p>
        </div>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
