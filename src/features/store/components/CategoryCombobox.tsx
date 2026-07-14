"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

const CATEGORIES = ["아크릴", "키링", "포스터", "피규어", "머그컵", "에코백", "인형", "엽서"];

export function CategoryCombobox({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  // `value`가 외부에서 변경(예: 폼 리셋)될 때 effect 없이 input 동기화 —
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (value !== prevValue) {
    setPrevValue(value);
    setInputVal(value);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = CATEGORIES.filter((c) => c.includes(inputVal) || inputVal === "");
  const isCustom = inputVal.trim() && !CATEGORIES.includes(inputVal.trim());
  const handleInput = (v: string) => {
    setInputVal(v);
    onChange(v);
    setOpen(true);
  };
  const select = (v: string) => {
    setInputVal(v);
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={inputVal}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="카테고리 선택 또는 직접 입력"
        className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
          hasError ? "border-red-500/60 focus:border-red-500/60" : "border-border focus:border-violet-500/50"
        }`}
      />
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {filtered.map((c) => (
            <button
              key={c}
              onMouseDown={() => select(c)}
              className="w-full flex items-center px-3 py-2.5 text-left hover:bg-white/5 transition-colors text-sm text-foreground font-medium"
            >
              {c}
            </button>
          ))}
          {isCustom && (
            <button
              onMouseDown={() => select(inputVal.trim())}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-colors border-t border-border"
            >
              <Plus size={12} className="text-violet-400 shrink-0" />
              <span className="text-xs text-muted-foreground">직접 입력: </span>
              <span className="text-xs text-foreground font-medium">&quot;{inputVal.trim()}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
