"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Clock, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { TypeBadge } from "@/features/goods/components/TypeBadge";
import { useIsSubAdmin, useManagedStores } from "@/features/store/ManagedStoreProvider";
import { DashboardAccessDenied } from "@/features/store/components/DashboardAccessDenied";
import type { StoreType } from "@/types/domain";

export default function AdminStoresPage() {
  const router = useRouter();
  const { loggedIn, userRole } = useAuth();
  const isSubAdmin = useIsSubAdmin();
  const { managedStores, addStore } = useManagedStores();
  const isMainAdmin = userRole === "store";

  const [showAddStore, setShowAddStore] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", address: "", type: "permanent" as StoreType, startDate: "", endDate: "", description: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleAddStore = async () => {
    const errs: Record<string, string> = {};
    if (!addForm.name.trim()) errs.name = "업체명을 입력해주세요";
    if (!addForm.address.trim()) errs.address = "주소를 입력해주세요";
    if (addForm.type === "popup" && !addForm.startDate) errs.startDate = "시작일을 입력해주세요";
    if (addForm.type === "popup" && !addForm.endDate) errs.endDate = "종료일을 입력해주세요";
    setAddErrors(errs);
    setSubmitError("");
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    const result = await addStore({
      name: addForm.name.trim(),
      address: addForm.address.trim(),
      type: addForm.type,
      startDate: addForm.startDate,
      endDate: addForm.endDate,
      description: addForm.description.trim(),
    });
    setSubmitting(false);
    if (!result.success) {
      setSubmitError(result.message || "업체 등록에 실패했습니다");
      return;
    }
    setAddForm({ name: "", address: "", type: "permanent", startDate: "", endDate: "", description: "" });
    setAddErrors({});
    setShowAddStore(false);
  };

  const canAccessDashboard = loggedIn && (isMainAdmin || isSubAdmin);
  if (!canAccessDashboard) {
    return <DashboardAccessDenied onGoAuth={() => router.push("/signup")} />;
  }

  // GET /stores/admin이 role과 무관하게 "내가 관리하는 업체"만 이미
  // 서버에서 스코핑해서 내려주므로 클라이언트에서 추가로 거를 게 없음.
  const visibleStores = managedStores;

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              업체 관리
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
              {isMainAdmin ? "관리 중인 업체를 선택하거나 새 업체를 추가하세요" : "하위 관리자로 배정된 업체를 관리하세요"}
            </p>
          </div>
          {isMainAdmin && (
            <button
              onClick={() => setShowAddStore((s) => !s)}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-violet-900/30"
            >
              <Plus size={14} /> 업체 추가
            </button>
          )}
        </div>

        {showAddStore && (
          <div className="bg-card border border-violet-500/25 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-foreground text-sm mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
              새 업체 등록
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                    업체명 <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm((f) => ({ ...f, name: e.target.value }));
                      setAddErrors((e2) => ({ ...e2, name: "" }));
                    }}
                    placeholder="애니메이트 홍대점"
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                      addErrors.name ? "border-red-500/60" : "border-border focus:border-violet-500/50"
                    }`}
                  />
                  {addErrors.name && <p className="text-[11px] text-red-400 mt-1 font-medium">{addErrors.name}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                    주소 <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={addForm.address}
                    onChange={(e) => {
                      setAddForm((f) => ({ ...f, address: e.target.value }));
                      setAddErrors((e2) => ({ ...e2, address: "" }));
                    }}
                    placeholder="서울 마포구 와우산로 21"
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                      addErrors.address ? "border-red-500/60" : "border-border focus:border-violet-500/50"
                    }`}
                  />
                  {addErrors.address && <p className="text-[11px] text-red-400 mt-1 font-medium">{addErrors.address}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">매장 유형</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["permanent", "🏪", "상설매장", "bg-violet-500/15 border-violet-500/30 text-violet-300"],
                      ["popup", "🎪", "팝업스토어", "bg-rose-500/15 border-rose-500/30 text-rose-300"],
                    ] as const
                  ).map(([t, emoji, label, active]) => (
                    <button
                      key={t}
                      onClick={() => setAddForm((f) => ({ ...f, type: t }))}
                      className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${addForm.type === t ? active : "border-border text-muted-foreground hover:border-white/20"}`}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
              {addForm.type === "popup" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      시작일 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={addForm.startDate}
                      onChange={(e) => {
                        setAddForm((f) => ({ ...f, startDate: e.target.value }));
                        setAddErrors((e2) => ({ ...e2, startDate: "" }));
                      }}
                      className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                        addErrors.startDate ? "border-red-500/60" : "border-border focus:border-violet-500/50"
                      }`}
                    />
                    {addErrors.startDate && <p className="text-[11px] text-red-400 mt-1 font-medium">{addErrors.startDate}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      종료일 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={addForm.endDate}
                      onChange={(e) => {
                        setAddForm((f) => ({ ...f, endDate: e.target.value }));
                        setAddErrors((e2) => ({ ...e2, endDate: "" }));
                      }}
                      className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                        addErrors.endDate ? "border-red-500/60" : "border-border focus:border-violet-500/50"
                      }`}
                    />
                    {addErrors.endDate && <p className="text-[11px] text-red-400 mt-1 font-medium">{addErrors.endDate}</p>}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">업체 소개</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="업체 특징, 취급 굿즈, 분위기 등을 간략히 소개해주세요"
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddStore}
                  disabled={submitting}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {submitting ? "등록 중..." : "등록하기"}
                </button>
                <button
                  onClick={() => {
                    setShowAddStore(false);
                    setAddErrors({});
                    setSubmitError("");
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
              {submitError && <p className="text-[11px] text-red-400 mt-2 font-medium">{submitError}</p>}
            </div>
          </div>
        )}

        {visibleStores.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center py-20 text-center">
            <Building2 size={32} className="text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm mb-1">{isMainAdmin ? "아직 등록된 업체가 없어요" : "배정된 업체가 없습니다"}</p>
            {isMainAdmin && <p className="text-muted-foreground text-xs">&quot;업체 추가&quot; 버튼으로 첫 업체를 등록해보세요</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleStores.map((store) => (
              <button
                key={store.id}
                onClick={() => router.push(`/admin/stores/${store.id}`)}
                className="bg-card border border-border rounded-xl p-5 text-left hover:border-violet-500/30 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/20 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-3">
                  <TypeBadge type={store.type} />
                  {typeof store.goodsCount === "number" && (
                    <span className="text-[11px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{store.goodsCount}종 굿즈</span>
                  )}
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {store.name}
                </h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-2 truncate">
                  <MapPin size={9} className="shrink-0" />
                  {store.address}
                </p>
                {store.type === "popup" && store.startDate && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2 font-mono">
                    <Clock size={9} />
                    {store.startDate} ~ {store.endDate}
                  </p>
                )}
                {store.description && <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{store.description}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
