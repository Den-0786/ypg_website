"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

export default function AdvertisementManagement({ theme }) {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("view");

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch("http://localhost:8002/api/advertisements/");
      const data = await response.json();
      if (data.success) {
        setAdvertisements(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (adId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/advertisements/${adId}/update/`,
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
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      try {
        const response = await fetch(
          `http://localhost:8002/api/advertisements/${adId}/delete/`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (data.success) {
          setAdvertisements((prev) => prev.filter((ad) => ad.id !== adId));
        }
      } catch (error) {
        console.error("Error deleting advertisement:", error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      fashion: "bg-pink-100 text-pink-800",
      technology: "bg-blue-100 text-blue-800",
      education: "bg-purple-100 text-purple-800",
      health: "bg-green-100 text-green-800",
      automotive: "bg-gray-100 text-gray-800",
      real_estate: "bg-indigo-100 text-indigo-800",
      services: "bg-teal-100 text-teal-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Advertisement Management
          </h2>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Manage member advertisements and submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}
            />
            <input
              type="text"
              placeholder="Search advertisements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg shadow-md border overflow-hidden ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {ad.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
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
                {ad.is_member && (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    YPG Member - {ad.member_congregation}
                  </div>
                )}
              </div>

              <div
                className={`flex items-center justify-between pt-4 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedAd(ad);
                      setAction("view");
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAd(ad);
                      setAction("edit");
                      setShowModal(true);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
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
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition"
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
        ))}
      </div>

      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3
            className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
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
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
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
                      value={selectedAd.title}
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedAd.description}
                    readOnly={action === "view"}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advertiser Name
                    </label>
                    <input
                      type="text"
                      value={selectedAd.advertiser_name}
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    <input
                      type="text"
                      value={selectedAd.advertiser_contact}
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={selectedAd.advertiser_email}
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={selectedAd.location}
                      readOnly={action === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedAd.status}
                      disabled={action === "view"}
                      onChange={(e) =>
                        setSelectedAd({ ...selectedAd, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {selectedAd.is_member && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <Check className="w-5 h-5 mr-2" />
                      <span className="font-medium">YPG Member</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Congregation: {selectedAd.member_congregation}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    {action === "view" ? "Close" : "Cancel"}
                  </button>
                  {action === "edit" && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedAd.id, selectedAd.status);
                        setShowModal(false);
                      }}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
