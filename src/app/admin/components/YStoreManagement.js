"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  Phone,
  Mail,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function YStoreManagement({ theme }) {
  const [storeItems, setStoreItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    rating: 4.5,
    stock: 0,
    isOutOfStock: false,
    pricingUnit: "",
    contact: "+233244123456", // Default contact number
    treasurer: {
      name: "",
      phone: "",
      email: "",
    },
    category: "",
    tags: [],
  });

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      const response = await fetch("http://localhost:8002/api/ystore");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API data to match dashboard format
          const transformedItems = data.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description,
            rating: item.rating,
            stock: item.stock,
            isOutOfStock: item.stock === 0,
            pricingUnit: item.pricingUnit || "",
            contact: item.contact || "+233244123456",
            treasurer: {
              name: "",
              phone: "",
              email: "",
            },
            category: item.category,
            tags: item.tags || [],
          }));
          setStoreItems(transformedItems);
        }
      }
    } catch (error) {
      console.error("Error fetching store items:", error);
      toast.error("Failed to load store items");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      image: null,
      rating: 4.5,
      stock: 0,
      isOutOfStock: false,
      pricingUnit: "",
      contact: "+233244123456",
      treasurer: {
        name: "",
        phone: "",
        email: "",
      },
      category: "",
      tags: [],
    });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        rating: item.rating,
        stock: item.stock,
        isOutOfStock: item.isOutOfStock,
        pricingUnit: item.pricingUnit || "",
        contact: item.contact || "+233244123456",
        treasurer: { ...item.treasurer },
        category: item.category,
        tags: [...item.tags],
      });
    } else {
      setEditingItem(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.price || !formData.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Prepare data for API
      const apiData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: formData.stock,
        rating: formData.rating,
        pricingUnit: formData.pricingUnit,
        contact: formData.contact,
        tags: formData.tags,
      };

      if (editingItem) {
        // Update existing item
        let response;

        if (formData.image) {
          // If there's an image, use FormData
          const formDataToSend = new FormData();
          formDataToSend.append("name", apiData.name);
          formDataToSend.append("description", apiData.description);
          formDataToSend.append("price", apiData.price);
          formDataToSend.append("category", apiData.category);
          formDataToSend.append("stock", apiData.stock);
          formDataToSend.append("rating", apiData.rating);
          formDataToSend.append("pricingUnit", apiData.pricingUnit);
          formDataToSend.append("contact", apiData.contact);
          formDataToSend.append("tags", JSON.stringify(apiData.tags));
          formDataToSend.append("image", formData.image);

          response = await fetch(`http://localhost:8002/api/ystore?id=${editingItem.id}`, {
            method: "PUT",
            body: formDataToSend,
          });
        } else {
          // If no image, use JSON
          response = await fetch(`http://localhost:8002/api/ystore?id=${editingItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          });
        }

        if (response.ok) {
          toast.success("Store item updated successfully!");
          fetchStoreItems(); // Refresh data
        } else {
          toast.error("Failed to update item");
        }
      } else {
        // Add new item
        let response;

        if (formData.image) {
          // If there's an image, use FormData
          const formDataToSend = new FormData();
          formDataToSend.append("name", apiData.name);
          formDataToSend.append("description", apiData.description);
          formDataToSend.append("price", apiData.price);
          formDataToSend.append("category", apiData.category);
          formDataToSend.append("stock", apiData.stock);
          formDataToSend.append("rating", apiData.rating);
          formDataToSend.append("pricingUnit", apiData.pricingUnit);
          formDataToSend.append("contact", apiData.contact);
          formDataToSend.append("tags", JSON.stringify(apiData.tags));
          formDataToSend.append("image", formData.image);

          response = await fetch("http://localhost:8002/api/ystore", {
            method: "POST",
            body: formDataToSend,
          });
        } else {
          // If no image, use JSON
          response = await fetch("http://localhost:8002/api/ystore", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          });
        }

        if (response.ok) {
          toast.success("Store item added successfully!");
          fetchStoreItems(); // Refresh data
        } else {
          toast.error("Failed to add item");
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteItem = async (deleteType) => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(
        `/api/ystore?id=${itemToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          toast.success("Store item permanently deleted!");
        } else {
          toast.success("Store item removed from dashboard!");
        }
        fetchStoreItems(); // Refresh data
      } else {
        toast.error("Failed to delete item");
      }
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const toggleStockStatus = async (id) => {
    try {
      const item = storeItems.find((item) => item.id === id);
      if (!item) return;

      const newStock = item.isOutOfStock ? 10 : 0; // Set to 10 if out of stock, 0 if in stock

      const response = await fetch(`http://localhost:8002/api/ystore?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          stock: newStock,
        }),
      });

      if (response.ok) {
        toast.success("Stock status updated!");
        fetchStoreItems(); // Refresh data
      } else {
        toast.error("Failed to update stock status");
      }
    } catch (error) {
      console.error("Error updating stock status:", error);
      toast.error("Failed to update stock status");
    }
  };

  const updateStock = async (id, newStock) => {
    try {
      const item = storeItems.find((item) => item.id === id);
      if (!item) return;

      const response = await fetch(`http://localhost:8002/api/ystore?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          stock: newStock,
        }),
      });

      if (response.ok) {
        toast.success("Stock updated successfully!");
        fetchStoreItems(); // Refresh data
      } else {
        toast.error("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className={`p-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-blue-600" />
            Y-Store Management
          </h1>
          <p
            className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage your store inventory and product listings
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors self-start lg:self-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Total Items
              </p>
              <p className="text-2xl font-bold">{storeItems.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                In Stock
              </p>
              <p className="text-2xl font-bold">
                {storeItems.filter((item) => !item.isOutOfStock).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Out of Stock
              </p>
              <p className="text-2xl font-bold">
                {storeItems.filter((item) => item.isOutOfStock).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Total Value
              </p>
              <p className="text-2xl font-bold">
                GHC{" "}
                {storeItems.reduce((sum, item) => {
                  const price = parseInt(item.price.replace(/\D/g, ""));
                  return sum + price * item.stock;
                }, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Store Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg shadow-md overflow-hidden ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Item Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.isOutOfStock && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
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

            {/* Item Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {item.description}
                  </p>
                </div>
                <span className="text-blue-600 font-bold text-sm ml-2">
                  ₵{item.price}
                  {item.pricingUnit ? ` ${item.pricingUnit}` : ""}
                </span>
              </div>

              {/* Stock Information */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Stock: {item.stock}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.isOutOfStock
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>

              {/* Treasurer Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p
                  className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  Contact: {item.treasurer.name}
                </p>
                <div className="flex items-center mt-1">
                  <Phone className="w-3 h-3 mr-1 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {item.treasurer.phone}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(item)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => toggleStockStatus(item.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.isOutOfStock
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white"
                  }`}
                >
                  {item.isOutOfStock ? "Restock" : "Mark Out"}
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                      }`}
                    >
                      <ShoppingCart
                        className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                      />
                    </div>
                    <div>
                      <h2
                        className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                      >
                        {editingItem ? "Edit Store Item" : "Add New Store Item"}
                      </h2>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {editingItem
                          ? "Update your store item details"
                          : "Create a new item for your store"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter item name"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Price *
                      </label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="70"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Pricing Unit
                      </label>
                      <input
                        type="text"
                        value={formData.pricingUnit || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricingUnit: e.target.value,
                          })
                        }
                        placeholder="per yard, per piece, etc."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.contact || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: e.target.value,
                          })
                        }
                        placeholder="+233244123456"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your item..."
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                      required
                    />
                  </div>

                  {/* Stock Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: parseInt(e.target.value) || 0,
                            isOutOfStock: (parseInt(e.target.value) || 0) === 0,
                          })
                        }
                        min="0"
                        placeholder="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Rating
                      </label>
                      <input
                        type="number"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="4.5"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      >
                        <option value="">Select Category</option>
                        <option value="Sash">Sash</option>
                        <option value="Plague">Plague</option>
                        <option value="Cloth">Cloth</option>
                        <option value="T-Shirt">T-Shirt</option>
                        <option value="Hymn Book">Hymn Book</option>
                        <option value="Bible">Bible</option>
                        <option value="Church Cloth">Church Cloth</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Item Image
                    </label>
                    <div className="flex gap-2">
                      {/* Left side - Image preview */}
                      <div
                        className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-300"
                        }`}
                      >
                        {formData.image ? (
                          <div className="text-center">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-1 ${
                                theme === "dark"
                                  ? "bg-green-900/30"
                                  : "bg-green-100"
                              }`}
                            >
                              <svg
                                className={`w-2.5 h-2.5 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <p
                              className={`text-xs truncate px-1 ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              }`}
                            >
                              {formData.image.name}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg
                              className={`w-3 h-3 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p
                              className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                            >
                              No image
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Right side - Upload button */}
                      <div className="w-24">
                        <label
                          className={`h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                            theme === "dark"
                              ? "border-blue-500 hover:border-blue-400 hover:bg-blue-900/20"
                              : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          <svg
                            className={`w-3 h-3 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span
                            className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                          >
                            Upload
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                image: e.target.files[0],
                              })
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Treasurer Information */}
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          theme === "dark"
                            ? "bg-purple-900/30"
                            : "bg-purple-100"
                        }`}
                      >
                        <Phone
                          className={`w-3 h-3 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}
                        />
                      </div>
                      <h3
                        className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                      >
                        Treasurer Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.treasurer.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              treasurer: {
                                ...formData.treasurer,
                                name: e.target.value,
                              },
                            })
                          }
                          placeholder="Treasurer name"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.treasurer.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              treasurer: {
                                ...formData.treasurer,
                                phone: e.target.value,
                              },
                            })
                          }
                          placeholder="+233201234567"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.treasurer.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              treasurer: {
                                ...formData.treasurer,
                                email: e.target.value,
                              },
                            })
                          }
                          placeholder="treasurer@ypg.com"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                        theme === "dark"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : editingItem ? (
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Update Item</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Add Item</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
