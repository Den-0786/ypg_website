"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Image,
  MessageSquare,
  Building,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TrashManagement({ theme }) {
  const [deletedItems, setDeletedItems] = useState({
    team: [],
    events: [],
    donations: [],
    blog: [],
    media: [],
    testimonials: [],
    ministry: [],
    contact: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch all deleted items
  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch from the API
      // For now, return empty data
      setDeletedItems({
        team: [],
        events: [],
        donations: [],
        blog: [],
        media: [],
        testimonials: [],
        ministry: [],
        contact: [],
      });
    } catch (error) {
      console.error("Error fetching deleted items:", error);
      toast.error("Failed to load deleted items");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item, category) => {
    try {
      // For now, simulate API call
      console.log(`Restoring ${category} item with ID: ${item.id}`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(`${getCategoryLabel(category)} restored successfully!`);

      // Remove item from deleted items list
      setDeletedItems((prev) => ({
        ...prev,
        [category]: prev[category].filter((i) => i.id !== item.id),
      }));
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (item, category) => {
    try {
      // For now, simulate API call
      console.log(`Permanently deleting ${category} item with ID: ${item.id}`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(`${getCategoryLabel(category)} permanently deleted!`);

      // Remove item from deleted items list
      setDeletedItems((prev) => ({
        ...prev,
        [category]: prev[category].filter((i) => i.id !== item.id),
      }));
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      toast.error("Failed to permanently delete item");
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      team: "Team Member",
      events: "Event",
      donations: "Donation",
      blog: "Blog Post",
      media: "Media File",
      testimonials: "Testimonial",
      ministry: "Ministry Registration",
      contact: "Contact Message",
    };
    return labels[category] || "Item";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      team: Users,
      events: Calendar,
      donations: DollarSign,
      blog: FileText,
      media: Image,
      testimonials: MessageSquare,
      ministry: Building,
      contact: MessageSquare,
    };
    return icons[category] || Trash2;
  };

  const getCategoryColor = (category) => {
    const colors = {
      team: "blue",
      events: "purple",
      donations: "green",
      blog: "orange",
      media: "red",
      testimonials: "indigo",
      ministry: "teal",
      contact: "pink",
    };
    return colors[category] || "gray";
  };

  const getAllItems = () => {
    const allItems = [];
    Object.entries(deletedItems).forEach(([category, items]) => {
      items.forEach((item) => {
        allItems.push({ ...item, category });
      });
    });
    return allItems;
  };

  const getFilteredItems = () => {
    if (selectedCategory === "all") {
      return getAllItems();
    }
    return deletedItems[selectedCategory] || [];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const categories = [
    { key: "all", label: "All Items", count: getAllItems().length },
    { key: "team", label: "Team Members", count: deletedItems.team.length },
    { key: "events", label: "Events", count: deletedItems.events.length },
    {
      key: "donations",
      label: "Donations",
      count: deletedItems.donations.length,
    },
    { key: "blog", label: "Blog Posts", count: deletedItems.blog.length },
    { key: "media", label: "Media Files", count: deletedItems.media.length },
    {
      key: "testimonials",
      label: "Testimonials",
      count: deletedItems.testimonials.length,
    },
    { key: "ministry", label: "Ministry", count: deletedItems.ministry.length },
    {
      key: "contact",
      label: "Contact Messages",
      count: deletedItems.contact.length,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p
            className={`mt-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Loading deleted items...
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Trash Management
          </h1>
          <p
            className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage all deleted items across your ministry
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle
            className={`w-6 h-6 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
          />
          <span
            className={`text-sm font-medium ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
          >
            {getAllItems().length} items in trash
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.key
                ? "bg-blue-600 text-white"
                : theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.label}
            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-12 ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <Trash2
            className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}
          />
          <h3
            className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            No deleted items found
          </h3>
          <p
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            {selectedCategory === "all"
              ? "All your deleted items will appear here"
              : `No deleted ${getCategoryLabel(selectedCategory).toLowerCase()}s found`}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item, index) => {
            const Icon = getCategoryIcon(item.category);
            const color = getCategoryColor(item.category);

            return (
              <motion.div
                key={`${item.category}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-${color}-100`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full bg-${color}-100 text-${color}-700`}
                        >
                          {getCategoryLabel(item.category)}
                        </span>
                        <span
                          className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        >
                          ID: {item.id}
                        </span>
                      </div>
                      <h3
                        className={`text-lg font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {item.title ||
                          item.name ||
                          item.donor ||
                          item.subject ||
                          "Untitled"}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {item.description ||
                          item.quote ||
                          item.message ||
                          item.purpose ||
                          "No description available"}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Deleted:{" "}
                            {formatDate(
                              item.deleted_at ||
                                item.updated_at ||
                                item.created_at
                            )}
                          </span>
                        </div>
                        {item.deleted_by && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>By: {item.deleted_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestore(item, item.category)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === "dark"
                          ? "text-green-400 hover:bg-green-400/10"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title="Restore item"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteModal(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === "dark"
                          ? "text-red-400 hover:bg-red-400/10"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                      title="Permanently delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 max-w-md w-full shadow-xl`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    Permanent Deletion
                  </h3>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p
                className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                Are you sure you want to permanently delete this{" "}
                <span className="font-semibold">
                  {getCategoryLabel(selectedItem.category).toLowerCase()}
                </span>
                ? This will remove it from both the dashboard and the main
                website.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handlePermanentDelete(selectedItem, selectedItem.category);
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
