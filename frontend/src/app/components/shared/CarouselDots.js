"use client";

import { useState, useEffect } from "react";

export default function CarouselDots({ containerRef, itemCount, className = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || itemCount <= 1) return;

    const updateIndex = () => {
      const firstCard = container.firstElementChild;
      if (!firstCard) return;
      const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
      const cardWidth = firstCard.getBoundingClientRect().width + gap;
      if (cardWidth <= 0) return;
      const index = Math.round(container.scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(itemCount - 1, index)));
    };

    container.addEventListener("scroll", updateIndex, { passive: true });
    window.addEventListener("resize", updateIndex);
    updateIndex();

    return () => {
      container.removeEventListener("scroll", updateIndex);
      window.removeEventListener("resize", updateIndex);
    };
  }, [containerRef, itemCount]);

  if (itemCount <= 1) return null;

  return (
    <div className={`flex justify-center mt-4 gap-2 ${className}`}>
      {Array.from({ length: itemCount }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => {
            const container = containerRef.current;
            if (!container) return;
            const firstCard = container.firstElementChild;
            if (!firstCard) return;
            const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
            const cardWidth = firstCard.getBoundingClientRect().width + gap;
            container.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
          }}
          aria-label={`Go to slide ${idx + 1}`}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            activeIndex === idx
              ? "bg-gold-500 w-6"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        />
      ))}
    </div>
  );
}
