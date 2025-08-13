"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSet, setCurrentSet] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team");
        const data = await response.json();

        if (data.success) {
          setTeamMembers(data.team);
        } else {
          setError(data.error || "Failed to fetch team members");
        }
      } catch (err) {
        setError("Failed to fetch team members");
        console.error("Error fetching team members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create sets based on screen size
  const cardsPerSet = isMobile ? 2 : 4;
  const totalSets = Math.ceil(teamMembers.length / cardsPerSet);
  const sets = [];

  for (let i = 0; i < teamMembers.length; i += cardsPerSet) {
    sets.push(teamMembers.slice(i, i + cardsPerSet));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % totalSets);
    }, 30000);

    return () => clearInterval(interval);
  }, [totalSets]);

  return (
    <section id="team" className="py-16 bg-gray-50 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Meet Our Executives
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The dedicated executives guiding the youth ministry with vision and
            purpose
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-600"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Meet Our Leadership
              </h3>
              <p className="text-gray-600 mb-6">
                Our dedicated team of executives and leaders are committed to
                guiding the youth ministry with vision, passion, and purpose.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Coming Soon:</strong> Our executive team profiles will
                  be available here. Stay tuned!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && teamMembers.length > 0 && (
          <>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[400px]">
              <AnimatePresence mode="wait">
                {sets.map(
                  (set, setIndex) =>
                    currentSet === setIndex && (
                      <motion.div
                        key={`set-${setIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4 sm:gap-8 absolute inset-0`}
                      >
                        {set.map((member, index) => {
                          const direction = index % 2 === 0 ? "left" : "right";

                          return (
                            <motion.div
                              key={`${member.id}-${setIndex}`}
                              initial={{
                                x: direction === "left" ? -100 : 100,
                                opacity: 0,
                              }}
                              animate={{
                                x: 0,
                                opacity: 1,
                                transition: {
                                  delay: index * 0.2,
                                  type: "spring",
                                  stiffness: 100,
                                  damping: 10,
                                },
                              }}
                              exit={{
                                x: direction === "left" ? -100 : 100,
                                opacity: 0,
                                transition: { duration: 0.3 },
                              }}
                              whileHover={{ y: -10 }}
                              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                              <div className="relative h-48 sm:h-56 lg:h-80 w-full">
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                {/* Color overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-800/40 to-blue-700/20" />

                                {/* Text overlay with background */}
                                <div className="absolute bottom-0 top-[12rem] left-0 right-0 p-3 sm:p-4">
                                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
                                    <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1">
                                      {member.name}
                                    </h3>
                                    <p className="text-blue-600 font-medium mb-1 sm:mb-2 text-xs sm:text-sm">
                                      {member.position}
                                    </p>
                                    {member.department && (
                                      <p className="text-amber-600 font-light text-xs mb-2">
                                        {member.department}
                                      </p>
                                    )}
                                    {member.bio && (
                                      <p className="text-gray-700 mb-2 italic text-xs sm:text-sm">
                                        &quot;{member.bio}&quot;
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

            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSets }).map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setCurrentSet(index)}
                  className={`w-3 h-3 rounded-full ${currentSet === index ? "bg-blue-600" : "bg-gray-300"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
