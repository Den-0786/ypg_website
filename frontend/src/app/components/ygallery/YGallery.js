/* eslint-disable jsx-a11y/alt-text */
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Download, MapPin, Calendar, ImageIcon } from "lucide-react";

export default function GallerySection() {
  const [contentType, setContentType] = useState("photos");
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch gallery items from API
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/gallery/`
        );
        console.log("Gallery API response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Gallery API data:", data);
          // Handle the API response format: {success: true, media: [...]}
          if (data.success && Array.isArray(data.media)) {
            console.log("Setting gallery items:", data.media);
            setGalleryItems(data.media);
          } else {
            console.error("API returned unexpected format:", data);
            setGalleryItems([]);
          }
        } else {
          console.error(
            "Failed to fetch gallery items, status:",
            response.status
          );
          setGalleryItems([]);
        }
      } catch (error) {
        console.error("Error fetching gallery items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();

    // Refresh every 5 seconds to get latest updates
    const interval = setInterval(fetchGalleryItems, 5000);

    // Also refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchGalleryItems();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Filter items based on content type
  const filteredItems = (galleryItems || []).filter((item) => {
    if (contentType === "photos") {
      return item.category === "image";
    } else {
      return item.category === "video";
    }
  });

  const handleDownload = (item) => {
    if (item.image) {
      const link = document.createElement("a");
      link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}${item.image}`;
      link.download = item.title || "gallery-item";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <section id="gallery" className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <section id="gallery" className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600">No gallery items available</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gallery</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-4">
            Explore our collection of photos and videos from various events and
            activities.
          </p>

          {/* Content Type Toggle - Made smaller */}
          <div className="inline-flex space-x-1 bg-white p-1 rounded-lg shadow-sm border">
            <button
              onClick={() => {
                setContentType("photos");
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                contentType === "photos"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => {
                setContentType("videos");
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                contentType === "videos"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Videos
            </button>
          </div>
        </motion.div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
              <Image
                src="/placeholder-item.jpg"
                alt="No items"
                width={64}
                height={64}
                className="mx-auto mb-4 opacity-60"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Media Available
              </h3>
              <p className="text-gray-600">
                {contentType === "photos"
                  ? "Photos will appear here once uploaded."
                  : "Videos will appear here once uploaded."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div
                className="flex gap-4 sm:gap-6 pb-4"
                style={{ minWidth: "max-content" }}
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={`${contentType}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex-shrink-0 w-48 sm:w-56"
                  >
                    <div className="relative w-full h-80 sm:h-96">
                      {item.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}${item.image}`}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw"
                          loading="lazy"
                        />
                      ) : item.video ? (
                        <video
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}${item.video}`}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Image
                            src="/placeholder-item.jpg"
                            alt="No media"
                            width={64}
                            height={64}
                            className="opacity-50"
                          />
                        </div>
                      )}

                      {contentType === "videos" &&
                        !item.video &&
                        (item.youtube_url || item.tiktok_url) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition">
                            <Play size={48} className="text-white" />
                          </div>
                        )}

                      {/* Download button */}
                      {item.image && (
                        <button
                          onClick={() => handleDownload(item)}
                          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                          title="Download"
                        >
                          <Download size={16} className="text-gray-700" />
                        </button>
                      )}

                      {/* Gradient overlay for better text visibility - only for images */}
                      {item.image && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      )}

                      {/* Text overlay positioned at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                          {item.title}
                        </h3>
                        {item.congregation && (
                          <div className="flex items-center text-white/80 text-xs mb-1">
                            <MapPin size={12} className="mr-1" />
                            <span className="line-clamp-1">
                              {item.congregation}
                            </span>
                          </div>
                        )}
                        {item.date && (
                          <div className="flex items-center text-white/80 text-xs">
                            <Calendar size={12} className="mr-1" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
