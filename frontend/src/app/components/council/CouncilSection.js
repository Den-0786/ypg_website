"use client";

import Image from "next/image";
import { buildImageSrc } from "../../../utils/config";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function CouncilSection() {
  const [councilMembers, setCouncilMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSet, setCurrentSet] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchCouncilMembers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/council/`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setCouncilMembers(data.councilMembers || []);
        } else {
          setError(data.error || "Failed to fetch council members");
        }
      } catch (err) {
        setError("Failed to fetch council members");
        console.error("Error fetching council members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCouncilMembers();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCouncilMembers, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCouncilMembers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create sets based on screen size
  const cardsPerSet = isMobile ? 1 : 4;
  const totalSets = Math.ceil(councilMembers.length / cardsPerSet);
  const sets = [];

  for (let i = 0; i < councilMembers.length; i += cardsPerSet) {
    sets.push(councilMembers.slice(i, i + cardsPerSet));
  }

  // Ensure currentSet is valid after layout/size changes
  useEffect(() => {
    if (totalSets > 0 && currentSet >= totalSets) {
      setCurrentSet(0);
    }
  }, [totalSets, currentSet]);

  const getImageUrl = (url) => {
    if (!url) return "/placeholder-item.jpg";
    return buildImageSrc(url);
  };

  useEffect(() => {
    if (totalSets > 1) {
      const interval = setInterval(() => {
        setCurrentSet((prev) => (prev + 1) % totalSets);
      }, 8000); // 8 seconds per set

      return () => clearInterval(interval);
    }
  }, [totalSets]);

  const nextSet = () => {
    setCurrentSet((prev) => (prev + 1) % totalSets);
  };

  const prevSet = () => {
    setCurrentSet((prev) => (prev - 1 + totalSets) % totalSets);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="h-56 bg-gray-300 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">
              Error loading council members: {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && councilMembers.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No council members available at the moment.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Coming Soon:</strong> The council members profiles will
                be available here. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-blue-600 mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-purple-600 mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Council Members
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our dedicated branch presidents and secretaries who lead and
            serve our congregations with wisdom and commitment.
          </p>
        </motion.div>

        {/* Navigation Controls */}
        {totalSets > 1 && (
          <div className="flex justify-center items-center mb-8 space-x-4">
            <button
              onClick={prevSet}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50"
              aria-label="Previous set"
            >
              <ChevronLeft className="w-5 h-5 text-blue-600" />
            </button>

            <div className="flex space-x-2">
              {[...Array(totalSets)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSet(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSet
                      ? "bg-blue-600 scale-110"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to set ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSet}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50"
              aria-label="Next set"
            >
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        )}

        {/* Council Members Cards */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {sets.map(
              (set, setIndex) =>
                currentSet === setIndex && (
                  <motion.div
                    key={setIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className={`grid gap-2 px-2 ${set.length === 1 ? "grid-cols-1 place-items-center" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-center"}`}
                  >
                    {set.map((member, index) => {
                      const direction = index % 2 === 0 ? "left" : "right";

                      return (
                        <motion.div
                          key={member.id}
                          initial={{
                            opacity: 0,
                            x: direction === "left" ? -30 : 30,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: "easeOut",
                          }}
                          whileHover={{
                            y: -8,
                            transition: { duration: 0.2 },
                          }}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-[260px]"
                        >
                          <div className="relative h-[22rem] sm:h-[22rem] lg:h-[24rem] w-[260px]">
                            <img
                              src={getImageUrl(member.image)}
                              alt={member.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Color overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-800/40 to-blue-700/20" />

                            {/* Text overlay with background */}
                            <div className="absolute bottom-0 top-[13rem] left-0 right-0 p-3 sm:p-4">
                              <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 sm:p-3 shadow-lg border border-white/70">
                                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 line-clamp-1">
                                  {member.name}
                                </h3>
                                <p className="text-blue-600 font-semibold mb-1 sm:mb-2 text-[11px] sm:text-sm">
                                  {member.position}
                                </p>
                                <p className="text-gray-700 font-medium text-[11px] mb-2">
                                  {member.congregation}
                                </p>
                                {member.description && (
                                  <p className="text-gray-700 mb-2 italic text-[11px] sm:text-sm line-clamp-2">
                                    &quot;{member.description}&quot;
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA removed per request */}
      </div>
    </section>
  );
}
