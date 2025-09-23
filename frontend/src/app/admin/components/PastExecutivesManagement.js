"use client";

import { useState, useEffect } from "react";
import { buildImageSrc } from "../../../utils/config";
import { Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PastExecutivesManagement({ theme }) {
  const [pastExecutives, setPastExecutives] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentExecutive, setCurrentExecutive] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "other",
    reign_period: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [executiveToDelete, setExecutiveToDelete] = useState(null);

  useEffect(() => {
    fetchPastExecutives();
  }, [showDeleted]);

  const fetchPastExecutives = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/past-executives/?deleted=${showDeleted}`
      );
      const data = await response.json();
      if (data.success) {
        setPastExecutives(data.pastExecutives);
      } else {
        toast.error(data.error || "Failed to fetch past executives");
      }
    } catch (error) {
      console.error("Error fetching past executives:", error);
      toast.error("Failed to fetch past executives");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/past-executives/${currentExecutive.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/past-executives/create/`;
      const method = isEditMode ? "PUT" : "POST";

      let response;

      if (formData.image && formData.image instanceof File) {
        // Use FormData for image uploads
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("position", formData.position);
        formDataToSend.append("reign_period", formData.reign_period);
        formDataToSend.append("image", formData.image);

        response = await fetch(url, {
          method,
          body: formDataToSend,
        });
      } else {
        // Use JSON for non-image requests
        const apiData = {
          name: formData.name,
          position: formData.position,
          reign_period: formData.reign_period,
        };

        // Only include image if it's a File object (new upload)
        if (formData.image && formData.image instanceof File) {
          // This shouldn't happen as we check above, but just in case
          console.warn(
            "Image file detected in JSON path, this should use FormData"
          );
        }

        response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });
      }

      const data = await response.json();

      if (data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchPastExecutives();
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed to save past executive");
      }
    } catch (error) {
      console.error("Error saving past executive:", error);
      toast.error("Failed to save past executive");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (executive) => {
    setCurrentExecutive(executive);
    setFormData({
      name: executive.name,
      position: executive.position,
      reign_period: executive.reign_period,
      image: executive.image || null,
    });
    setImagePreview(executive.image);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (executive) => {
    setExecutiveToDelete(executive);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!executiveToDelete) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/past-executives/${executiveToDelete.id}/delete/`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.success) {
        // refresh list
        fetchPastExecutives();
        toast.success(data.message || "Past executive deleted successfully");
        setShowDeleteModal(false);
        setExecutiveToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete past executive");
      }
    } catch (error) {
      console.error("Error deleting past executive:", error);
      toast.error("Failed to delete past executive");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "other",
      reign_period: "",
      image: null,
    });
    setImagePreview(null);
    setCurrentExecutive(null);
    setIsEditMode(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Past Executives Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              theme === "dark"
                ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {showDeleted ? <EyeOff size={16} /> : <Eye size={16} />}
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Past Executive
          </button>
        </div>
      </div>

      {pastExecutives.length === 0 ? (
        <div className="text-center py-12">
          <div
            className={`mb-4 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3
            className={`text-lg font-medium mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {showDeleted
              ? "No deleted past executives"
              : "No past executives yet"}
          </h3>
          <p
            className={`mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {showDeleted
              ? "Deleted past executives will appear here"
              : "Start building your YPG legacy by adding past executives"}
          </p>
          {!showDeleted && (
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Your First Past Executive
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pastExecutives.map((executive) => (
            <div
              key={executive.id}
              className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`aspect-w-16 aspect-h-9 ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-100"
                }`}
              >
                {executive.image ? (
                  <img
                    src={buildImageSrc(executive.image)}
                    alt={executive.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-40 flex items-center justify-center ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`h-10 w-10 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {executive.name}
                </h3>
                <p
                  className={`text-sm mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {executive.position}
                </p>
                <p className="text-sm font-medium text-blue-600 mb-3">
                  {executive.reign_period}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(executive)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      theme === "dark"
                        ? "text-blue-400 bg-blue-900/20 hover:bg-blue-900/30"
                        : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(executive)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      theme === "dark"
                        ? "text-red-400 bg-red-900/20 hover:bg-red-900/30"
                        : "text-red-600 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-lg p-6 w-full max-w-md mx-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {isEditMode ? "Edit Past Executive" : "Add Past Executive"}
              </h3>
              <button
                onClick={closeModal}
                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                <X
                  size={20}
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Position *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Reign Period * (e.g., "2019 - 2022")
                </label>
                <input
                  type="text"
                  value={formData.reign_period}
                  onChange={(e) =>
                    setFormData({ ...formData, reign_period: e.target.value })
                  }
                  placeholder="2019 - 2022"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    theme === "dark"
                      ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : isEditMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && executiveToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-lg p-6 w-full max-w-md mx-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Confirm Deletion
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setExecutiveToDelete(null);
                }}
                className={`p-1 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-gray-700 text-white"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-6`}
            >
              Are you sure you want to delete "{executiveToDelete.name}"?
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setExecutiveToDelete(null);
                }}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
