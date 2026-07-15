"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationData } from "@/types/domain";

export function AnimCombobox({
  value,
  onChange,
  animations,
}: {
  value: string;
  onChange: (v: string) => void;
  animations: AnimationData[];
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

  const filtered = animations.filter((a) => a.title.toLowerCase().includes(inputVal.toLowerCase()) || inputVal === "");
  const handleInput = (v: string) => {
    setInputVal(v);
    onChange(v);
    setOpen(true);
  };
  const select = (title: string) => {
    setInputVal(title);
    onChange(title);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={inputVal}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="작품명 검색 또는 직접 입력"
        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
      />
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((a) => (
              <button
                key={a.id}
                onMouseDown={() => select(a.title)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-sm text-foreground font-medium">{a.title}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2.5 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">직접 입력:</span>
              <span className="text-xs text-foreground font-medium">&quot;{inputVal}&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
