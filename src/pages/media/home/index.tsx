import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export const MediaCarousel = ({ children, className }: MediaCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragStart = useRef<{ x: number; scrollLeft: number } | null>(null);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragStart.current = { x: e.pageX, scrollLeft: el.scrollLeft };
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current || !scrollRef.current) return;
    e.preventDefault();
    const delta = e.pageX - dragStart.current.x;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - delta;
  };

  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  return (
    <div className={cn("relative group/carousel", className)}>
      {/* Botão esquerdo */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 h-8 w-8 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Track */}
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={cn(
          "flex gap-4 overflow-x-auto scroll-smooth px-2 py-2",
          "scrollbar-hide",
          "snap-x snap-mandatory",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}
      >
        {children}
      </div>

      {/* Botão direito */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 h-8 w-8 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};