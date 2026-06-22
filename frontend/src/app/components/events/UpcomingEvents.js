"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { buildImageSrc } from "../../../utils/config";
import useAutoScroll from "../../../hooks/useAutoScroll";

function formatEventDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (start === end) {
    return startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return `${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export default function EventSection() {
  const containerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useAutoScroll(containerRef, { interval: 3500, enabled: events.length > 1 });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/events?type=upcoming&excludeDeleted=true`
        );
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Listen for custom event to refresh events
    const handleRefreshEvents = () => {
      fetchEvents();
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

  if (loading) {
    return (
      <section id="events" className="px-4 py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section id="events" className="px-4 py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-gold-500 font-bold uppercase tracking-widest text-sm mb-3">
              What&apos;s Happening
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy-950 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600">
              No upcoming events at the moment. Check back soon for new events!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="px-4 py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-gold-500 font-bold uppercase tracking-widest text-sm mb-3">
            What&apos;s Happening
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-950 mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600">
            Join us for these exciting upcoming events in our youth ministry
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="flex overflow-x-auto overscroll-x-contain gap-4 sm:gap-6 pb-4 pe-8 scroll-smooth md:snap-x md:snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
              {events.map((event) => {
            const isExpanded = expandedEvents.has(event.id);
            const shortDescription =
              event.description.length > 40
                ? event.description.substring(0, 40) + "..."
                : event.description;

            return (
              <motion.div
                key={event.id}
                className="flex-shrink-0 w-[85%] md:snap-start sm:w-[calc(50%_-_0.75rem)] md:w-[calc(33.333%_-_1rem)] lg:w-[calc(25%_-_1.125rem)] xl:w-[calc(25%_-_1.125rem)] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col border-t-4 border-gold-500 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -3 }}
              >
                <div className="relative w-full h-80 sm:h-96 overflow-hidden rounded-t-2xl">
                  <Image
                    src={event.image ? buildImageSrc(event.image) : "/hero.jpg"}
                    alt={event.title}
                    width={400}
                    height={288}
                    className="w-full h-full object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={false}
                  />
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 border border-white/30">
                    <span className="text-xs font-medium text-white">
                      Upcoming
                    </span>
                  </div>
                </div>

                <div className="px-4 py-4 flex-1 flex flex-col">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-4 h-4 text-gold-500 mr-2"
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
                    <span className="text-xs font-medium text-gold-500">
                      {formatEventDate(event.start_date, event.end_date)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-navy-950 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="flex items-center mb-3">
                    <svg
                      className="w-4 h-4 text-gold-500 mr-2"
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
                    <span className="text-sm text-gray-600 truncate">
                      {event.location}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isExpanded ? event.description : shortDescription}
                      {event.description.length > 40 && (
                        <button
                          onClick={() => toggleExpanded(event.id)}
                          className="inline-flex items-center justify-center w-6 h-6 text-gold-500 hover:text-navy-950 hover:bg-gold-100 rounded-full transition-all duration-200 group relative ml-2 -mt-2"
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
