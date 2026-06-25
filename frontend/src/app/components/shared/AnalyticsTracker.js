"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get or generate device ID
        let deviceId = localStorage.getItem("ypg_device_id");
        if (!deviceId) {
          // Fallback for non-secure contexts where crypto.randomUUID() might not work
          try {
            deviceId = crypto.randomUUID();
          } catch (e) {
            // Fallback to a simple UUID generator
            deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          }
          localStorage.setItem("ypg_device_id", deviceId);
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com";
        const url = `${apiUrl}/api/analytics/track/`;
        console.log("Tracking visit to:", url);
        console.log("Device ID:", deviceId);
        
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
          try {
            const data = JSON.parse(text);
            console.log("Analytics response:", data);
          } catch (e) {
            console.log("Could not parse response as JSON");
          }
        }
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
