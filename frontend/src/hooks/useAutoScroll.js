"use client";

import { useEffect } from "react";

export default function useAutoScroll(containerRef, { interval = 3000, enabled = true } = {}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    let isPaused = false;
    let rafId = null;

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

    const advance = () => {
      if (isPaused) return;
      const firstCard = container.firstElementChild;
      if (!firstCard) return;

      const gap = parseInt(getComputedStyle(container).gap || "0", 10) || 0;
      const cardWidth = firstCard.getBoundingClientRect().width + gap;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (maxScroll <= 0) return;

      if (container.scrollLeft + cardWidth >= maxScroll - 2) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    };

    const timer = setInterval(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(advance);
    }, interval);

    return () => {
      clearInterval(timer);
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, [containerRef, enabled, interval]);
}
