import { useState } from "react";
import {
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const TestimonialsManagement = ({
  testimonials = [],
  setTestimonials,
  theme,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    quote: "",
    highlight: "",
    rating: 5,
    image: null,
  });

  const handleAddTestimonial = async () => {
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTestimonial),
      });

      if (response.ok) {
        const addedTestimonial = await response.json();
        setTestimonials([...testimonials, addedTestimonial]);
        setShowAddModal(false);
        setNewTestimonial({
          name: "",
          role: "",
          quote: "",
          highlight: "",
          rating: 5,
          image: null,
        });
        toast.success("Testimonial added successfully!");
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
      toast.error("Failed to add testimonial. Please try again.");
    }
  };

  const handleUpdateTestimonial = async () => {
    try {
      const response = await fetch(
        `/api/testimonials/${editingTestimonial.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingTestimonial),
        }
      );

      if (response.ok) {
        const updatedTestimonial = await response.json();
        setTestimonials(
          testimonials.map((testimonial) =>
            testimonial.id === editingTestimonial.id
              ? updatedTestimonial
              : testimonial
          )
        );
        setEditingTestimonial(null);
        toast.success("Testimonial updated successfully!");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Failed to update testimonial. Please try again.");
    }
  };

  const handleDeleteClick = (testimonial) => {
    setTestimonialToDelete(testimonial);
    setShowDeleteModal(true);
  };

  const handleDeleteTestimonial = async (deleteType) => {
    if (!testimonialToDelete) return;

    try {
      const response = await fetch(
        `/api/testimonials?id=${testimonialToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          // Remove from both dashboard and main website
          setTestimonials(
            testimonials.filter(
              (testimonial) => testimonial.id !== testimonialToDelete.id
            )
          );
          toast.success("Testimonial permanently deleted!");
        } else {
          // Hide from dashboard only (soft delete)
          setTestimonials(
            testimonials.map((testimonial) =>
              testimonial.id === testimonialToDelete.id
                ? { ...testimonial, dashboard_deleted: true }
                : testimonial
            )
          );
          toast.success("Testimonial removed from dashboard!");
        }
        setShowDeleteModal(false);
        setTestimonialToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Testimonials Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden`}
          >
            <div
              className={`h-48 ${theme === "dark" ? "bg-gradient-to-r from-green-600 to-emerald-700" : "bg-gradient-to-r from-green-500 to-emerald-600"} flex items-center justify-center`}
            >
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <div className="p-6">
              <h3
                className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
              >
                {testimonial.name}
              </h3>
              <p
                className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                {testimonial.role}
              </p>
              <p
                className={`text-sm mb-4 line-clamp-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                {testimonial.content}
              </p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < testimonial.rating
                          ? "text-yellow-400"
                          : theme === "dark"
                            ? "text-gray-600"
                            : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span
                  className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {testimonial.rating}/5
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTestimonial(testimonial)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(testimonial)}
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

      {/* Add Testimonial Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                  >
                    Add Testimonial
                  </h3>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Share a beautiful testimony
                  </p>
                </div>
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
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.name}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Role/Congregation *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.role}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        role: e.target.value,
                      })
                    }
                    placeholder="e.g., Youth Leader, Emmanuel Congregation"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Testimonial Quote *
                  </label>
                  <textarea
                    value={newTestimonial.quote}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        quote: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Share your inspiring testimony..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Highlighted Phrase *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.highlight}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        highlight: e.target.value,
                      })
                    }
                    placeholder="A key phrase to highlight"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Rating
                  </label>
                  <select
                    value={newTestimonial.rating}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Profile Image (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center text-xs min-w-[100px] max-w-[120px] truncate gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      <MessageCircle
                        className={`w-3 h-3 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                      />
                      {newTestimonial.image ? (
                        <span>
                          {typeof newTestimonial.image === "string"
                            ? newTestimonial.image
                            : newTestimonial.image.name}
                        </span>
                      ) : (
                        <span>No file chosen</span>
                      )}
                    </div>
                    <label
                      className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer text-xs border transition-colors ${theme === "dark" ? "bg-blue-900/30 text-blue-400 hover:bg-blue-800/40 border-blue-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"}`}
                    >
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            image: e.target.files[0],
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors font-medium text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTestimonial}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                >
                  Add Testimonial
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Testimonial Modal */}
      <AnimatePresence>
        {editingTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                  >
                    Edit Testimonial
                  </h3>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Update the testimony
                  </p>
                </div>
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className={`p-1 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.name}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Role/Congregation *
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.role}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        role: e.target.value,
                      })
                    }
                    placeholder="e.g., Youth Leader, Emmanuel Congregation"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Testimonial Quote *
                  </label>
                  <textarea
                    value={editingTestimonial.quote}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        quote: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Share your inspiring testimony..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Highlighted Phrase *
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.highlight}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        highlight: e.target.value,
                      })
                    }
                    placeholder="A key phrase to highlight"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Rating
                  </label>
                  <select
                    value={editingTestimonial.rating}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Profile Image (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center text-xs min-w-[100px] max-w-[120px] truncate gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      <MessageCircle
                        className={`w-3 h-3 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
                      />
                      {editingTestimonial.image ? (
                        <span>
                          {typeof editingTestimonial.image === "string"
                            ? editingTestimonial.image
                            : editingTestimonial.image.name}
                        </span>
                      ) : (
                        <span>No file chosen</span>
                      )}
                    </div>
                    <label
                      className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer text-xs border transition-colors ${theme === "dark" ? "bg-blue-900/30 text-blue-400 hover:bg-blue-800/40 border-blue-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"}`}
                    >
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            image: e.target.files[0],
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors font-medium text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTestimonial}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                >
                  Update Testimonial
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && testimonialToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTestimonialToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>&ldquo;{testimonialToDelete.name}&rdquo;</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteTestimonial("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Testimonial will be hidden from admin but remain on main
                    website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteTestimonial("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Testimonial will be permanently deleted from dashboard and
                    main website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTestimonialToDelete(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialsManagement;
