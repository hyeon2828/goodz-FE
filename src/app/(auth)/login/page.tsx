"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthProvider";
import { loginBusiness, loginMember } from "@/features/auth/api";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RoleSelector } from "@/features/auth/components/RoleSelector";
import { isValidEmail } from "@/lib/helpers";
import type { UserRole } from "@/types/domain";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("user");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<{ email?: string; pw?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const errs: { email?: string; pw?: string } = {};
    if (!isValidEmail(email)) errs.email = "올바른 이메일 형식을 입력해주세요";
    if (pw.length < 8) errs.pw = "비밀번호는 8자 이상이어야 합니다";
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const result = role === "user" ? await loginMember({ email, password: pw }) : await loginBusiness({ email, password: pw });
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.message || "로그인에 실패했습니다");
      return;
    }
    login(role, email);
    router.push("/goods");
  };

  return (
    <AuthShell>
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 mb-5 md:mb-6">
        <button className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors bg-white/10 text-foreground">로그인</button>
        <Link href="/signup" className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors text-muted-foreground text-center">
          회원가입
        </Link>
      </div>

      <RoleSelector mode="login" role={role} onChange={setRole} />

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((v) => ({ ...v, email: undefined }));
              setFormError("");
            }}
            placeholder="hello@example.com"
            className={`w-full bg-card border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
              errors.email ? "border-red-500/60 focus:border-red-500/60" : "border-border focus:border-violet-500/50"
            }`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.email}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">비밀번호</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErrors((v) => ({ ...v, pw: undefined }));
              setFormError("");
            }}
            placeholder="••••••••"
            className={`w-full bg-card border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
              errors.pw ? "border-red-500/60 focus:border-red-500/60" : "border-border focus:border-violet-500/50"
            }`}
          />
          <p className={`text-xs mt-1.5 font-medium ${errors.pw ? "text-red-400" : pw.length > 0 && pw.length < 8 ? "text-amber-400" : "text-muted-foreground"}`}>
            {errors.pw ? errors.pw : "8자 이상 입력해주세요"}
            {!errors.pw && pw.length >= 8 && <span className="text-emerald-400"> ✓</span>}
          </p>
        </div>

        {formError && <p className="text-xs text-red-400 font-medium text-center">{formError}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 mt-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-900/40 text-sm active:scale-[0.99]"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-5">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          회원가입
        </Link>
      </p>
    </AuthShell>
  );
}
