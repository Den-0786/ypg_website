"use client";

import { useState, useEffect } from "react";

export default function CarouselDots({ containerRef, itemCount, className = "" }) {
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || itemCount <= 1) return;

    const updatePage = () => {
      const firstCard = container.firstElementChild;
      if (!firstCard) return;
      const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
      const cardWidth = firstCard.getBoundingClientRect().width + gap;
      if (cardWidth <= 0) return;
      const itemsPerView = Math.max(1, Math.round(container.clientWidth / cardWidth));
      const pageWidth = itemsPerView * cardWidth;
      const page = Math.round(container.scrollLeft / pageWidth);
      setActivePage(Math.max(0, Math.min(Math.ceil(itemCount / itemsPerView) - 1, page)));
    };

    container.addEventListener("scroll", updatePage, { passive: true });
    window.addEventListener("resize", updatePage);
    updatePage();

    return () => {
      container.removeEventListener("scroll", updatePage);
      window.removeEventListener("resize", updatePage);
    };
  }, [containerRef, itemCount]);

  const computeItemsPerView = () => {
    const container = containerRef.current;
    if (!container) return 1;
    const firstCard = container.firstElementChild;
    if (!firstCard) return 1;
    const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width + gap;
    if (cardWidth <= 0) return 1;
    return Math.max(1, Math.round(container.clientWidth / cardWidth));
  };

  const itemsPerView = computeItemsPerView();
  const pageCount = Math.ceil(itemCount / itemsPerView);

  if (pageCount <= 1) return null;

  return (
    <div className={`flex justify-center mt-4 gap-2 ${className}`}>
      {Array.from({ length: pageCount }).map((_, pageIdx) => (
        <button
          key={pageIdx}
          onClick={() => {
            const container = containerRef.current;
            if (!container) return;
            const firstCard = container.firstElementChild;
            if (!firstCard) return;
            const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
            const cardWidth = firstCard.getBoundingClientRect().width + gap;
            const pageWidth = itemsPerView * cardWidth;
            container.scrollTo({ left: pageIdx * pageWidth, behavior: "smooth" });
          }}
          aria-label={`Go to page ${pageIdx + 1}`}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            activePage === pageIdx
              ? "bg-gold-500 w-6"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        />
      ))}
    </div>
  );
}
