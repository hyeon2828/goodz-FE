"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { verifyEmail } from "@/features/auth/api";
import { AuthShell } from "@/features/auth/components/AuthShell";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifyState, setVerifyState] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
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
  const handleVerify = async () => {
    const result = await verifyEmail({ email, authCode: code.join("") });
    if (result.success) {
      setVerifyState("success");
      // verify-email은 이메일 인증만 확인할 뿐 토큰을 안 돌려줌 —
      // 실제 로그인은 이 방금 만든 계정으로 별도로 해야 함.
      setTimeout(() => router.push("/login"), 800);
    } else {
      setVerifyState("error");
      setErrorMessage(result.message || "인증번호가 올바르지 않습니다");
      setCode(["", "", "", "", "", ""]);
      codeRefs[0].current?.focus();
    }
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
          {verifyState === "error" && <p className="text-xs text-red-400 font-medium">{errorMessage}</p>}
          {verifyState === "success" && <p className="text-xs text-emerald-400 font-medium">인증 성공! 로그인 페이지로 이동 중...</p>}
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
            <span className="text-muted-foreground/50 cursor-not-allowed" title="재발송 기능은 준비 중입니다">
              다시 보내기 (준비 중)
            </span>
          </p>
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
