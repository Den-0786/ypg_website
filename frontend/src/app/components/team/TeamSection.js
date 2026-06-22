"use client";

import Image from "next/image";
import { buildImageSrc } from "../../../utils/config";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import useAutoScroll from "../../../hooks/useAutoScroll";
import CarouselDots from "../shared/CarouselDots";

export default function TeamSection() {
  const containerRef = useRef(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useAutoScroll(containerRef, { interval: 3500, enabled: teamMembers.length > 1 });

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/team/`
        );
        const data = await response.json();

        if (data.success) {
          setTeamMembers(data.team);
        } else {
          setError("No team members available at the moment");
        }
      } catch (err) {
        setError("Unable to load team members. Please try again later.");
        console.error("Error fetching team members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTeamMembers, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTeamMembers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Listen for refresh events from dashboard
  useEffect(() => {
    const handleRefreshTeamMembers = () => {
      const fetchTeamMembers = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/team/`
          );
          const data = await response.json();

          if (data.success) {
            setTeamMembers(data.team);
          }
        } catch (err) {
          console.error("Error refreshing team members:", err);
        }
      };

      fetchTeamMembers();
    };

    window.addEventListener("refreshTeamMembers", handleRefreshTeamMembers);
    return () =>
      window.removeEventListener(
        "refreshTeamMembers",
        handleRefreshTeamMembers
      );
  }, []);


  return (
    <section id="team" className="py-16 bg-white px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-navy-950 mb-4">
            Meet Our Executives
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The dedicated executives guiding the youth ministry with vision and
            purpose
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && teamMembers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gold-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gold-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy-950 mb-4">
                Meet Our Leadership
              </h3>
              <p className="text-gray-600 mb-6">
                Our dedicated team of executives and leaders are committed to
                guiding the youth ministry with vision, passion, and purpose.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-navy-950">
                  <strong>
                    No district executives available at the moment.
                  </strong>
                  Our executive team profiles will be added soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && teamMembers.length > 0 && (
          <div
            ref={containerRef}
            className="flex overflow-x-auto overscroll-x-contain gap-4 sm:gap-6 pb-4 pe-0 md:pe-8 scroll-smooth md:snap-x md:snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {teamMembers.map((member, index) => {
              const direction = index % 2 === 0 ? "left" : "right";

              return (
                <motion.div
                  key={member.id}
                  initial={{
                    x: direction === "left" ? -100 : 100,
                    opacity: 0,
                  }}
                  whileInView={{
                    x: 0,
                    opacity: 1,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    delay: (index % 4) * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex-shrink-0 w-full md:snap-start sm:w-[calc(50%_-_0.75rem)] md:w-[calc(33.333%_-_1rem)] lg:w-[calc(25%_-_1.125rem)] xl:w-[calc(25%_-_1.125rem)]"
                >
                  <div className="relative w-full h-80 sm:h-96 md:h-[28rem]">
                    <Image
                      src={
                        member.image
                          ? buildImageSrc(member.image)
                          : "/placeholder-item.jpg"
                      }
                      alt={member.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                      priority={index === 0}
                    />
                    {/* Color overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-blue-800/40 to-gold-600/20" />

                    {/* Text overlay with background */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 top-[10rem] sm:top-[12rem]">
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
                        <h3 className="text-sm sm:text-lg font-bold text-navy-950 mb-1">
                          {member.name}
                        </h3>
                        <p className="text-gold-500 font-medium mb-1 sm:mb-2 text-xs sm:text-sm">
                          {member.position}
                        </p>
                        {member.congregation && (
                          <p className="text-gold-500 font-light text-xs mb-2">
                            {member.congregation}
                          </p>
                        )}
                        {member.quote && (
                          <p className="text-gray-700 mb-2 italic text-xs sm:text-sm">
                            &quot;{member.quote}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        <CarouselDots containerRef={containerRef} itemCount={teamMembers.length} />
      </div>
    </section>
  );
}
