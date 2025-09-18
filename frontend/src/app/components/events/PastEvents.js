"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PastEvents() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:8002/api/events?type=past&excludeDeleted=true"
        );
        const data = await response.json();

        if (data.success) {
          setPastEvents(data.events);
        }
      } catch (error) {
        console.error("Error fetching past events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();

    // Listen for custom event to refresh events
    const handleRefreshEvents = () => {
      fetchPastEvents();
    };

    window.addEventListener("refreshEvents", handleRefreshEvents);

    return () => {
      window.removeEventListener("refreshEvents", handleRefreshEvents);
    };
  }, []);

  const toggleExpanded = (eventId) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatEventDate = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startFormatted = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const endFormatted = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // If same month and year, show "Sep 18 - 21, 2025"
    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${startFormatted} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }

    // If different months but same year, show "Sep 18 - Oct 2, 2025"
    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${startFormatted} - ${endFormatted}`;
    }

    // If different years, show full dates
    return `${startFormatted} - ${endFormatted}`;
  };

  if (loading) {
    return (
      <section id="past-events" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading past events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (pastEvents.length === 0) {
    return (
      <section id="past-events" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Past Events
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              No past events to display at the moment.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="past-events" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Past Events</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Relive the powerful moments from our recent events — spiritual
            retreats, evangelism outreaches, and more.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 px-2">
          {pastEvents.map((event) => {
            const isExpanded = expandedEvents.has(event.id);
            const shortDescription =
              event.description.length > 40
                ? event.description.substring(0, 40) + "..."
                : event.description;

            return (
              <motion.div
                key={event.id}
                className="w-full max-w-80 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex-shrink-0"
                whileHover={{ y: -10 }}
              >
                <div className="relative h-80 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={
                      event.image
                        ? `http://localhost:8002${event.image}`
                        : "/hero.jpg"
                    }
                    alt={event.title}
                    width={400}
                    height={320}
                    className="w-full h-full object-cover object-center"
                    style={{ objectPosition: "center 25%" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {formatEventDate(event.start_date, event.end_date)}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    {event.title}
                  </h3>

                  <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{event.location}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {isExpanded ? event.description : shortDescription}
                      {event.description.length > 40 && (
                        <button
                          onClick={() => toggleExpanded(event.id)}
                          className="inline-flex items-center justify-center w-6 h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 group relative ml-2 -mt-2"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            {isExpanded ? "More" : "Less"}
                          </div>
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>{event.participants || 0} participants</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
