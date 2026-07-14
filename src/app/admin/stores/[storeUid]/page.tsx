"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Edit, MapPin, Plus, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { TypeBadge } from "@/features/goods/components/TypeBadge";
import { StockBadge } from "@/features/goods/components/StockBadge";
import { getAnimations } from "@/features/goods/api";
import { useIsSubAdmin, useManagedStores } from "@/features/store/ManagedStoreProvider";
import { DashboardAccessDenied } from "@/features/store/components/DashboardAccessDenied";
import { GoodsFormFields, type GoodsFormState } from "@/features/store/components/GoodsFormFields";
import { pickGradient } from "@/features/store/mock-data";
import { fmtPrice, genUid, isValidEmail } from "@/lib/helpers";
import type { AnimationData, ManagedGoods } from "@/types/domain";

const EMPTY_GOODS_FORM: GoodsFormState = { name: "", animationName: "", category: "", price: "", stock: "", description: "" };

export default function AdminStoreDetailPage() {
  const params = useParams<{ storeUid: string }>();
  const router = useRouter();
  const { loggedIn, userRole, userEmail } = useAuth();
  const isSubAdmin = useIsSubAdmin();
  const { managedStores, updateStore } = useManagedStores();
  const isMainAdmin = userRole === "store";

  const selectedStore = managedStores.find((s) => s.uid === params.storeUid) ?? null;

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminEmailError, setAdminEmailError] = useState("");
  const [deleteAdminEmail, setDeleteAdminEmail] = useState<string | null>(null);

  const [showGoodsForm, setShowGoodsForm] = useState(false);
  const [goodsForm, setGoodsForm] = useState<GoodsFormState>(EMPTY_GOODS_FORM);
  const [goodsErrors, setGoodsErrors] = useState<Record<string, string>>({});
  const [goodsImage, setGoodsImage] = useState<string | null>(null);
  const goodsImageRef = useRef<HTMLInputElement>(null);

  const [editingGoods, setEditingGoods] = useState<ManagedGoods | null>(null);
  const [editForm, setEditForm] = useState<GoodsFormState>(EMPTY_GOODS_FORM);
  const [editImage, setEditImage] = useState<string | null>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const [deleteGoodsUid, setDeleteGoodsUid] = useState<string | null>(null);

  // getAnimations()는 공개 굿즈 카탈로그 조회 (/goods가 익명 방문자에게
  // 보여주는 것과 동일 데이터)라 실제 연동 시에도 JWT 불필요할 가능성
  // 높음. 단 이 페이지의 모든 fetch가 인증 불필요하다고 오해 금지 —
  // 아래 updateStore()/addStore()(ManagedStoreProvider)가 이 관리자
  // 전용 페이지의 실제 쓰기 동작이고, 실제 백엔드 연동 시 JWT 필수.
  // features/store/ManagedStoreProvider.tsx의 TODO 참고.
  const [animations, setAnimations] = useState<AnimationData[]>([]);
  useEffect(() => {
    getAnimations().then(setAnimations);
  }, []);
  const animByTitle = useMemo(() => new Map(animations.map((a) => [a.title, a])), [animations]);
  const getAnimEmoji = (animationName: string) => animByTitle.get(animationName)?.emoji ?? "📦";

  const canAccessDashboard = loggedIn && (isMainAdmin || isSubAdmin);
  const canAccessStore = canAccessDashboard && !!selectedStore && (isMainAdmin || selectedStore.subAdmins.includes(userEmail));

  if (!canAccessStore) {
    return <DashboardAccessDenied onGoAuth={() => router.push("/signup")} />;
  }

  const store = selectedStore;

  const validateGoods = (f: GoodsFormState, img: string | null) => {
    const errs: Record<string, string> = {};
    if (!f.animationName.trim()) errs.animationName = "원작 작품을 입력해주세요";
    if (!f.category.trim()) errs.category = "카테고리를 선택하거나 입력해주세요";
    if (!f.price || Number(f.price) <= 0) errs.price = "가격을 입력해주세요";
    if (f.stock === "" || Number(f.stock) < 0) errs.stock = "재고 수량을 입력해주세요";
    if (!img) errs.image = "굿즈 사진을 추가해주세요";
    return errs;
  };

  const handleAddAdmin = () => {
    const email = adminEmail.trim().toLowerCase();
    if (!isValidEmail(email)) {
      setAdminEmailError("올바른 이메일 형식을 입력해주세요");
      return;
    }
    if (store.subAdmins.includes(email)) {
      setAdminEmailError("이미 추가된 관리자입니다");
      return;
    }
    updateStore(store.uid, { subAdmins: [...store.subAdmins, email] });
    setAdminEmail("");
    setAdminEmailError("");
    setShowAddAdmin(false);
  };

  const confirmRemoveAdmin = () => {
    if (!deleteAdminEmail) return;
    updateStore(store.uid, { subAdmins: store.subAdmins.filter((e) => e !== deleteAdminEmail) });
    setDeleteAdminEmail(null);
  };

  const handleAddGoods = () => {
    const errs = validateGoods(goodsForm, goodsImage);
    setGoodsErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const newGoods: ManagedGoods = {
      uid: genUid(),
      name: goodsForm.name.trim() || goodsForm.animationName + " 굿즈",
      animationName: goodsForm.animationName.trim(),
      category: goodsForm.category.trim(),
      price: Number(goodsForm.price),
      stock: Number(goodsForm.stock),
      description: goodsForm.description.trim(),
      gradient: pickGradient(store.goods),
      imagePreview: goodsImage ?? undefined,
    };
    updateStore(store.uid, { goods: [...store.goods, newGoods] });
    setGoodsForm(EMPTY_GOODS_FORM);
    setGoodsImage(null);
    setGoodsErrors({});
    setShowGoodsForm(false);
    if (goodsImageRef.current) goodsImageRef.current.value = "";
  };

  const openEditGoods = (g: ManagedGoods) => {
    setEditingGoods(g);
    setEditForm({ name: g.name, animationName: g.animationName, category: g.category, price: String(g.price), stock: String(g.stock), description: g.description });
    setEditImage(g.imagePreview ?? null);
  };

  const saveEditGoods = () => {
    if (!editingGoods) return;
    const updated = store.goods.map((g) =>
      g.uid === editingGoods.uid
        ? {
            ...g,
            name: editForm.name || editForm.animationName + " 굿즈",
            animationName: editForm.animationName,
            category: editForm.category,
            price: Number(editForm.price),
            stock: Number(editForm.stock),
            description: editForm.description,
            imagePreview: editImage ?? undefined,
          }
        : g
    );
    updateStore(store.uid, { goods: updated });
    setEditingGoods(null);
  };

  const confirmDeleteGoods = () => {
    if (!deleteGoodsUid) return;
    updateStore(store.uid, { goods: store.goods.filter((g) => g.uid !== deleteGoodsUid) });
    setDeleteGoodsUid(null);
  };

  const currentGoods = store.goods;

  return (
    <div className="min-h-screen bg-background pt-14 md:pt-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <button onClick={() => router.push("/admin/stores")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors font-medium">
          <ArrowLeft size={14} /> 업체 목록
        </button>
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
                <span className="text-xs text-muted-foreground">{store.subAdmins.length + 1}명</span>
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
                  <button onClick={handleAddAdmin} className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0">
                    추가
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

              {store.subAdmins.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">아직 추가된 하위 관리자가 없습니다</p>
              ) : (
                store.subAdmins.map((email) => (
                  <div key={email} className="flex items-center justify-between px-3 py-2.5 bg-white/[0.03] border border-border rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-muted-foreground">{email[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{email}</p>
                        <p className="text-[10px] text-muted-foreground">하위 관리자</p>
                      </div>
                    </div>
                    <button onClick={() => setDeleteAdminEmail(email)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
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
              onClick={() => setShowGoodsForm((f) => !f)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-violet-900/30"
            >
              <Plus size={12} /> 굿즈 추가
            </button>
          </div>

          {showGoodsForm && (
            <div className="bg-background border border-violet-500/20 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-foreground text-xs mb-4">새 굿즈 등록</h3>
              <GoodsFormFields form={goodsForm} setForm={setGoodsForm} errors={goodsErrors} setErrors={setGoodsErrors} imagePreview={goodsImage} setImagePreview={setGoodsImage} imageRef={goodsImageRef} animations={animations} />
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddGoods} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors">
                  등록하기
                </button>
                <button
                  onClick={() => {
                    setShowGoodsForm(false);
                    setGoodsErrors({});
                    setGoodsForm(EMPTY_GOODS_FORM);
                    setGoodsImage(null);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div className="hidden md:block overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["굿즈명", "작품", "카테고리", "가격", "재고", ""].map((h, i) => (
                    <th key={i} className={`text-xs text-muted-foreground font-semibold px-4 py-3 ${i >= 3 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentGoods.map((g) => (
                  <tr key={g.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {g.imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.imagePreview} alt={g.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.gradient} flex items-center justify-center text-sm shrink-0`}>{getAnimEmoji(g.animationName)}</div>
                        )}
                        <span className="text-sm font-semibold text-foreground">{g.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{g.animationName}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] bg-white/5 border border-border px-2 py-0.5 rounded-full text-muted-foreground">{g.category}</span>
                    </td>
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
                        <button onClick={() => setDeleteGoodsUid(g.uid)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentGoods.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      등록된 굿즈가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {currentGoods.map((g) => (
              <div key={g.uid} className="border border-border rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {g.imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imagePreview} alt={g.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-xl shrink-0`}>{getAnimEmoji(g.animationName)}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {g.animationName} · {g.category}
                    </p>
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
                  <button onClick={() => setDeleteGoodsUid(g.uid)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {currentGoods.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">등록된 굿즈가 없습니다</div>}
          </div>
        </div>
      </div>

      {editingGoods && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                굿즈 수정
              </h3>
            </div>
            <GoodsFormFields form={editForm} setForm={setEditForm} errors={{}} setErrors={() => {}} imagePreview={editImage} setImagePreview={setEditImage} imageRef={editImageRef} animations={animations} />
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditingGoods(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
                취소
              </button>
              <button onClick={saveEditGoods} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-900/30">
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteGoodsUid &&
        (() => {
          const target = currentGoods.find((g) => g.uid === deleteGoodsUid);
          if (!target) return null;
          return (
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${target.gradient} flex items-center justify-center text-2xl mx-auto mb-4`}>{getAnimEmoji(target.animationName)}</div>
                <h3 className="font-bold text-foreground text-sm text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                  굿즈를 삭제할까요?
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
                  <span className="text-foreground font-medium">{target.name}</span>이(가)
                  <br />
                  목록에서 삭제됩니다.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteGoodsUid(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
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

      {deleteAdminEmail && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <h3 className="font-bold text-foreground text-sm text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              관리자를 삭제할까요?
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
              <span className="text-foreground font-medium">{deleteAdminEmail}</span>은(는)
              <br />
              더이상 이 업체의 굿즈를 관리할 수 없게 됩니다.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteAdminEmail(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-xl transition-colors font-medium">
                취소
              </button>
              <button onClick={confirmRemoveAdmin} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-xl transition-colors">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
