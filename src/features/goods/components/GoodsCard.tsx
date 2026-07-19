"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { gradientForId } from "@/lib/gradient";
import type { GoodsSummary } from "@/types/domain";

export function GoodsCard({ goods, onClick }: { goods: GoodsSummary; onClick: () => void }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const updateCurrentImage = () => setCurrentImage(carouselApi.selectedScrollSnap());
    updateCurrentImage();
    carouselApi.on("select", updateCurrentImage);
    carouselApi.on("reInit", updateCurrentImage);

    return () => {
      carouselApi.off("select", updateCurrentImage);
      carouselApi.off("reInit", updateCurrentImage);
    };
  }, [carouselApi]);

  const hasMultipleImages = goods.imageUrls.length > 1;

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-950/20 group cursor-pointer"
    >
      {goods.imageUrls.length > 0 ? (
        <Carousel setApi={setCarouselApi} opts={{ loop: hasMultipleImages }} className="relative h-36 sm:h-44">
          <CarouselContent className="h-36 sm:h-44 ml-0">
            {goods.imageUrls.map((imageUrl, index) => (
              <CarouselItem key={`${imageUrl}-${index}`} className="h-36 sm:h-44 pl-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={`${goods.name} 이미지 ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </CarouselItem>
            ))}
          </CarouselContent>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                aria-label="이전 이미지"
                onClick={(event) => {
                  event.stopPropagation();
                  carouselApi?.scrollPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1 text-white transition-opacity hover:bg-black/75 focus-visible:outline-none sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="다음 이미지"
                onClick={(event) => {
                  event.stopPropagation();
                  carouselApi?.scrollNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1 text-white transition-opacity hover:bg-black/75 focus-visible:outline-none sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white" aria-hidden="true">
                {currentImage + 1} / {goods.imageUrls.length}
              </div>
              <span className="sr-only" aria-live="polite">
                {goods.imageUrls.length}개 이미지 중 {currentImage + 1}번째
              </span>
            </>
          )}
        </Carousel>
      ) : (
        <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${gradientForId(goods.animationId)} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <Sparkles size={40} className="text-white/70 opacity-80 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
        </div>
      )}
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-0.5 font-medium">{goods.animationTitle}</p>
        <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          {goods.name}
        </h3>
        <p className="text-[11px] text-violet-400 font-semibold group-hover:text-violet-300 transition-colors">자세히 보기 →</p>
      </div>
    </div>
  );
}
