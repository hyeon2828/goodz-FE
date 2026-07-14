"use client";

import type { UserRole } from "@/types/domain";

const ROLE_OPTIONS = [
  {
    role: "user" as const,
    emoji: "👤",
    label: "개인 회원",
    desc: { login: "굿즈 탐색·플래너 이용", signup: "굿즈를 탐색하고\n플래너를 관리해요" },
  },
  {
    role: "store" as const,
    emoji: "🏪",
    label: "업체 회원",
    desc: { login: "업체 관리 대시보드 이용", signup: "굿즈와 업체를\n등록·관리해요" },
  },
];

export function RoleSelector({
  mode,
  role,
  onChange,
}: {
  mode: "login" | "signup";
  role: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:gap-3 mb-5">
      {ROLE_OPTIONS.map((opt) => (
        <button
          key={opt.role}
          onClick={() => onChange(opt.role)}
          className={`p-3 md:p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
            role === opt.role ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-900/20" : "border-border bg-card"
          }`}
        >
          <span className="text-xl md:text-2xl block mb-1.5 md:mb-2">{opt.emoji}</span>
          <span className={`text-xs font-bold block mb-0.5 ${role === opt.role ? "text-violet-300" : "text-foreground"}`}>{opt.label}</span>
          <span className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line">{opt.desc[mode]}</span>
        </button>
      ))}
    </div>
  );
}
