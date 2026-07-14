"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { Bookmark, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { LoginPromptModal } from "@/components/common/LoginPromptModal";
import { useAuth } from "@/features/auth/AuthProvider";
import { TypeBadge } from "@/features/goods/components/TypeBadge";
import { usePlanner } from "@/features/planner/PlannerProvider";
import { fmtPrice } from "@/lib/helpers";
import type { AnimationData, GoodsData, Plan, PlanEntry, StoreData } from "@/types/domain";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function PlannerCalendar({
  currentMonth,
  setCurrentMonth,
  calDays,
  selectedDate,
  setSelectedDate,
  setShowCal,
  setShowCreatePlan,
  plans,
  datesWithPlans,
}: {
  currentMonth: Date;
  setCurrentMonth: (updater: (m: Date) => Date) => void;
  calDays: Date[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  setShowCal: (v: boolean) => void;
  setShowCreatePlan: (v: boolean) => void;
  plans: Plan[];
  datesWithPlans: Set<string>;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
          {format(currentMonth, "yyyy년 M월")}
        </span>
        <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-muted-foreground py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {calDays.map((day) => {
          const ds = format(day, "yyyy-MM-dd");
          const hasPlan = datesWithPlans.has(ds);
          const isSel = isSameDay(day, selectedDate);
          const isThisMonth = isSameMonth(day, currentMonth);
          const isTodayDay = isToday(day);
          return (
            <button
              key={ds}
              onClick={() => {
                setSelectedDate(day);
                setShowCal(false);
                setShowCreatePlan(false);
              }}
              className={`relative flex flex-col items-center py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-colors font-medium ${
                isSel ? "bg-violet-600 text-white" : isTodayDay ? "bg-white/10 text-foreground" : isThisMonth ? "text-foreground hover:bg-white/5" : "text-muted-foreground/30"
              }`}
            >
              {day.getDate()}
              {hasPlan && !isSel && <span className="absolute bottom-0.5 w-1 h-1 bg-pink-500 rounded-full" />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
        {[["전체 플랜", `${plans.length}개`], ["방문 예정", `${datesWithPlans.size}일`]].map(([label, val]) => (
          <div key={label}>
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="font-bold text-foreground text-sm mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {val}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlannerClient({
  goods,
  stores,
  animations,
}: {
  goods: GoodsData[];
  stores: StoreData[];
  animations: AnimationData[];
}) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { plans, entries, removePlan, removeEntry, createEmptyPlan } = usePlanner();

  const goodsById = useMemo(() => new Map(goods.map((g) => [g.id, g])), [goods]);
  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);
  const animById = useMemo(() => new Map(animations.map((a) => [a.id, a])), [animations]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showCal, setShowCal] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [deletePlanUid, setDeletePlanUid] = useState<string | null>(null);

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background pt-14 md:pt-16">
        <LoginPromptModal
          onLogin={() => router.push("/login")}
          onClose={() => router.push("/goods")}
          message={"이 기능은 로그인 후 이용할 수 있습니다.\n로그인 또는 회원가입을 해주세요."}
        />
      </div>
    );
  }

  const calStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayPlans = plans.filter((p) => p.date === selectedDateStr);
  const datesWithPlans = new Set(plans.map((p) => p.date));

  const handleCreatePlan = () => {
    if (!newPlanTitle.trim()) return;
    createEmptyPlan(newPlanTitle.trim(), selectedDateStr);
    setNewPlanTitle("");
    setShowCreatePlan(false);
  };

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              나의 플래너
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">날짜별 플랜을 만들고 굿즈 방문 계획을 관리하세요</p>
          </div>
          <button onClick={() => setShowCal((c) => !c)} className="md:hidden flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-xl text-xs font-semibold text-foreground">
            <ChevronLeft size={12} className={`transition-transform ${showCal ? "rotate-90" : "-rotate-90"}`} />
            {format(currentMonth, "yyyy.M")}
          </button>
        </div>

        {showCal && (
          <div className="md:hidden mb-4">
            <PlannerCalendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              calDays={calDays}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setShowCal={setShowCal}
              setShowCreatePlan={setShowCreatePlan}
              plans={plans}
              datesWithPlans={datesWithPlans}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-5 md:gap-6 items-start">
          <div className="hidden md:block md:sticky md:top-20">
            <PlannerCalendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              calDays={calDays}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setShowCal={setShowCal}
              setShowCreatePlan={setShowCreatePlan}
              plans={plans}
              datesWithPlans={datesWithPlans}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-sm md:text-base" style={{ fontFamily: "Outfit, sans-serif" }}>
                {format(selectedDate, "M월 d일")} 플랜
              </h2>
              <button
                onClick={() => {
                  setShowCreatePlan((s) => !s);
                  setNewPlanTitle("");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-violet-900/30"
              >
                <Plus size={12} /> 새 플랜
              </button>
            </div>
            {showCreatePlan && (
              <div className="bg-card border border-violet-500/25 rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">{format(selectedDate, "M월 d일")} 새 플랜</p>
                <div className="flex gap-2">
                  <input
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
                    placeholder="플랜 이름 (예: 홍대 원정대, 강남 팝업 투어)"
                    autoFocus
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <button onClick={handleCreatePlan} className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">
                    만들기
                  </button>
                  <button onClick={() => setShowCreatePlan(false)} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground text-xs rounded-lg transition-colors">
                    취소
                  </button>
                </div>
              </div>
            )}
            {dayPlans.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 md:py-20 text-center">
                <Bookmark size={26} className="text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">이 날짜에 플랜이 없어요</p>
                <p className="text-muted-foreground text-xs mt-1">
                  위의 &quot;새 플랜&quot; 버튼으로 만들거나,
                  <br />
                  굿즈 탐색 중 &quot;담기&quot;로 추가하세요
                </p>
                <button onClick={() => router.push("/goods")} className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                  굿즈 탐색하러 가기 →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {dayPlans.map((plan) => {
                  const planEntries = entries.filter((e) => e.planUid === plan.uid);
                  const planTotal = planEntries.reduce((sum, e) => sum + (goodsById.get(e.goodsId)?.price ?? 0), 0);
                  const byStore = planEntries.reduce<Record<number, PlanEntry[]>>((acc, e) => {
                    if (!acc[e.storeId]) acc[e.storeId] = [];
                    acc[e.storeId].push(e);
                    return acc;
                  }, {});
                  return (
                    <div key={plan.uid} className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="px-4 md:px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                          <span className="font-bold text-foreground text-sm md:text-base truncate" style={{ fontFamily: "Outfit, sans-serif" }}>
                            {plan.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0">{planEntries.length}개 굿즈</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {planEntries.length > 0 && (
                            <span className="text-xs md:text-sm font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                              {fmtPrice(planTotal)}
                            </span>
                          )}
                          <button onClick={() => setDeletePlanUid(plan.uid)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {planEntries.length === 0 ? (
                        <div className="px-5 py-5 text-center">
                          <p className="text-xs text-muted-foreground">아직 담은 굿즈가 없어요</p>
                          <button onClick={() => router.push("/goods")} className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                            굿즈 탐색 →
                          </button>
                        </div>
                      ) : (
                        Object.entries(byStore).map(([storeIdStr, storeEntries]) => {
                          const s = storeById.get(Number(storeIdStr));
                          if (!s) return null;
                          const storeTotal = storeEntries.reduce((sum, e) => sum + (goodsById.get(e.goodsId)?.price ?? 0), 0);
                          return (
                            <div key={storeIdStr} className="border-t border-border">
                              <div className="px-4 md:px-5 py-2.5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                  <TypeBadge type={s.type} />
                                  <span className="text-xs font-semibold text-foreground">{s.name}</span>
                                </div>
                                <span className="text-xs font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                                  {fmtPrice(storeTotal)}
                                </span>
                              </div>
                              <div className="divide-y divide-border">
                                {storeEntries.map((e) => {
                                  const g = goodsById.get(e.goodsId);
                                  if (!g) return null;
                                  const a = animById.get(g.animationId);
                                  return (
                                    <div key={e.uid} className="px-4 md:px-5 py-3 flex items-center justify-between group">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.gradient} flex items-center justify-center text-sm shrink-0`}>{a?.emoji}</div>
                                        <div className="min-w-0">
                                          <p className="text-xs md:text-sm font-semibold text-foreground truncate">{g.name}</p>
                                          <p className="text-[10px] md:text-[11px] text-muted-foreground">
                                            {a?.title} · {g.category}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-xs md:text-sm font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                                          {fmtPrice(g.price)}
                                        </span>
                                        <button
                                          onClick={() => removeEntry(e.uid)}
                                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {deletePlanUid &&
        (() => {
          const plan = plans.find((p) => p.uid === deletePlanUid);
          if (!plan) return null;
          const count = entries.filter((e) => e.planUid === deletePlanUid).length;
          return (
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                <h3 className="font-bold text-foreground text-sm text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                  플랜을 삭제할까요?
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
                  <span className="text-foreground font-medium">&quot;{plan.title}&quot;</span>과
                  <br />
                  담긴 굿즈 {count}개가 함께 삭제됩니다.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDeletePlanUid(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
                    취소
                  </button>
                  <button
                    onClick={() => {
                      removePlan(deletePlanUid);
                      setDeletePlanUid(null);
                    }}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
