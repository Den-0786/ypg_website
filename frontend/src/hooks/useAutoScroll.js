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

    const scrollToIndex = (index) => {
      const cardWidth = getCardWidth();
      if (cardWidth <= 0) return;
      container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    };

    const timer = setInterval(() => {
      if (isPaused) return;
      const itemCount = container.children.length;
      if (itemCount <= 1) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const cardWidth = getCardWidth();
      if (cardWidth <= 0) return;

      const currentIndex = Math.round(container.scrollLeft / cardWidth);
      const nextIndex = (currentIndex + 1) % itemCount;
      scrollToIndex(nextIndex);
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
