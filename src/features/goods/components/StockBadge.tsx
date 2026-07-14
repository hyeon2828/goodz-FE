export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 5)
    return (
      <span className="text-[11px] bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full font-medium">
        품절임박 {stock}개
      </span>
    );
  if (stock <= 15)
    return (
      <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full font-medium">
        잔여 {stock}개
      </span>
    );
  return <span className="text-[11px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{stock}개</span>;
}
