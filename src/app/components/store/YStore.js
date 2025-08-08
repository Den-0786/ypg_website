"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ystoreAPI } from "../../../utils/api";

export default function YStoreSection() {
  const [storeItems, setStoreItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const itemsPerPage = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(storeItems.length / itemsPerPage);

  useEffect(() => {
    const fetchStoreItems = async () => {
      try {
        const response = await ystoreAPI.getItems();
        if (response.success) {
          
          const items = response.data?.items || response.items || [];
          setStoreItems(items);
        } else {
          console.error("Failed to fetch store items:", response.error);
        }
      } catch (error) {
        console.error("Error fetching store items:", error);
        
        setStoreItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreItems();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (totalSlides > 1) {
      const interval = setInterval(() => {
        if (autoPlay) {
          setCurrentIndex((prev) => (prev + 1) % totalSlides);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const visibleItems = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const itemIndex = (currentIndex * itemsPerPage + i) % storeItems.length;
    visibleItems.push(storeItems[itemIndex]);
  }

  if (loading) {
    return (
      <section
        id="ystore"
        className="py-16 bg-gradient-to-b from-white to-gray-50 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading store items...</p>
          </div>
        </div>
      </section>
    );
  }

  if (storeItems.length === 0) {
    return (
      <section
        id="ystore"
        className="py-16 bg-gradient-to-b from-white to-gray-50 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              <span className="text-blue-600">Y-Store</span> Merchandise
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              No items available at the moment. Check back soon!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="ystore"
      className="py-16 bg-gradient-to-b from-white to-gray-50 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            <span className="text-blue-600">Y-Store</span> Merchandise
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Official branded items for our youth community
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            aria-label="Previous items"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            aria-label="Next items"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>

          {/* Carousel Container */}
          <div
            className="overflow-hidden"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center gap-6 px-2"
              >
                {visibleItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="w-full max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.image || "/placeholder-item.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {item.stock === "Out of Stock" && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center text-xs font-medium">
                        <Star
                          size={12}
                          className="mr-1 text-yellow-400 fill-yellow-400"
                        />
                        {item.rating}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-blue-600 font-bold text-sm ml-2">
                          {item.price}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-gray-500 italic">
                          Contact YPG Store for more info
                        </p>

                        <div className="flex gap-2">
                          {item.stock !== "Out of Stock" ? (
                            <>
                              <a
                                href="https://wa.me/233244123456"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                              </a>
                              <a
                                href="tel:+233244123456"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 7.943 20 10.999z" />
                                  <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 00-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 00.043-1.391L6.859 3.513a1 1 0 00-1.391-.087l-2.17 1.861a1 1 0 00-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 00.648-.291l1.86-2.171a1 1 0 00-.086-1.391l-4.064-3.696z" />
                                </svg>
                                Call
                              </a>
                            </>
                          ) : (
                            <div className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                              Out of Stock
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition ${currentIndex === index ? "bg-blue-600 w-6" : "bg-gray-300"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
