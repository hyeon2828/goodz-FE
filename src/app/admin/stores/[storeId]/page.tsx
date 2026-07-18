"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Edit, MapPin, Plus, Shield, Sparkles, Trash2, UserPlus, Users, X as XIcon } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { TypeBadge } from "@/features/goods/components/TypeBadge";
import { StockBadge } from "@/features/goods/components/StockBadge";
import { getAnimations } from "@/features/goods/api";
import { getStoreGoods } from "@/features/store/api";
import { safeFetch } from "@/lib/apiClient";
import {
  addStoreAdmin, createStoreGoods, deleteStoreGoods, getStoreAdmins,
  removeStoreAdmin, updateStoreGoods, uploadStoreGoodsImage,
} from "@/features/store/adminApi";
import { useIsSubAdmin, useManagedStores } from "@/features/store/ManagedStoreProvider";
import { DashboardAccessDenied } from "@/features/store/components/DashboardAccessDenied";
import { GoodsFormFields, type GoodsFormState } from "@/features/store/components/GoodsFormFields";
import { gradientForId } from "@/lib/gradient";
import { fmtPrice, isValidEmail } from "@/lib/helpers";
import type { AnimationData, StoreAdmin, StoreGoodsItem } from "@/types/domain";

const EMPTY_GOODS_FORM: GoodsFormState = { name: "", animationName: "", price: "", stock: "" };

