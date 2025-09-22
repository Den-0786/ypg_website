"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  User,
  Plus,
  Search,
} from "lucide-react";
import AdvertisementForm from "./AdvertisementForm";

export default function AdvertisementSection() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [autoPlay, setAutoPlay] = useState({});
  const [expandedCard, setExpandedCard] = useState("");

  useEffect(() => {
    fetchAdvertisements();

    // Refresh advertisements every 30 seconds
    const interval = setInterval(fetchAdvertisements, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/advertisements/`
      );
      const data = await response.json();
      if (data.success) {
        setAdvertisements(data.advertisements);
      } else {
        setError("Failed to fetch advertisements.");
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      setError("Error fetching advertisements.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Beverages" },
    { value: "fashion", label: "Fashion & Beauty" },
    { value: "technology", label: "Technology" },
    { value: "services", label: "Services" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health & Wellness" },
    { value: "automotive", label: "Automotive" },
    { value: "real-estate", label: "Real Estate" },
    { value: "other", label: "Other" },
  ];

  const filteredAdvertisements = (advertisements || []).filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.advertiser_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || ad.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Auto-play carousel effect for individual images
  useEffect(() => {
    const autoPlayIntervals = {};

    filteredAdvertisements.forEach((ad) => {
      if (ad.images && ad.images.length > 1) {
        autoPlayIntervals[ad.id] = setInterval(() => {
          // Only auto-play if not hovering
          if (autoPlay[ad.id] !== false) {
            setCurrentImageIndex((prev) => ({
              ...prev,
              [ad.id]: ((prev[ad.id] || 0) + 1) % ad.images.length,
            }));
          }
        }, 3000); // Change image every 3 seconds
      }
    });

    return () => {
      Object.values(autoPlayIntervals).forEach(clearInterval);
    };
  }, [filteredAdvertisements, autoPlay]);

  const nextImage = (adId, totalImages) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [adId]: ((prev[adId] || 0) + 1) % totalImages,
    }));
  };

  const prevImage = (adId, totalImages) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [adId]: ((prev[adId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const toggleExpanded = (cardId) => {
    setExpandedCard((prev) => (prev === cardId ? "" : cardId));
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading advertisements...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-green-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Member Advertisements
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Support our YPG members by checking out their products and services.
            Members get special rates for advertising!
          </p>
        </motion.div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search advertisements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-w-[140px]"
              >
                <Plus className="w-5 h-5" />
                Add Ad
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && filteredAdvertisements.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm || categoryFilter !== "all"
                  ? "No Advertisements Found"
                  : "No Advertisements Yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Be the first to advertise your product or service!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 md:gap-6 min-w-max items-start">
              {filteredAdvertisements.map((ad, index) => {
                const currentIndex = currentImageIndex[ad.id] || 0;
                const hasImages = ad.images && ad.images.length > 0;
                const isExpanded = expandedCard === ad.id;

                return (
                  <motion.div
                    key={`ad-${ad.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-[260px] flex-shrink-0 self-start"
                  >
                    {/* Image Carousel */}
                    <div
                      className="relative h-64 bg-gray-100"
                      onMouseEnter={() =>
                        setAutoPlay((prev) => ({ ...prev, [ad.id]: false }))
                      }
                      onMouseLeave={() =>
                        setAutoPlay((prev) => ({ ...prev, [ad.id]: true }))
                      }
                    >
                      <div className="relative w-full h-full overflow-hidden">
                        <img
                          src={
                            hasImages && ad.images[currentIndex]
                              ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}${ad.images[currentIndex].url}`
                              : "/placeholder-item.jpg"
                          }
                          alt={`${ad.title} - Image ${currentIndex + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Navigation Arrows */}
                        {ad.images.length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(ad.id, ad.images.length)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => nextImage(ad.id, ad.images.length)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Image Indicators */}
                        {ad.images.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {ad.images.map((_, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() =>
                                  setCurrentImageIndex((prev) => ({
                                    ...prev,
                                    [ad.id]: imgIndex,
                                  }))
                                }
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  imgIndex === currentIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {ad.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        {ad.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {ad.description}
                      </p>

                      {isExpanded && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {ad.advertiser_name}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{ad.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {ad.advertiser_contact}
                            </span>
                          </div>
                          {ad.advertiser_email && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <span className="text-sm">
                                {ad.advertiser_email}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-lg font-bold text-blue-600">
                          {ad.price_type === "fixed"
                            ? `GHS ${ad.price_fixed}`
                            : `GHS ${ad.price_min} - ${ad.price_max}`}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpanded(ad.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title={isExpanded ? "Show Less" : "Show More"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <AdvertisementForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={fetchAdvertisements}
        />
      </div>
    </section>
  );
}
