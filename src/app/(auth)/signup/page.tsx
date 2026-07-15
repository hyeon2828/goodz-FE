"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupBusiness, signupMember } from "@/features/auth/api";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RoleSelector } from "@/features/auth/components/RoleSelector";
import { isValidEmail } from "@/lib/helpers";
import type { UserRole } from "@/types/domain";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; pw?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const errs: { name?: string; email?: string; pw?: string } = {};
    if (!name.trim()) errs.name = "이름을 입력해주세요";
    if (!isValidEmail(email)) errs.email = "올바른 이메일 형식을 입력해주세요";
    if (pw.length < 8) errs.pw = "비밀번호는 8자 이상이어야 합니다";
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const input = { name: name.trim(), email, password: pw };
    const result = role === "user" ? await signupMember(input) : await signupBusiness(input);
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.message || "회원가입에 실패했습니다");
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthShell>
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 mb-5 md:mb-6">
        <Link href="/login" className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors text-muted-foreground text-center">
          로그인
        </Link>
        <button className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors bg-white/10 text-foreground">회원가입</button>
      </div>

      <RoleSelector mode="signup" role={role} onChange={setRole} />

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">이름</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((v) => ({ ...v, name: undefined }));
              setFormError("");
            }}
            placeholder="홍길동"
            className={`w-full bg-card border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
              errors.name ? "border-red-500/60 focus:border-red-500/60" : "border-border focus:border-violet-500/50"
            }`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.name}</p>}
        </div>
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
          {submitting ? "가입 처리 중..." : "가입하기"}
        </button>
      </div>
    </AuthShell>
  );
}
