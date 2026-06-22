"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com";
        await fetch(`${apiUrl}/api/analytics/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "unique_visitor",
          }),
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
