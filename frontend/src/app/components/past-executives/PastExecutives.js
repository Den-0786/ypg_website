"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { buildImageSrc } from "../../../utils/config";
import { motion, AnimatePresence } from "framer-motion";

export default function PastExecutives() {
  const [pastExecutives, setPastExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastExecutives();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPastExecutives, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPastExecutives();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);


  const fetchPastExecutives = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/past-executives/`
      );
      const data = await response.json();
      if (data.success) {
        // Backend already returns executives in correct hierarchy order
        setPastExecutives(data.pastExecutives);
      }
    } catch (error) {
      console.error("Error fetching past executives:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-purple-600 to-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading past executives...</p>
          </div>
        </div>
      </section>
    );
  }

  if (pastExecutives.length === 0) {
    return (
      <section className="py-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-blue-100/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-2 relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Past Executives
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Honoring the legacy of our previous leaders who have served YPG
              with dedication and commitment. Their contributions continue to
              inspire our community.
            </p>
          </div>

          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <div className="text-gray-400 mb-6">
                <svg
                  className="mx-auto h-20 w-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                No Past Executives Yet
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Our past executives section will showcase the legacy of previous
                leaders who have served YPG with dedication and commitment.
              </p>
              <div className="inline-flex items-center gap-3 text-gray-500 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 rounded-full border border-purple-100">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Check back soon for updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-blue-100/20"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-2 relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Past Executives
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Honoring the legacy of our previous leaders who have served YPG with
            dedication and commitment. Their contributions continue to inspire
            our community.
          </p>
        </div>

        {pastExecutives.length > 0 && (
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 px-2 pb-4" style={{ width: 'max-content' }}>
                {pastExecutives.map((executive, index) => (
                  <motion.div
                    key={executive.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 w-64 flex-shrink-0"
                  >
                    <div className="relative h-52 bg-gradient-to-br from-purple-100 to-blue-100">
                      {executive.image ? (
                        <Image
                          src={buildImageSrc(executive.image)}
                          alt={executive.name}
                          width={256}
                          height={208}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full flex items-center justify-center">
                            <svg
                              className="h-10 w-10 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">
                        {executive.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {executive.position_display}
                      </p>
                      <div className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-200">
                        {executive.reign_period}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
