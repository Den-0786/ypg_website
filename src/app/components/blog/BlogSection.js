"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogSection() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [expandedPosts, setExpandedPosts] = useState({});

  // Fallback data if API fails
  const fallbackBlogPosts = [];

  // Use fallback data if API fails
  const displayPosts = blogPosts.length > 0 ? blogPosts : fallbackBlogPosts;

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("http://localhost:8002/api/blog?forWebsite=true");
        const data = await response.json();
        if (data.success) {
          setBlogPosts(data.posts);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Calculate slides based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(4); 
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(3); 
      } else {
        setSlidesPerView(2); 
      }
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  const totalSlides = Math.ceil(displayPosts.length / slidesPerView);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); 

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const getCurrentPosts = () => {
    const startIndex = currentSlide * slidesPerView;
    return displayPosts.slice(startIndex, startIndex + slidesPerView);
  };

  const togglePostExpansion = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const getTruncatedExcerpt = (excerpt, isExpanded) => {
    if (isExpanded) return excerpt;
    return excerpt.length > 100 ? excerpt.substring(0, 100) + "..." : excerpt;
  };

  return (
    <section id="blog" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-3 text-sm font-semibold text-blue-600 uppercase tracking-wider">
            Latest Updates
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            From Our <span className="text-blue-600">Blog</span>
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Carousel Container */}
        {!loading && (
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Track */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${slidesPerView}, 1fr)`,
                  }}
                >
                  {getCurrentPosts().map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-blue-600 text-white">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>{post.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                          <a
                            href="#"
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {getTruncatedExcerpt(
                            post.excerpt,
                            expandedPosts[post.id]
                          )}
                        </p>
                        <button
                          onClick={() => togglePostExpansion(post.id)}
                          className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors"
                        >
                          {expandedPosts[post.id] ? "Read Less" : "Read More"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              {Array.from({ length: totalSlides }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleDotClick(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === i
                      ? "bg-blue-600 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="text-center mt-4 text-sm text-gray-500">
              {currentSlide + 1} of {totalSlides}
            </div>
          </div>
        )}

        {/* Auto-play Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              isAutoPlaying
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isAutoPlaying ? "Pause Auto-play" : "Start Auto-play"}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="#"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-blue-600"
          >
            View All Articles
          </a>
        </motion.div>
      </div>
    </section>
  );
}
