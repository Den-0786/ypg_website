"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://ypg-website.onrender.com";
        const response = await fetch(`${baseUrl}/api/announcements/`);
        const data = await response.json();
        if (data.success && data.announcements) {
          const sorted = data.announcements.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          setAnnouncements(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [announcements.length]);

  const goTo = (idx) => {
    setCurrentIndex(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
  };

  const prev = () =>
    goTo((currentIndex - 1 + announcements.length) % announcements.length);
  const next = () => goTo((currentIndex + 1) % announcements.length);

  if (loading || announcements.length === 0) return null;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const current = announcements[currentIndex];

  return (
    <div className="w-full bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="relative flex items-center gap-2">
          {announcements.length > 1 && (
            <button
              onClick={prev}
              className="p-1 text-gold-400 hover:text-gold-300 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between gap-3 bg-gradient-to-r from-gold-500/15 to-gold-600/5 border border-gold-500/30 rounded-lg px-4 py-2.5"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {current.is_anticipated ? (
                    <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  ) : (
                    <Megaphone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-white text-sm font-semibold truncate block">
                      {current.title}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gold-300/80 text-xs">
                        {formatDate(current.date)}
                      </span>
                      {current.is_anticipated && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-bold uppercase tracking-wider">
                          Anticipate
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {announcements.length > 1 && (
            <button
              onClick={next}
              className="p-1 text-gold-400 hover:text-gold-300 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {announcements.length > 1 && (
          <div className="flex justify-center space-x-1.5 mt-2">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-gold-400" : "bg-gold-400/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
