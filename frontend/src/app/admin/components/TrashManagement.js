"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
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
  MoreVertical,
  Check,
  X,
  Filter,
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
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemMenu, setShowItemMenu] = useState(null);

  // Fetch all deleted items
  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      // Fetch from API endpoints for each category
      const categories = [
        "team",
        "events",
        "donations",
        "blog",
        "testimonials",
        "ministry",
        "contact",
        "gallery",
        "past-executives",
      ];
      const promises = categories.map(async (category) => {
        try {
          const response = await fetch(
            `http://localhost:8002/api/${category}/?deleted=true`
          );
          const data = await response.json();
          return {
            category,
            data: data.success
              ? data[category] || data[category.slice(0, -1) + "s"] || []
              : [],
          };
        } catch (error) {
          console.error(`Error fetching ${category}:`, error);
          return { category, data: [] };
        }
      });

      const results = await Promise.all(promises);
      const newDeletedItems = {};
      results.forEach(({ category, data }) => {
        newDeletedItems[category] = data;
      });

      setDeletedItems(newDeletedItems);
    } catch (error) {
      console.error("Error fetching deleted items:", error);
      toast.error("Failed to load deleted items");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item, category) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/${category}/${item.id}/restore/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`${getCategoryLabel(category)} restored successfully!`);

        // Remove item from deleted items list
        setDeletedItems((prev) => ({
          ...prev,
          [category]: prev[category].filter((i) => i.id !== item.id),
        }));

        // Remove from selected items if it was selected
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(`${category}-${item.id}`);
          return newSet;
        });
      } else {
        toast.error("Failed to restore item");
      }
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (item, category) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/${category}/${item.id}/delete/`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`${getCategoryLabel(category)} permanently deleted!`);

        // Remove item from deleted items list
        setDeletedItems((prev) => ({
          ...prev,
          [category]: prev[category].filter((i) => i.id !== item.id),
        }));

        // Remove from selected items if it was selected
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(`${category}-${item.id}`);
          return newSet;
        });
      } else {
        toast.error("Failed to permanently delete item");
      }
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      toast.error("Failed to permanently delete item");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) return;

    const itemsToProcess = Array.from(selectedItems).map((itemKey) => {
      const [category, id] = itemKey.split("-");
      return { category, id: parseInt(id) };
    });

    try {
      const promises = itemsToProcess.map(({ category, id }) => {
        if (action === "restore") {
          return fetch(`http://localhost:8002/api/${category}/${id}/restore/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return fetch(`http://localhost:8002/api/${category}/${id}/delete/`, {
            method: "DELETE",
          });
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount > 0) {
        toast.success(
          `${successCount} items ${action === "restore" ? "restored" : "permanently deleted"} successfully!`
        );

        // Remove processed items from deleted items list
        setDeletedItems((prev) => {
          const newItems = { ...prev };
          itemsToProcess.forEach(({ category, id }) => {
            newItems[category] = newItems[category].filter(
              (item) => item.id !== id
            );
          });
          return newItems;
        });

        // Clear selected items
        setSelectedItems(new Set());
      } else {
        toast.error(`Failed to ${action} items`);
      }
    } catch (error) {
      console.error(`Error ${action}ing items:`, error);
      toast.error(`Failed to ${action} items`);
    }
  };

  const handleSelectItem = (itemKey) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const currentItems = getCurrentItems();
    const allItemKeys = currentItems.map(
      (item) => `${item.category}-${item.id}`
    );

    if (selectedItems.size === allItemKeys.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allItemKeys));
    }
  };

  const getCurrentItems = () => {
    if (selectedCategory === "all") {
      const allItems = [];
      Object.entries(deletedItems).forEach(([category, items]) => {
        items.forEach((item) => {
          allItems.push({ ...item, category });
        });
      });
      return allItems;
    }
    return (
      deletedItems[selectedCategory]?.map((item) => ({
        ...item,
        category: selectedCategory,
      })) || []
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      team: "Team Member",
      events: "Event",
      donations: "Donation",
      blog: "Blog Post",
      testimonials: "Testimonial",
      ministry: "Ministry Registration",
      contact: "Contact Message",
      gallery: "Gallery Item",
      "past-executives": "Past Executive",
    };
    return labels[category] || "Item";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      team: Users,
      events: Calendar,
      donations: DollarSign,
      blog: FileText,
      testimonials: MessageSquare,
      ministry: Building,
      contact: MessageSquare,
      gallery: Image,
      "past-executives": Users,
    };
    return icons[category] || Trash2;
  };

  const getCategoryColor = (category) => {
    const colors = {
      team: "blue",
      events: "purple",
      donations: "green",
      blog: "orange",
      testimonials: "indigo",
      ministry: "teal",
      contact: "pink",
      gallery: "red",
      "past-executives": "blue",
    };
    return colors[category] || "gray";
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
    {
      key: "all",
      label: "All Items",
      icon: Trash2,
      count: Object.values(deletedItems).flat().length,
    },
    {
      key: "team",
      label: "Team Members",
      icon: Users,
      count: deletedItems.team.length,
    },
    {
      key: "events",
      label: "Events",
      icon: Calendar,
      count: deletedItems.events.length,
    },
    {
      key: "donations",
      label: "Donations",
      icon: DollarSign,
      count: deletedItems.donations.length,
    },
    {
      key: "blog",
      label: "Blog Posts",
      icon: FileText,
      count: deletedItems.blog.length,
    },
    {
      key: "media",
      label: "Media Files",
      icon: Image,
      count: deletedItems.media.length,
    },
    {
      key: "testimonials",
      label: "Testimonials",
      icon: MessageSquare,
      count: deletedItems.testimonials.length,
    },
    {
      key: "ministry",
      label: "Ministry",
      icon: Building,
      count: deletedItems.ministry.length,
    },
    {
      key: "contact",
      label: "Contact Messages",
      icon: MessageSquare,
      count: deletedItems.contact.length,
    },
  ];

  const currentItems = getCurrentItems();
  const allSelected =
    currentItems.length > 0 && selectedItems.size === currentItems.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Trash Management
          </h2>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Manage deleted items and restore or permanently delete them
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.key;

          return (
            <button
              key={category.key}
              onClick={() => {
                setSelectedCategory(category.key);
                setSelectedItems(new Set());
              }}
              className={`p-3 rounded-lg border transition-all ${
                isActive
                  ? theme === "dark"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-blue-600 border-blue-500 text-white"
                  : theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bulk Actions */}
      {currentItems.length > 0 && (
        <div
          className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Select All ({selectedItems.size} selected)
                </span>
              </label>
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBulkAction("restore");
                    setShowBulkActionModal(true);
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Restore Selected
                </button>
                <button
                  onClick={() => {
                    setBulkAction("delete");
                    setShowBulkActionModal(true);
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3
              className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              No Deleted Items
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {selectedCategory === "all"
                ? "No items have been deleted yet."
                : `No deleted ${categories.find((c) => c.key === selectedCategory)?.label.toLowerCase()} found.`}
            </p>
          </div>
        ) : (
          currentItems.map((item) => {
            const Icon = getCategoryIcon(item.category);
            const color = getCategoryColor(item.category);
            const itemKey = `${item.category}-${item.id}`;
            const isSelected = selectedItems.has(itemKey);

            return (
              <motion.div
                key={itemKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border transition-all ${
                  isSelected
                    ? theme === "dark"
                      ? "bg-blue-900/20 border-blue-500"
                      : "bg-blue-50 border-blue-300"
                    : theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(itemKey)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />

                  {/* Icon */}
                  <div className={`p-2 rounded-full bg-${color}-100`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium truncate ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.name ||
                        item.title ||
                        item.subject ||
                        `${getCategoryLabel(item.category)} #${item.id}`}
                    </h4>
                    <p
                      className={`text-sm truncate ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.description ||
                        item.content ||
                        item.message ||
                        `Deleted ${getCategoryLabel(item.category)}`}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          theme === "dark"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getCategoryLabel(item.category)}
                      </span>
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Deleted{" "}
                        {formatDate(
                          item.deleted_at || item.updated_at || item.created_at
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Three Dots Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowItemMenu(
                          showItemMenu === itemKey ? null : itemKey
                        )
                      }
                      className={`p-2 rounded-lg hover:bg-gray-100 ${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showItemMenu === itemKey && (
                      <div
                        className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border z-10 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRestoreModal(true);
                              setShowItemMenu(null);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                              theme === "dark"
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700"
                            }`}
                          >
                            <RotateCcw className="w-4 h-4 inline mr-2" />
                            Restore
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteModal(true);
                              setShowItemMenu(null);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 ${
                              theme === "dark"
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Delete Permanently
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <Transition.Root show={showRestoreModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowRestoreModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${theme === "dark" ? "bg-green-900/30" : "bg-green-100"}`}
                    >
                      <RotateCcw
                        className={`w-5 h-5 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                      />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Restore Item
                    </Dialog.Title>
                  </div>

                  <p
                    className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Are you sure you want to restore this item? It will be moved
                    back to its original location.
                  </p>

                  {selectedItem && (
                    <div
                      className={`rounded-lg p-3 mb-6 ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {selectedItem.name ||
                          selectedItem.title ||
                          selectedItem.subject ||
                          `${getCategoryLabel(selectedItem.category)} #${selectedItem.id}`}
                      </p>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {getCategoryLabel(selectedItem.category)}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowRestoreModal(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleRestore(selectedItem, selectedItem.category);
                        setShowRestoreModal(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                    >
                      Restore Item
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDeleteModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${theme === "dark" ? "bg-red-900/30" : "bg-red-100"}`}
                    >
                      <Trash2
                        className={`w-5 h-5 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
                      />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Delete Permanently
                    </Dialog.Title>
                  </div>

                  <p
                    className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Are you sure you want to permanently delete this item? This
                    action cannot be undone.
                  </p>

                  {selectedItem && (
                    <div
                      className={`rounded-lg p-3 mb-6 ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {selectedItem.name ||
                          selectedItem.title ||
                          selectedItem.subject ||
                          `${getCategoryLabel(selectedItem.category)} #${selectedItem.id}`}
                      </p>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {getCategoryLabel(selectedItem.category)}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handlePermanentDelete(
                          selectedItem,
                          selectedItem.category
                        );
                        setShowDeleteModal(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Bulk Action Confirmation Modal */}
      <Transition.Root show={showBulkActionModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowBulkActionModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${
                        bulkAction === "restore"
                          ? theme === "dark"
                            ? "bg-green-900/30"
                            : "bg-green-100"
                          : theme === "dark"
                            ? "bg-red-900/30"
                            : "bg-red-100"
                      }`}
                    >
                      {bulkAction === "restore" ? (
                        <RotateCcw
                          className={`w-5 h-5 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                        />
                      ) : (
                        <Trash2
                          className={`w-5 h-5 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
                        />
                      )}
                    </div>
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {bulkAction === "restore"
                        ? "Restore Items"
                        : "Delete Items Permanently"}
                    </Dialog.Title>
                  </div>

                  <p
                    className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {bulkAction === "restore"
                      ? `Are you sure you want to restore ${selectedItems.size} selected items? They will be moved back to their original locations.`
                      : `Are you sure you want to permanently delete ${selectedItems.size} selected items? This action cannot be undone.`}
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowBulkActionModal(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleBulkAction(bulkAction);
                        setShowBulkActionModal(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        bulkAction === "restore"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {bulkAction === "restore"
                        ? "Restore Items"
                        : "Delete Permanently"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
