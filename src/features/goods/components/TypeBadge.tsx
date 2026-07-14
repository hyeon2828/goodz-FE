import { Clock } from "lucide-react";
import type { StoreType } from "@/types/domain";

export function TypeBadge({ type }: { type: StoreType }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        type === "popup"
          ? "bg-rose-500/15 text-rose-300 border border-rose-500/25"
          : "bg-violet-500/15 text-violet-300 border border-violet-500/25"
      }`}
    >
      <Clock size={9} />
      {type === "popup" ? "팝업" : "상설"}
    </span>
  );
}
