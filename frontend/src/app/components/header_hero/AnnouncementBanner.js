"use client";

import { useState, useEffect } from "react";
import { Megaphone, Clock, X, Zap } from "lucide-react";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);

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
            (a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at)
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

  const handleDismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.has(a.id)
  );

  if (loading) return null;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const yhubCard = (
    <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 flex-shrink-0">
      <Zap className="w-3.5 h-3.5 text-gold-400" />
      <span className="text-white text-xs font-bold whitespace-nowrap">
        YHub Pulse
      </span>
      <span className="text-gold-400/80 text-[10px] whitespace-nowrap">
        Stay Connected
      </span>
    </div>
  );

  const announcementCards = visibleAnnouncements.map((a) => (
    <div
      key={a.id}
      className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-500/15 to-gold-600/5 border border-gold-500/20 rounded-full px-4 py-1.5 flex-shrink-0"
    >
      {a.is_anticipated ? (
        <Clock className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
      ) : (
        <Megaphone className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
      )}
      <span className="text-white text-xs font-semibold whitespace-nowrap">
        {a.title}
      </span>
      {a.date && (
        <span className="text-gold-300/70 text-[10px] whitespace-nowrap">
          {formatDate(a.date)}
        </span>
      )}
      {a.is_anticipated && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-bold uppercase tracking-wider whitespace-nowrap">
          Anticipate
        </span>
      )}
      <button
        onClick={() => handleDismiss(a.id)}
        className="text-blue-200/40 hover:text-white transition-colors ml-1 flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  ));

  const items = [yhubCard, ...announcementCards];

  if (items.length === 0) return null;

  return (
    <div className="w-full bg-navy-950 overflow-hidden border-y border-gold-500/10 mt-6">
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="ticker-item">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