export default function AdminStoreDetailPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = Number(params.storeId);
  const router = useRouter();
  const { loggedIn, userRole, userEmail } = useAuth();
  const isSubAdmin = useIsSubAdmin();
  const { managedStores, loading: storesLoading } = useManagedStores();
  const isMainAdmin = userRole === "store";

  const store = managedStores.find((s) => s.id === storeId) ?? null;

  const [pageNotice, setPageNotice] = useState("");

  const [admins, setAdmins] = useState<StoreAdmin[]>([]);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminEmailError, setAdminEmailError] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);

  useEffect(() => {
    if (!store || !isMainAdmin) return;
    getStoreAdmins(store.id).then((result) => {
      if (result.success && result.data) {
        setAdmins(result.data.filter((a) => a.email !== userEmail));
        setAdminsError(null);
      } else {
        setAdminsError(result.message || "관리자 목록을 불러오지 못했습니다");
      }
    });
  }, [store, isMainAdmin, userEmail]);

  const [goods, setGoods] = useState<StoreGoodsItem[]>([]);
  const [goodsLoading, setGoodsLoading] = useState(false);
  const [goodsError, setGoodsError] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGoodsLoading(true);
    safeFetch(getStoreGoods(store.id), []).then(({ data, error }) => {
      setGoods(data);
      setGoodsError(error);
      setGoodsLoading(false);
    });
  }, [store]);

  const [showGoodsForm, setShowGoodsForm] = useState(false);
  const [goodsForm, setGoodsForm] = useState<GoodsFormState>(EMPTY_GOODS_FORM);
  const [goodsErrors, setGoodsErrors] = useState<Record<string, string>>({});
  const [goodsImageFile, setGoodsImageFile] = useState<File | null>(null);
  const goodsImageRef = useRef<HTMLInputElement>(null);
  const [creatingGoods, setCreatingGoods] = useState(false);
  const [creatingGoodsStep, setCreatingGoodsStep] = useState<"idle" | "saving" | "uploading">("idle");

  const [editingGoods, setEditingGoods] = useState<StoreGoodsItem | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteGoodsId, setDeleteGoodsId] = useState<number | null>(null);

  const editImagePreviewUrl = useMemo(() => (editImageFile ? URL.createObjectURL(editImageFile) : null), [editImageFile]);
  useEffect(() => {
    return () => {
      if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    };
  }, [editImagePreviewUrl]);

  const [animations, setAnimations] = useState<AnimationData[]>([]);
  useEffect(() => {
    getAnimations().then(setAnimations);
  }, []);

  if (!loggedIn) {
    return <DashboardAccessDenied onGoAuth={() => router.push("/signup")} />;
  }
  if (storesLoading && managedStores.length === 0) {
    return <div className="min-h-screen bg-background pt-14 md:pt-16" />;
  }
  const canAccessStore = (isMainAdmin || isSubAdmin) && !!store;
  if (!canAccessStore || !store) {
    return <DashboardAccessDenied onGoAuth={() => router.push("/signup")} />;
  }

  const validateGoods = (f: GoodsFormState, file: File | null) => {
    const errs: Record<string, string> = {};
    if (!f.animationName.trim()) errs.animationName = "원작 작품을 입력해주세요";
    else if (!animations.some((a) => a.title === f.animationName.trim())) errs.animationName = "목록에서 작품을 선택해주세요";
    if (!f.price || Number(f.price) <= 0) errs.price = "가격을 입력해주세요";
    if (f.stock === "" || Number(f.stock) < 0) errs.stock = "재고 수량을 입력해주세요";
    if (!file) errs.image = "굿즈 사진을 추가해주세요";
    return errs;
  };

  const handleAddAdmin = async () => {
    const email = adminEmail.trim().toLowerCase();
    if (!isValidEmail(email)) {
      setAdminEmailError("올바른 이메일 형식을 입력해주세요");
      return;
    }
    if (admins.some((a) => a.email === email)) {
      setAdminEmailError("이미 추가된 관리자입니다");
      return;
    }
    setAddingAdmin(true);
    const result = await addStoreAdmin(store.id, email);
    setAddingAdmin(false);
    if (!result.success || !result.data) {
      setAdminEmailError(result.message || "관리자 추가에 실패했습니다");
      return;
    }
    setAdmins((prev) => [...prev, result.data!]);
    setAdminEmail("");
    setAdminEmailError("");
    setShowAddAdmin(false);
  };

  const confirmRemoveAdmin = async () => {
    if (deleteAdminId === null) return;
    const result = await removeStoreAdmin(store.id, deleteAdminId);
    if (result.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== deleteAdminId));
    } else {
      setPageNotice(result.message || "관리자 삭제에 실패했습니다");
    }
    setDeleteAdminId(null);
  };

  const handleAddGoods = async () => {
    const errs = validateGoods(goodsForm, goodsImageFile);
    setGoodsErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const animation = animations.find((a) => a.title === goodsForm.animationName.trim());
    if (!animation) return;

    setCreatingGoods(true);
    setCreatingGoodsStep("saving");
    const createResult = await createStoreGoods(store.id, {
      animationId: animation.id,
      name: goodsForm.name.trim() || `${goodsForm.animationName.trim()} 상품`,
      price: Number(goodsForm.price),
      stock: Number(goodsForm.stock),
    });
    if (!createResult.success || !createResult.data) {
      setCreatingGoods(false);
      setCreatingGoodsStep("idle");
      setGoodsErrors({ submit: createResult.message || "굿즈 등록에 실패했습니다" });
      return;
    }
    const created = createResult.data;
    setGoods((prev) => [...prev, created]);

    if (goodsImageFile) {
      setCreatingGoodsStep("uploading");
      const uploadResult = await uploadStoreGoodsImage(store.id, created.storeGoodsId, goodsImageFile);
      if (!uploadResult.success) {
        setPageNotice("굿즈는 등록됐지만 이미지 업로드에 실패했습니다 — 굿즈 목록의 수정 버튼으로 다시 시도할 수 있습니다.");
      } else {
        setGoods((prev) => prev.map((g) => (g.storeGoodsId === created.storeGoodsId ? { ...g, imagePath: uploadResult.data!.imagePath } : g)));
      }
    }

    setCreatingGoods(false);
    setCreatingGoodsStep("idle");
    setGoodsForm(EMPTY_GOODS_FORM);
    setGoodsImageFile(null);
    setGoodsErrors({});
    setShowGoodsForm(false);
    if (goodsImageRef.current) goodsImageRef.current.value = "";
  };

  const openEditGoods = (g: StoreGoodsItem) => {
    setEditingGoods(g);
    setEditPrice(String(g.price));
    setEditStock(String(g.stock));
    setEditImageFile(null);
    setEditError("");
    if (editImageRef.current) editImageRef.current.value = "";
  };

  const saveEditGoods = async () => {
    if (!editingGoods) return;
    const price = Number(editPrice);
    const stock = Number(editStock);
    if (!editPrice || price <= 0) {
      setEditError("가격을 입력해주세요");
      return;
    }
    if (editStock === "" || stock < 0) {
      setEditError("재고 수량을 입력해주세요");
      return;
    }

    setSavingEdit(true);
    const result = await updateStoreGoods(store.id, editingGoods.storeGoodsId, { price, stock });
    if (!result.success || !result.data) {
      setSavingEdit(false);
      setEditError(result.message || "굿즈 수정에 실패했습니다");
      return;
    }
    let updated = result.data;
    setGoods((prev) => prev.map((g) => (g.storeGoodsId === updated.storeGoodsId ? updated : g)));

    if (editImageFile) {
      const uploadResult = await uploadStoreGoodsImage(store.id, editingGoods.storeGoodsId, editImageFile);
      if (!uploadResult.success) {
        setSavingEdit(false);
        setEditError("가격/재고는 수정됐지만 이미지 업로드에 실패했습니다 — 다시 시도해주세요.");
        return;
      }
      updated = { ...updated, imagePath: uploadResult.data!.imagePath };
      setGoods((prev) => prev.map((g) => (g.storeGoodsId === updated.storeGoodsId ? updated : g)));
    }

    setSavingEdit(false);
    setEditingGoods(null);
  };

  const confirmDeleteGoods = async () => {
    if (deleteGoodsId === null) return;
    const result = await deleteStoreGoods(store.id, deleteGoodsId);
    if (result.success) {
      setGoods((prev) => prev.filter((g) => g.storeGoodsId !== deleteGoodsId));
    } else {
      setPageNotice(result.message || "굿즈 삭제에 실패했습니다");
    }
    setDeleteGoodsId(null);
  };

  const currentGoods = goods;

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <button onClick={() => router.push("/admin/stores")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors font-medium">
          <ArrowLeft size={14} /> 업체 목록
        </button>

        {pageNotice && (
          <div className="flex items-start justify-between gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs text-amber-300 leading-relaxed">{pageNotice}</p>
            <button onClick={() => setPageNotice("")} className="text-amber-300/70 hover:text-amber-200 shrink-0">
              <XIcon size={14} />
            </button>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${store.type === "popup" ? "bg-rose-500/15" : "bg-violet-500/15"}`}>
              {store.type === "popup" ? "🎪" : "🏪"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={store.type} />
              </div>
              <h1 className="text-lg md:text-xl font-bold text-foreground mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {store.name}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={10} />
                {store.address}
              </p>
              {store.type === "popup" && store.startDate && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                  <Clock size={10} />
                  {store.startDate} ~ {store.endDate}
                </p>
              )}
              {store.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{store.description}</p>}
            </div>
          </div>
        </div>

        {isMainAdmin && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <h2 className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                  관리자
                </h2>
                <span className="text-xs text-muted-foreground">{admins.length + 1}명</span>
              </div>
              <button
                onClick={() => setShowAddAdmin((a) => !a)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-border text-xs font-semibold text-foreground rounded-lg transition-colors"
              >
                <UserPlus size={12} /> 관리자 추가
              </button>
            </div>

            {showAddAdmin && (
              <div className="bg-background border border-violet-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">하위 관리자 이메일 입력</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                        setAdminEmailError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                      placeholder="user@example.com"
                      autoFocus
                      className={`w-full bg-card border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                        adminEmailError ? "border-red-500/60" : "border-border focus:border-violet-500/50"
                      }`}
                    />
                    {adminEmailError && <p className="text-[11px] text-red-400 mt-1 font-medium">{adminEmailError}</p>}
                  </div>
                  <button
                    onClick={handleAddAdmin}
                    disabled={addingAdmin}
                    className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                  >
                    {addingAdmin ? "추가 중..." : "추가"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddAdmin(false);
                      setAdminEmail("");
                      setAdminEmailError("");
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground text-xs rounded-lg transition-colors shrink-0"
                  >
                    취소
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-2">추가된 하위 관리자는 이 업체의 굿즈 관리에 참여할 수 있습니다.</p>
              </div>
            )}

            {adminsError && <p className="text-xs text-red-400 mb-2">{adminsError}</p>}

            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2.5 bg-violet-500/8 border border-violet-500/15 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0">
                    <Shield size={13} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{userEmail || "나의 계정"}</p>
                    <p className="text-[10px] text-violet-400 font-medium">메인 관리자</p>
                  </div>
                </div>
              </div>

              {admins.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">아직 추가된 하위 관리자가 없습니다</p>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between px-3 py-2.5 bg-white/[0.03] border border-border rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-muted-foreground">{admin.email[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{admin.email}</p>
                        <p className="text-[10px] text-muted-foreground">하위 관리자</p>
                      </div>
                    </div>
                    <button onClick={() => setDeleteAdminId(admin.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                굿즈 관리
              </h2>
              <span className="text-xs text-muted-foreground">{currentGoods.length}종</span>
            </div>
            <button
              onClick={() => {
                setShowGoodsForm((f) => !f);
                setGoodsErrors({});
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-violet-900/30"
            >
              <Plus size={12} /> 굿즈 추가
            </button>
          </div>

          {showGoodsForm && (
            <div className="bg-background border border-violet-500/20 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-foreground text-xs mb-4">새 굿즈 등록</h3>
              <GoodsFormFields
                form={goodsForm}
                setForm={setGoodsForm}
                errors={goodsErrors}
                setErrors={setGoodsErrors}
                imageFile={goodsImageFile}
                setImageFile={setGoodsImageFile}
                imageRef={goodsImageRef}
                animations={animations}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddGoods}
                  disabled={creatingGoods}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {creatingGoodsStep === "saving" ? "등록 중..." : creatingGoodsStep === "uploading" ? "이미지 업로드 중..." : "등록하기"}
                </button>
                <button
                  onClick={() => {
                    setShowGoodsForm(false);
                    setGoodsErrors({});
                    setGoodsForm(EMPTY_GOODS_FORM);
                    setGoodsImageFile(null);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
              {goodsErrors.submit && <p className="text-[11px] text-red-400 mt-2 font-medium">{goodsErrors.submit}</p>}
            </div>
          )}

          {goodsError && <p className="text-xs text-red-400 mb-3">{goodsError}</p>}

          <div className="hidden md:block overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["굿즈명", "작품", "가격", "재고", ""].map((h, i) => (
                    <th key={i} className={`text-xs text-muted-foreground font-semibold px-4 py-3 ${i >= 2 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentGoods.map((g) => (
                  <tr key={g.storeGoodsId} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {g.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.imagePath} alt={g.goodsName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientForId(g.storeGoodsId)} flex items-center justify-center shrink-0`}>
                            <Sparkles size={14} className="text-white/80" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-foreground">{g.goodsName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{g.animationTitle}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {fmtPrice(g.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StockBadge stock={g.stock} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEditGoods(g)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => setDeleteGoodsId(g.storeGoodsId)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!goodsLoading && currentGoods.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      등록된 굿즈가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {currentGoods.map((g) => (
              <div key={g.storeGoodsId} className="border border-border rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {g.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imagePath} alt={g.goodsName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientForId(g.storeGoodsId)} flex items-center justify-center shrink-0`}>
                      <Sparkles size={18} className="text-white/80" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{g.goodsName}</p>
                    <p className="text-[11px] text-muted-foreground">{g.animationTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {fmtPrice(g.price)}
                      </span>
                      <StockBadge stock={g.stock} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEditGoods(g)} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteGoodsId(g.storeGoodsId)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {!goodsLoading && currentGoods.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">등록된 굿즈가 없습니다</div>}
          </div>
        </div>
      </div>

      {editingGoods && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                굿즈 수정
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {editingGoods.goodsName} · {editingGoods.animationTitle}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mb-4">굿즈명·작품은 등록 후 변경할 수 없습니다. 가격·재고·사진만 수정 가능합니다.</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="shrink-0">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">굿즈 사진</label>
                <input ref={editImageRef} type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)} className="hidden" />
                <button
                  type="button"
                  onClick={() => editImageRef.current?.click()}
                  className="relative w-28 h-28 rounded-xl border-2 border-dashed border-border hover:border-violet-500/50 bg-background transition-colors overflow-hidden group"
                >
                  {editImagePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editImagePreviewUrl} alt="미리보기" className="w-full h-full object-cover" />
                  ) : editingGoods.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editingGoods.imagePath} alt={editingGoods.goodsName} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradientForId(editingGoods.storeGoodsId)} flex items-center justify-center`}>
                      <Sparkles size={22} className="text-white/80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium">변경</span>
                  </div>
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">가격 (원)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">재고 수량</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {editError && <p className="text-xs text-red-400 mt-3 font-medium">{editError}</p>}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditingGoods(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
                취소
              </button>
              <button
                onClick={saveEditGoods}
                disabled={savingEdit}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/30"
              >
                {savingEdit ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteGoodsId !== null &&
        (() => {
          const target = currentGoods.find((g) => g.storeGoodsId === deleteGoodsId);
          if (!target) return null;
          return (
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientForId(target.storeGoodsId)} flex items-center justify-center mx-auto mb-4`}>
                  <Sparkles size={22} className="text-white/80" />
                </div>
                <h3 className="font-bold text-foreground text-sm text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                  굿즈를 삭제할까요?
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
                  <span className="text-foreground font-medium">{target.goodsName}</span>이(가)
                  <br />
                  목록에서 삭제됩니다.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteGoodsId(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
                    취소
                  </button>
                  <button onClick={confirmDeleteGoods} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-xl transition-colors">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {deleteAdminId !== null &&
        (() => {
          const target = admins.find((a) => a.id === deleteAdminId);
          if (!target) return null;
          return (
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                <h3 className="font-bold text-foreground text-sm text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                  관리자를 삭제할까요?
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
                  <span className="text-foreground font-medium">{target.email}</span>은(는)
                  <br />
                  더이상 이 업체의 굿즈를 관리할 수 없게 됩니다.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteAdminId(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
                    취소
                  </button>
                  <button onClick={confirmRemoveAdmin} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-xl transition-colors">
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
