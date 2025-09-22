/* eslint-disable jsx-a11y/alt-text */
import { useState } from "react";
import {
  Image,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  ImageIcon,
  VideoIcon,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MediaManagement = ({ media = [], setMedia, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const [newMedia, setNewMedia] = useState({
    title: "",
    description: "",
    type: "image",
    file: null,
    congregation: "",
    date: new Date().toISOString().split("T")[0],
    youtubeUrl: "",
    tiktokUrl: "",
  });

  const handleAddMedia = async () => {
    // Basic validation
    if (!newMedia.title.trim()) {
      showToast("Please enter a title", "error");
      return;
    }

    if (
      newMedia.type === "video" &&
      !newMedia.file &&
      !newMedia.youtubeUrl &&
      !newMedia.tiktokUrl
    ) {
      showToast(
        "For videos, please either upload a video file or provide a YouTube/TikTok URL",
        "error"
      );
      return;
    }

    try {
      let response;

      if (newMedia.file) {
        // If there's a file (image or video), use FormData
        const formData = new FormData();
        formData.append("title", newMedia.title);
        formData.append("description", newMedia.description);
        formData.append("category", newMedia.type);
        formData.append("congregation", newMedia.congregation);
        formData.append("date", newMedia.date);
        formData.append("youtube_url", newMedia.youtubeUrl);
        formData.append("tiktok_url", newMedia.tiktokUrl);
        formData.append("file", newMedia.file); // Send as 'file' - backend will handle routing

        response = await fetch("http://localhost:8002/api/gallery/create/", {
          method: "POST",
          body: formData,
        });
      } else {
        // If no file, use JSON
        response = await fetch("http://localhost:8002/api/gallery/create/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newMedia.title,
            description: newMedia.description,
            category: newMedia.type,
            congregation: newMedia.congregation,
            date: newMedia.date,
            youtube_url: newMedia.youtubeUrl,
            tiktok_url: newMedia.tiktokUrl,
          }),
        });
      }

      if (response.ok) {
        const addedMedia = await response.json();
        setMedia([...media, addedMedia.media]);
        setShowAddModal(false);
        setNewMedia({
          title: "",
          description: "",
          type: "image",
          file: null,
          congregation: "",
          date: new Date().toISOString().split("T")[0],
          youtubeUrl: "",
          tiktokUrl: "",
        });
        showToast("Media added successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        showToast(
          `Error: ${errorData.error || "Failed to add media"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error adding media:", error);
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const handleUpdateMedia = async () => {
    try {
      let response;

      if (editingMedia.file) {
        // If there's a file, use FormData
        const formData = new FormData();
        formData.append("title", editingMedia.title);
        formData.append("description", editingMedia.description);
        formData.append("category", editingMedia.type);
        formData.append("congregation", editingMedia.congregation);
        formData.append("date", editingMedia.date);
        formData.append("youtube_url", editingMedia.youtubeUrl);
        formData.append("tiktok_url", editingMedia.tiktokUrl);
        formData.append("image", editingMedia.file);

        response = await fetch(
          `http://localhost:8002/api/gallery/${editingMedia.id}/update/`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        // If no file, use JSON
        response = await fetch(
          `http://localhost:8002/api/gallery/${editingMedia.id}/update/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: editingMedia.title,
              description: editingMedia.description,
              category: editingMedia.type,
              congregation: editingMedia.congregation,
              date: editingMedia.date,
              youtube_url: editingMedia.youtubeUrl,
              tiktok_url: editingMedia.tiktokUrl,
            }),
          }
        );
      }

      if (response.ok) {
        const updatedMedia = await response.json();
        setMedia(
          media.map((item) =>
            item.id === editingMedia.id ? updatedMedia.media : item
          )
        );
        setEditingMedia(null);
      }
    } catch (error) {
      console.error("Error updating media:", error);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8002/api/gallery/${itemToDelete.id}/delete/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMedia(media.filter((item) => item.id !== itemToDelete.id));
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Media Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {media.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden`}
          >
            <div className="h-64 relative overflow-hidden">
              {item.image ? (
                <img
                  src={`http://localhost:8002${item.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : item.video ? (
                <video
                  src={`http://localhost:8002${item.video}`}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <div
                  className={`h-full ${theme === "dark" ? "bg-gradient-to-r from-orange-600 to-red-600" : "bg-gradient-to-r from-orange-500 to-red-500"} flex items-center justify-center`}
                >
                  <Image className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3
                className={`font-semibold mb-2 line-clamp-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm mb-2 line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                {item.description}
              </p>
              {item.congregation && (
                <p
                  className={`text-xs mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                >
                  📍 {item.congregation}
                </p>
              )}
              {item.date && (
                <p
                  className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  📅 {new Date(item.date).toLocaleDateString()}
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setEditingMedia({
                      ...item,
                      type: item.category,
                      youtubeUrl: item.youtube_url || "",
                      tiktokUrl: item.tiktok_url || "",
                      file: null,
                    })
                  }
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-red-900/30 text-red-300 hover:bg-red-800/40" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Media Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Add Media
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-1 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Title/Caption
                  </label>
                  <input
                    type="text"
                    value={newMedia.title}
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, title: e.target.value })
                    }
                    placeholder="Enter a descriptive title for your media"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Brief Description (include location/congregation)
                  </label>
                  <textarea
                    value={newMedia.description}
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Describe the media content and include congregation details"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Media Type
                  </label>
                  <select
                    value={newMedia.type}
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, type: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Browse Media
                  </label>
                  <div className="flex gap-3">
                    {/* Left side - Media preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      {newMedia.file ? (
                        <div className="text-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${theme === "dark" ? "bg-green-900/30" : "bg-green-100"}`}
                          >
                            <svg
                              className={`w-3 h-3 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
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
                            className={`text-xs truncate px-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {newMedia.file.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          {newMedia.type === "image" ? (
                            <ImageIcon
                              className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                            />
                          ) : (
                            <VideoIcon
                              className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                            />
                          )}
                          <p
                            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          >
                            No media
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Right side - Upload button */}
                    <div className="flex-1">
                      <label
                        className={`h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "border-blue-500 hover:border-blue-400 hover:bg-blue-900/20" : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"}`}
                      >
                        <Upload
                          className={`w-4 h-4 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                        />
                        <span
                          className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        >
                          Upload
                        </span>
                        <input
                          type="file"
                          accept={
                            newMedia.type === "image" ? "image/*" : "video/*"
                          }
                          onChange={(e) =>
                            setNewMedia({
                              ...newMedia,
                              file: e.target.files[0],
                            })
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Congregation/Venue
                  </label>
                  <input
                    type="text"
                    value={newMedia.congregation}
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, congregation: e.target.value })
                    }
                    placeholder="e.g., Emmanuel Congregation Ahinsan"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMedia.date}
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, date: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                  />
                </div>
                {newMedia.type === "video" && (
                  <div className="space-y-3">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        YouTube URL (optional)
                      </label>
                      <input
                        type="url"
                        value={newMedia.youtubeUrl}
                        onChange={(e) =>
                          setNewMedia({
                            ...newMedia,
                            youtubeUrl: e.target.value,
                          })
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        TikTok URL (optional)
                      </label>
                      <input
                        type="url"
                        value={newMedia.tiktokUrl}
                        onChange={(e) =>
                          setNewMedia({
                            ...newMedia,
                            tiktokUrl: e.target.value,
                          })
                        }
                        placeholder="https://tiktok.com/@username/video/..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMedia}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Media
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Media Modal */}
      <AnimatePresence>
        {editingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Edit Media
                </h3>
                <button
                  onClick={() => setEditingMedia(null)}
                  className={`p-1 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Title/Caption
                  </label>
                  <input
                    type="text"
                    value={editingMedia.title}
                    onChange={(e) =>
                      setEditingMedia({
                        ...editingMedia,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter a descriptive title for your media"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Brief Description (include location/congregation)
                  </label>
                  <textarea
                    value={editingMedia.description}
                    onChange={(e) =>
                      setEditingMedia({
                        ...editingMedia,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Describe the media content and include congregation details"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Media Type
                  </label>
                  <select
                    value={editingMedia.type}
                    onChange={(e) =>
                      setEditingMedia({ ...editingMedia, type: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Browse Media
                  </label>
                  <div className="flex gap-3">
                    {/* Left side - Media preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      {editingMedia.file ? (
                        <div className="text-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${theme === "dark" ? "bg-green-900/30" : "bg-green-100"}`}
                          >
                            <svg
                              className={`w-3 h-3 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
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
                            className={`text-xs truncate px-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {editingMedia.file.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          {editingMedia.type === "image" ? (
                            <ImageIcon
                              className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                            />
                          ) : (
                            <VideoIcon
                              className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                            />
                          )}
                          <p
                            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          >
                            No media
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Right side - Upload button */}
                    <div className="flex-1">
                      <label
                        className={`h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${theme === "dark" ? "border-blue-500 hover:border-blue-400 hover:bg-blue-900/20" : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"}`}
                      >
                        <Upload
                          className={`w-4 h-4 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                        />
                        <span
                          className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        >
                          Upload
                        </span>
                        <input
                          type="file"
                          accept={
                            editingMedia.type === "image"
                              ? "image/*"
                              : "video/*"
                          }
                          onChange={(e) =>
                            setEditingMedia({
                              ...editingMedia,
                              file: e.target.files[0],
                            })
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Congregation/Venue
                  </label>
                  <input
                    type="text"
                    value={editingMedia.congregation || ""}
                    onChange={(e) =>
                      setEditingMedia({
                        ...editingMedia,
                        congregation: e.target.value,
                      })
                    }
                    placeholder="e.g., Emmanuel Congregation Ahinsan"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingMedia.date || ""}
                    onChange={(e) =>
                      setEditingMedia({ ...editingMedia, date: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                  />
                </div>
                {editingMedia.type === "video" && (
                  <div className="space-y-3">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        YouTube URL (optional)
                      </label>
                      <input
                        type="url"
                        value={editingMedia.youtubeUrl || ""}
                        onChange={(e) =>
                          setEditingMedia({
                            ...editingMedia,
                            youtubeUrl: e.target.value,
                          })
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        TikTok URL (optional)
                      </label>
                      <input
                        type="url"
                        value={editingMedia.tiktokUrl || ""}
                        onChange={(e) =>
                          setEditingMedia({
                            ...editingMedia,
                            tiktokUrl: e.target.value,
                          })
                        }
                        placeholder="https://tiktok.com/@username/video/..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setEditingMedia(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMedia}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Update Media
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-xl max-w-md w-full p-6 border`}
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3
                    className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    Delete Media Item
                  </h3>
                  <p
                    className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Are you sure you want to delete{" "}
                    <strong>"{itemToDelete?.title}"</strong>? This action cannot
                    be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setItemToDelete(null);
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 ${
              toast.type === "error" ? "border-red-500" : "border-green-500"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {toast.type === "error" ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <div className="h-5 w-5 text-green-400">✓</div>
                )}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    toast.type === "error" ? "text-red-800" : "text-green-800"
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className={`inline-flex ${
                    toast.type === "error" ? "text-red-400" : "text-green-400"
                  } hover:opacity-75`}
                  onClick={() =>
                    setToast({ show: false, message: "", type: "success" })
                  }
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaManagement;
