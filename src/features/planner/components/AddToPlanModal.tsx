"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { gradientForId } from "@/lib/gradient";
import { usePlanner } from "../PlannerProvider";
import type { PendingPlanItem } from "@/types/domain";

export function AddToPlanModal({ item, onClose, onSuccess }: { item: PendingPlanItem; onClose: () => void; onSuccess?: (date: string) => void }) {
  const { plans, createPlanWithEntry, addEntryToPlan } = usePlanner();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [title, setTitle] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const plansForDate = plans.filter((p) => p.date === date);

  const handleDateChange = (d: string) => {
    setDate(d);
    setError("");
    const existing = plans.filter((p) => p.date === d);
    if (existing.length > 0) {
      setMode("existing");
      setSelectedPlanId(existing[0].id);
    } else {
      setMode("new");
      setSelectedPlanId(null);
    }
  };

  const handleConfirm = async () => {
    if (submittingRef.current) return;

    setError("");
    if (mode === "new" && !title.trim()) return;
    if (mode === "existing" && !selectedPlanId) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const result = mode === "new"
        ? await createPlanWithEntry(title.trim(), date, item)
        : await addEntryToPlan(selectedPlanId!, date, item);

      if (!result.success) {
        submittingRef.current = false;
        setError(result.message);
        return;
      }

      onClose();
      onSuccess?.(date);
    } catch {
      submittingRef.current = false;
      setError("플랜 담기에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientForId(item.storeGoodsId)} flex items-center justify-center shrink-0`}>
            <Sparkles size={20} className="text-white/80" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
              플래너에 담기
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {item.goodsName} · {item.storeName}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">방문 예정일</label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        {plansForDate.length > 0 && (
          <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1 mb-4">
            <button
              onClick={() => setMode("new")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mode === "new" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
            >
              새 플랜
            </button>
            <button
              onClick={() => {
                setMode("existing");
                setSelectedPlanId(plansForDate[0].id);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mode === "existing" ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
            >
              기존 플랜에 추가
            </button>
          </div>
        )}
        {mode === "new" ? (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">플랜 이름</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="예) 홍대 원정대, 강남 팝업 투어"
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        ) : (
          <div className="mb-4 space-y-2">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">플랜 선택</label>
            {plansForDate.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                  selectedPlanId === p.id ? "border-violet-500/50 bg-violet-500/10" : "border-border bg-background hover:border-white/15"
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${selectedPlanId === p.id ? "bg-violet-400" : "bg-muted-foreground/30"}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${selectedPlanId === p.id ? "text-violet-300" : "text-foreground"}`}>{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.goodsCount}개 담김</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-400 mb-3 leading-relaxed">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground text-sm rounded-xl transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || (mode === "new" ? !title.trim() : !selectedPlanId)}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/30"
          >
            {submitting ? "담는 중..." : "담기"}
          </button>
        </div>
      </div>
    </div>
  );
}
