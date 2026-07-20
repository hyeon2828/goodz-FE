"use client";

import { useEffect, useMemo, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react";
import { Plus, X } from "lucide-react";
import type { AnimationData } from "@/types/domain";
import { AnimCombobox } from "./AnimCombobox";

export interface GoodsFormState {
  name: string;
  animationName: string;
  price: string;
  stock: string;
}

export function GoodsFormFields({
  form,
  setForm,
  errors,
  setErrors,
  imageFile,
  setImageFile,
  imageRef,
  animations,
  identityFields,
}: {
  form: GoodsFormState;
  setForm: Dispatch<SetStateAction<GoodsFormState>>;
  errors: Record<string, string>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  imageFile: File | null;
  setImageFile: (v: File | null) => void;
  imageRef: RefObject<HTMLInputElement | null>;
  animations: AnimationData[];
  identityFields?: ReactNode;
}) {
  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="shrink-0">
        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
          굿즈 사진 <span className="text-red-400">*</span>
        </label>
        <input ref={imageRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        <button
          type="button"
          onClick={() => {
            imageRef.current?.click();
            setErrors((e) => ({ ...e, image: "" }));
          }}
          className={`relative w-28 h-28 rounded-xl border-2 border-dashed bg-background transition-colors overflow-hidden group ${
            errors.image ? "border-red-500/60" : "border-border hover:border-violet-500/50"
          }`}
        >
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[11px] font-medium">변경</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
              <Plus size={20} />
              <span className="text-[11px] font-medium">사진 추가</span>
            </div>
          )}
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              if (imageRef.current) imageRef.current.value = "";
            }}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-red-400 transition-colors"
          >
            <X size={11} /> 사진 제거
          </button>
        )}
        {errors.image && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.image}</p>}
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {identityFields ? (
          <div className="sm:col-span-2">{identityFields}</div>
        ) : (
          <>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">굿즈명</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예) 탄지로 아크릴 스탠드 한정판"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                원작 작품 <span className="text-red-400">*</span>
              </label>
              <AnimCombobox
                value={form.animationName}
                onChange={(v) => {
                  setForm((f) => ({ ...f, animationName: v }));
                  setErrors((e) => ({ ...e, animationName: "" }));
                }}
                animations={animations}
              />
              {errors.animationName && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.animationName}</p>}
            </div>
          </>
        )}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
            가격 (원) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => {
              setForm((f) => ({ ...f, price: e.target.value }));
              setErrors((e2) => ({ ...e2, price: "" }));
            }}
            placeholder="15000"
            className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
              errors.price ? "border-red-500/60" : "border-border focus:border-violet-500/50"
            }`}
          />
          {errors.price && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.price}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
            재고 수량 <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => {
              setForm((f) => ({ ...f, stock: e.target.value }));
              setErrors((e2) => ({ ...e2, stock: "" }));
            }}
            placeholder="30"
            className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
              errors.stock ? "border-red-500/60" : "border-border focus:border-violet-500/50"
            }`}
          />
          {errors.stock && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.stock}</p>}
        </div>
      </div>
    </div>
  );
}
