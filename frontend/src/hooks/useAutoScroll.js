"use client";

import { useEffect } from "react";

export default function useAutoScroll(containerRef, { interval = 3500, enabled = true } = {}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    let isPaused = false;

    const pause = () => {
      isPaused = true;
    };

    const resume = () => {
      isPaused = false;
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);
    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);

    const getCardWidth = () => {
      const firstCard = container.firstElementChild;
      if (!firstCard) return 0;
      const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const getItemsPerView = () => {
      const cardWidth = getCardWidth();
      if (cardWidth <= 0) return 1;
      return Math.max(1, Math.round(container.clientWidth / cardWidth));
    };

    const scrollToPage = (pageIdx) => {
      const itemsPerView = getItemsPerView();
      const cardWidth = getCardWidth();
      if (cardWidth <= 0) return;
      const pageWidth = itemsPerView * cardWidth;
      container.scrollTo({ left: pageIdx * pageWidth, behavior: "smooth" });
    };

    const timer = setInterval(() => {
      if (isPaused) return;
      const itemCount = container.children.length;
      if (itemCount <= 1) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const itemsPerView = getItemsPerView();
      const cardWidth = getCardWidth();
      if (cardWidth <= 0) return;

      const pageWidth = itemsPerView * cardWidth;
      const currentPage = Math.round(container.scrollLeft / pageWidth);
      const pageCount = Math.ceil(itemCount / itemsPerView);
      const nextPage = (currentPage + 1) % pageCount;
      scrollToPage(nextPage);
    }, interval);

    return () => {
      clearInterval(timer);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, [containerRef, enabled, interval]);
}
