"use client";
import { useState, useEffect } from "react";
import { buildImageSrc } from "../../../utils/config";
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
    stock: 0,
    isOutOfStock: false,
    category: "merchandise", // Default category
    contact: "",
    pricingUnit: "",
  });

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API data to match dashboard format
          const transformedItems = data.items.map((item) => ({
            id: item.id || 0,
            name: item.name || "",
            price: item.price || 0,
            image: item.image || null,
            description: item.description || "",
            rating: item.rating || 0,
            stock: item.stock_quantity || 0,
            isOutOfStock: !item.is_available,
            pricingUnit: item.pricingUnit || "",
            contact: item.contact || "",
            category: mapCategoryToFrontend(item.category) || "merchandise",
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
      stock: 0,
      isOutOfStock: false,
      category: "merchandise",
      contact: "",
      pricingUnit: "",
    });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        price: item.price || "",
        description: item.description || "",
        image: item.image || null,
        stock: item.stock || 0,
        isOutOfStock: item.isOutOfStock || false,
        category: item.category || "merchandise",
        contact: item.contact || "",
        pricingUnit: item.pricingUnit || "",
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

  // Map frontend category values to backend category values
  const mapCategoryToBackend = (frontendCategory) => {
    const categoryMap = {
      "t-shirt": "clothing",
      sash: "clothing",
      cloth: "clothing",
      bible: "books",
      "hymn-book": "books",
      plague: "accessories",
      merchandise: "merchandise",
      other: "other",
    };
    return categoryMap[frontendCategory] || "merchandise";
  };

  // Map backend category values to frontend category values
  const mapCategoryToFrontend = (backendCategory) => {
    const reverseMap = {
      clothing: "t-shirt", // Default to t-shirt for clothing
      books: "bible", // Default to bible for books
      accessories: "plague", // Default to plague for accessories
      merchandise: "merchandise",
      other: "other",
    };
    return reverseMap[backendCategory] || "merchandise";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData) {
        toast.error("Form data is missing");
        return;
      }

      // For new items, validate required fields
      if (!editingItem) {
        if (!formData.name || !formData.price || !formData.description) {
          toast.error("Please fill in all required fields");
          return;
        }
      } else {
        // For updates, only validate if fields are provided
        if (formData.name && formData.name.trim() === "") {
          toast.error("Name cannot be empty");
          return;
        }
        if (
          formData.price &&
          (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0)
        ) {
          toast.error("Price must be a valid positive number");
          return;
        }
      }

      // Prepare data for API
      let apiData = {};

      if (editingItem) {
        // For updates, only include fields that have values
        if (formData.name && formData.name.trim() !== "") {
          apiData.name = formData.name.trim();
        }
        if (formData.description && formData.description.trim() !== "") {
          apiData.description = formData.description.trim();
        }
        if (formData.price && !isNaN(parseFloat(formData.price))) {
          apiData.price = parseFloat(formData.price);
        }
        if (formData.category) {
          apiData.category = mapCategoryToBackend(formData.category);
        }
        if (formData.stock !== undefined && formData.stock !== null) {
          apiData.stock_quantity = parseInt(formData.stock) || 0;
        }
        if (formData.isOutOfStock !== undefined) {
          apiData.is_available = !formData.isOutOfStock;
        }
        if (formData.contact && formData.contact.trim() !== "") {
          apiData.contact = formData.contact.trim();
        }
      } else {
        // For new items, include all fields
        apiData = {
          name: formData.name || "",
          description: formData.description || "",
          price: parseFloat(formData.price || 0),
          category: mapCategoryToBackend(formData.category) || "merchandise",
          stock_quantity: formData.stock || 0,
          is_available: !(formData.isOutOfStock || false),
          contact: formData.contact || "",
        };
      }

      console.log("Sending update data:", apiData);

      if (editingItem) {
        // Update existing item
        let response;

        if (formData.image && formData.image instanceof File) {
          // If there's a new image file, use FormData
          const formDataToSend = new FormData();

          // Only append fields that exist in apiData
          if (apiData.name !== undefined)
            formDataToSend.append("name", apiData.name);
          if (apiData.description !== undefined)
            formDataToSend.append("description", apiData.description);
          if (apiData.price !== undefined)
            formDataToSend.append("price", apiData.price);
          if (apiData.category !== undefined)
            formDataToSend.append("category", apiData.category);
          if (apiData.stock_quantity !== undefined)
            formDataToSend.append("stock_quantity", apiData.stock_quantity);
          if (apiData.is_available !== undefined)
            formDataToSend.append("is_available", apiData.is_available);
          if (apiData.contact !== undefined)
            formDataToSend.append("contact", apiData.contact);
          formDataToSend.append("image", formData.image);

          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/item/?id=${editingItem.id}`,
            {
              method: "PUT",
              body: formDataToSend,
            }
          );
        } else {
          // If no new image file, use JSON
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/item/?id=${editingItem.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(apiData),
            }
          );
        }

        if (response.ok) {
          toast.success("Store item updated successfully!");
          fetchStoreItems(); // Refresh data
        } else {
          const errorData = await response.json();
          console.error("Update failed:", errorData);
          toast.error(
            `Failed to update item: ${errorData.error || "Unknown error"}`
          );
        }
      } else {
        // Add new item
        let response;

        if (formData.image && formData.image instanceof File) {
          // If there's an image file, use FormData
          const formDataToSend = new FormData();
          formDataToSend.append("name", apiData.name);
          formDataToSend.append("description", apiData.description);
          formDataToSend.append("price", apiData.price);
          formDataToSend.append("category", apiData.category);
          formDataToSend.append("stock_quantity", apiData.stock_quantity);
          formDataToSend.append("is_available", apiData.is_available);
          formDataToSend.append("contact", apiData.contact);
          formDataToSend.append("image", formData.image);

          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/`,
            {
              method: "POST",
              body: formDataToSend,
            }
          );
        } else {
          // If no image file, use JSON
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(apiData),
            }
          );
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/item/?id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock_quantity: newStock,
            is_available: newStock > 0,
          }),
        }
      );

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ystore/item/?id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock_quantity: newStock,
            is_available: newStock > 0,
          }),
        }
      );

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
                {storeItems
                  .reduce((sum, item) => {
                    const price = parseFloat(item.price || 0);
                    const stock = parseInt(item.stock || 0);
                    return isNaN(price) || isNaN(stock)
                      ? sum
                      : sum + price * stock;
                  }, 0)
                  .toFixed(2)}
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
                src={
                  item.image
                    ? buildImageSrc(item.image)
                    : "/placeholder-item.jpg"
                }
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-item.jpg";
                }}
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
                    className={`text-sm text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
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

              {/* Contact Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-2 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {item.contact || "No contact provided"}
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
                  {/* Basic Information - 2 columns with 2 fields per row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={formData?.name || ""}
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
                        value={formData?.price || ""}
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
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={formData.contact || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, contact: e.target.value })
                        }
                        placeholder="0xxxxxxxxx"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
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
                      value={formData?.description || ""}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={formData?.stock || 0}
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
                        Category
                      </label>
                      <select
                        value={formData?.category || "merchandise"}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      >
                        <option value="t-shirt">T-Shirt</option>
                        <option value="sash">Sash</option>
                        <option value="cloth">Cloth</option>
                        <option value="bible">Bible</option>
                        <option value="hymn-book">Hymn Book</option>
                        <option value="plague">Plague</option>
                        <option value="merchandise">Merchandise</option>
                        <option value="other">Other</option>
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
                    <div className="flex gap-2 items-end justify-between">
                      {/* Left side - Image preview and upload */}
                      <div className="flex gap-2">
                        <div
                          className={`w-24 h-12 border-2 border-dashed rounded-lg flex items-center justify-center ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600"
                              : "bg-gray-50 border-gray-300"
                          }`}
                        >
                          {formData.image ? (
                            <div className="text-center">
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto ${
                                  theme === "dark"
                                    ? "bg-green-900/30"
                                    : "bg-green-100"
                                }`}
                              >
                                <svg
                                  className={`w-2 h-2 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
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
                                {formData.image?.name?.substring(0, 8) +
                                  "..." || "File"}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <svg
                                className={`w-2.5 h-2.5 mx-auto ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
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
                                No img
                              </p>
                            </div>
                          )}
                        </div>
                        {/* Upload button */}
                        <div className="w-24">
                          <label
                            className={`h-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                              theme === "dark"
                                ? "border-blue-500 hover:border-blue-400 hover:bg-blue-900/20"
                                : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            <svg
                              className={`w-2.5 h-2.5 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
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

                      {/* Right side - Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={closeModal}
                          className={`px-3 py-2 rounded-md transition-colors font-medium text-xs ${
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
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-xs"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Adding...</span>
                            </div>
                          ) : editingItem ? (
                            "Update"
                          ) : (
                            "Add"
                          )}
                        </button>
                      </div>
                    </div>
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
