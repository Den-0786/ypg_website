"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get or generate device ID
        let deviceId = localStorage.getItem("ypg_device_id");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("ypg_device_id", deviceId);
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com";
        const url = `${apiUrl}/api/analytics/track/`;
        console.log("Tracking visit to:", url);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "unique_visitor",
            device_id: deviceId,
          }),
        });
        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Response text:", text);
        if (text) {
          const data = JSON.parse(text);
          console.log("Analytics response:", data);
        }
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
