"use client";

import Image from "next/image";
import { buildImageSrc } from "../../../utils/config";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Users, Phone, Mail, MapPin } from "lucide-react";
import useAutoScroll from "../../../hooks/useAutoScroll";
import CarouselDots from "../shared/CarouselDots";

export default function CouncilSection() {
  const containerRef = useRef(null);
  const [councilMembers, setCouncilMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useAutoScroll(containerRef, { interval: 3500, enabled: councilMembers.length > 1 });

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


  const getImageUrl = (url) => {
    if (!url) return "/placeholder-item.jpg";
    return buildImageSrc(url);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-96 mx-auto animate-pulse"></div>
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
                  <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
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
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No council members available at the moment.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-navy-950">
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
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gold-500 mix-blend-multiply filter blur-xl"></div>
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
          <h2 className="text-4xl font-bold text-navy-950 mb-4">
            Council Members
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our dedicated branch presidents and secretaries who lead and
            serve our congregations with wisdom and commitment.
          </p>
        </motion.div>

        {/* Council Members Cards */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto overscroll-x-contain gap-4 sm:gap-6 pb-4 pe-0 md:pe-8 scroll-smooth md:snap-x md:snap-mandatory scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {councilMembers.map((member, index) => {
            const direction = index % 2 === 0 ? "left" : "right";

            return (
              <motion.div
                key={member.id}
                initial={{
                  opacity: 0,
                  x: direction === "left" ? -30 : 30,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex-shrink-0 w-full md:snap-start sm:w-[calc(50%_-_0.75rem)] md:w-[calc(33.333%_-_1rem)] lg:w-[calc(25%_-_1.125rem)] xl:w-[calc(25%_-_1.125rem)]"
              >
                <div className="relative h-[22rem] sm:h-[26rem] lg:h-[28rem] w-full">
                  <img
                    src={getImageUrl(member.image)}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  {/* Color overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-blue-800/40 to-gold-600/20" />

                  {/* Text overlay with background */}
                  <div className="absolute bottom-0 top-[13rem] left-0 right-0 p-3 sm:p-4">
                    <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 sm:p-3 shadow-lg border border-white/70">
                      <h3 className="text-sm sm:text-base font-bold text-navy-950 mb-1 line-clamp-1">
                        {member.name}
                      </h3>
                      <p className="text-gold-500 font-semibold mb-1 sm:mb-2 text-[11px] sm:text-sm">
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
        </div>

        <CarouselDots containerRef={containerRef} itemCount={councilMembers.length} />

        {/* Bottom CTA removed per request */}
      </div>
    </section>
  );
}
