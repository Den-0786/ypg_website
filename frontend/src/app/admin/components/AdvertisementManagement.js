"use client";
import { useState, useEffect } from "react";
import { buildImageSrc } from "../../../utils/config";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Tag,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Plus,
  AlertCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";

export default function AdvertisementManagement({ theme }) {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("view");
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [autoPlay, setAutoPlay] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchAdvertisements();

    // Refresh advertisements every 10 seconds
    const interval = setInterval(fetchAdvertisements, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/advertisements/admin/`
      );
      const data = await response.json();
      if (data.success) {
        setAdvertisements(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Failed to refresh advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (adId, newStatus) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/advertisements/${adId}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAdvertisements((prev) =>
          prev.map((ad) => (ad.id === adId ? { ...ad, status: newStatus } : ad))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (adId) => {
    // Show custom confirmation toast
    const confirmed = await new Promise((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm font-medium text-navy-950">
              Are you sure you want to delete this advertisement?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          style: {
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    });
    if (confirmed) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/advertisements/${adId}/delete/`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (data.success) {
          toast.success("Advertisement deleted successfully");
          setAdvertisements((prev) => prev.filter((ad) => ad.id !== adId));
        } else {
          toast.error("Failed to delete advertisement");
        }
      } catch (error) {
        console.error("Error deleting advertisement:", error);
        toast.error("Error deleting advertisement");
      }
    }
  };

  const filteredAds = advertisements.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.advertiser_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Auto-play carousel effect
  useEffect(() => {
    const autoPlayIntervals = {};

    filteredAds.forEach((ad) => {
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
  }, [filteredAds, autoPlay]);

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

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const openModal = (ad, actionType) => {
    setSelectedAd(ad);
    setAction(actionType);
    setShowModal(true);
    setNewImages([]);
    if (actionType === "edit") {
      setEditFormData({
        title: ad.title,
        description: ad.description,
        advertiser_name: ad.advertiser_name,
        advertiser_contact: ad.advertiser_contact,
        advertiser_email: ad.advertiser_email || "",
        location: ad.location,
        category: ad.category,
        price_type: ad.price_type,
        price_fixed: ad.price_fixed || "",
        price_min: ad.price_min || "",
        price_max: ad.price_max || "",
        admin_notes: ad.admin_notes || "",
        status: ad.status,
        images: ad.images || [],
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();

      // Append text fields
      Object.keys(editFormData).forEach((key) => {
        if (key === "images") return;
        const value = editFormData[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Send the kept images so the backend knows what was removed
      formData.append(
        "existing_images",
        JSON.stringify(editFormData.images || [])
      );

      // Append newly selected images
      newImages.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/advertisements/${selectedAd.id}/update/`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        // Update the local state with the returned advertisement
        setAdvertisements((prev) =>
          prev.map((ad) =>
            ad.id === selectedAd.id ? { ...ad, ...data.advertisement } : ad
          )
        );
        setShowModal(false);
        setNewImages([]);
        toast.success("Advertisement updated successfully!");
      } else {
        toast.error("Failed to update advertisement: " + data.error);
      }
    } catch (error) {
      console.error("Error updating advertisement:", error);
      toast.error("Error updating advertisement. Please try again.");
    }
  };

  const toggleExpanded = (cardKey) => {
    setExpandedCards((prev) => {
      const currentValue = prev[cardKey] || false;
      return {
        ...prev,
        [cardKey]: !currentValue,
      };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-50 text-navy-950";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      fashion: "bg-pink-100 text-pink-800",
      technology: "bg-gold-100 text-navy-950",
      education: "bg-purple-100 text-purple-800",
      health: "bg-green-100 text-green-800",
      automotive: "bg-blue-50 text-navy-950",
      real_estate: "bg-indigo-100 text-indigo-800",
      services: "bg-teal-100 text-teal-800",
      other: "bg-blue-50 text-navy-950",
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-navy-950"}`}
          >
            Advertisement Management
          </h2>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Manage member advertisements and submissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
          <button
            onClick={fetchAdvertisements}
            disabled={loading}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                : "bg-blue-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}
            />
            <input
              type="text"
              placeholder="Search advertisements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-navy-950 placeholder-gray-500"
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-navy-950"
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 pb-4">
        {filteredAds.map((ad, index) => {
          const currentIndex = currentImageIndex[ad.id] || 0;
          const hasImages = ad.images && ad.images.length > 0;
          const cardKey = `dashboard-card-${ad.id}-${index}`;
          const isExpanded = expandedCards[cardKey] || false;

          return (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg shadow-md border overflow-hidden w-full ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Image Carousel */}
              <div
                className="relative h-48 sm:h-64 bg-blue-50"
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
                        ? buildImageSrc(ad.images[currentIndex].url)
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

              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3
                      className={`text-base font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-navy-950"}`}
                    >
                      {ad.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          ad.category
                        )}`}
                      >
                        {ad.category.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ad.status
                        )}`}
                      >
                        {ad.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <p
                      className={`text-sm mb-4 line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {ad.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div
                        className={`flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        {ad.advertiser_name}
                      </div>
                      <div
                        className={`flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {ad.advertiser_contact}
                      </div>
                      {ad.advertiser_email && (
                        <div
                          className={`flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {ad.advertiser_email}
                        </div>
                      )}
                      <div
                        className={`flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Expires: {new Date(ad.expires_at).toLocaleDateString()}
                      </div>
                      <div
                        className={`flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {ad.location}
                      </div>
                      <div
                        className={`flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        {ad.price_type === "fixed"
                          ? `GHS ${ad.price_fixed}`
                          : `GHS ${ad.price_min} - ${ad.price_max}`}
                      </div>
                    </div>
                  </>
                )}

                <div
                  className={`flex items-center justify-between pt-4 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                >
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpanded(cardKey);
                      }}
                      className={`p-2 transition-colors rounded-lg hover:bg-blue-50 ${
                        theme === "dark"
                          ? "text-gold-300 hover:text-gold-300"
                          : "text-gold-500 hover:text-navy-950"
                      }`}
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
                    <button
                      onClick={() => openModal(ad, "view")}
                      className="p-2 text-gold-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal(ad, "edit")}
                      className="p-2 text-green-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {ad.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(ad.id, "approved")}
                          className="p-1 text-green-600 hover:bg-blue-50 rounded transition"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(ad.id, "rejected")}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3
            className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-navy-950"}`}
          >
            No Advertisements Found
          </h3>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            {searchTerm || statusFilter !== "all"
              ? "No advertisements match your current filters."
              : "No advertisements have been submitted yet."}
          </p>
        </div>
      )}

      <AnimatePresence>
        {showModal && selectedAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {action === "view"
                      ? "View Advertisement"
                      : "Edit Advertisement"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={
                        action === "edit"
                          ? editFormData.title
                          : selectedAd.title
                      }
                      onChange={
                        action === "edit"
                          ? (e) => handleEditFormChange("title", e.target.value)
                          : undefined
                      }
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={selectedAd.category
                        .replace("_", " ")
                        .toUpperCase()}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={
                      action === "edit"
                        ? editFormData.description
                        : selectedAd.description
                    }
                    onChange={
                      action === "edit"
                        ? (e) =>
                            handleEditFormChange("description", e.target.value)
                        : undefined
                    }
                    readOnly={action === "view"}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advertiser Name
                    </label>
                    <input
                      type="text"
                      value={
                        action === "edit"
                          ? editFormData.advertiser_name
                          : selectedAd.advertiser_name
                      }
                      onChange={
                        action === "edit"
                          ? (e) =>
                              handleEditFormChange(
                                "advertiser_name",
                                e.target.value
                              )
                          : undefined
                      }
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    <input
                      type="text"
                      value={
                        action === "edit"
                          ? editFormData.advertiser_contact
                          : selectedAd.advertiser_contact
                      }
                      onChange={
                        action === "edit"
                          ? (e) =>
                              handleEditFormChange(
                                "advertiser_contact",
                                e.target.value
                              )
                          : undefined
                      }
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={
                        action === "edit"
                          ? editFormData.advertiser_email
                          : selectedAd.advertiser_email
                      }
                      onChange={
                        action === "edit"
                          ? (e) =>
                              handleEditFormChange(
                                "advertiser_email",
                                e.target.value
                              )
                          : undefined
                      }
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={
                        action === "edit"
                          ? editFormData.location
                          : selectedAd.location
                      }
                      onChange={
                        action === "edit"
                          ? (e) =>
                              handleEditFormChange("location", e.target.value)
                          : undefined
                      }
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      value={
                        selectedAd.price_type === "fixed"
                          ? `GHS ${selectedAd.price_fixed}`
                          : `GHS ${selectedAd.price_min} - ${selectedAd.price_max}`
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={
                        action === "edit"
                          ? editFormData.status || selectedAd.status
                          : selectedAd.status
                      }
                      disabled={action === "view"}
                      onChange={(e) =>
                        handleEditFormChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {(action === "edit"
                      ? editFormData.images || []
                      : selectedAd.images || []
                    ).map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={buildImageSrc(img.url)}
                          alt={`Advertisement ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        {action === "edit" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {action === "edit" && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                      />
                      {newImages.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {newImages.length} new image
                          {newImages.length === 1 ? "" : "s"} selected
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition"
                  >
                    {action === "view" ? "Close" : "Cancel"}
                  </button>
                  {action === "edit" && (
                    <button
                      onClick={handleSaveChanges}
                      className="flex-1 px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
