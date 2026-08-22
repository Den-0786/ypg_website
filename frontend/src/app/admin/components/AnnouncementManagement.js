"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Calendar,
  X,
  Check,
  Clock,
  MapPin,
} from "lucide-react";

export default function AnnouncementManagement({ theme }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    venue: "",
    is_anticipated: false,
  });

  const isDark = theme === "dark";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-website.ahinsandistrictypg.com"}/api/announcements/`
        , { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a program title");
      return;
    }

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-website.ahinsandistrictypg.com"}/api/announcements/${editingId}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-website.ahinsandistrictypg.com"}/api/announcements/create/`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          editingId
            ? "Announcement updated successfully"
            : "Announcement created successfully"
        );
        resetForm();
        fetchAnnouncements();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Failed to save announcement");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm font-medium text-navy-950">
              Delete this announcement?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-website.ahinsandistrictypg.com"}/api/announcements/${id}/delete/`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Announcement deleted");
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      date: announcement.date,
      venue: announcement.venue || "",
      is_anticipated: announcement.is_anticipated,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: "", date: "", venue: "", is_anticipated: false });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-navy-950"
            }`}
          >
            Announcements
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-blue-200" : "text-gray-500"
            }`}
          >
            Manage program announcements shown on the main page
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-400 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl border p-6 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-navy-950"
                }`}
              >
                {editingId ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button
                onClick={resetForm}
                className={`p-1 rounded-lg transition-colors ${
                  isDark
                    ? "text-blue-200 hover:bg-white/10"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-blue-200" : "text-gray-700"
                  }`}
                >
                  Program Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. District Youth Conference"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder-blue-300/50 focus:border-gold-500"
                      : "bg-white border-gray-300 text-navy-950 placeholder-gray-400 focus:border-gold-500"
                  } focus:outline-none focus:ring-1 focus:ring-gold-500`}
                />
              </div>

              {/* Date */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-blue-200" : "text-gray-700"
                  }`}
                >
                  Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white focus:border-gold-500"
                      : "bg-white border-gray-300 text-navy-950 focus:border-gold-500"
                  } focus:outline-none focus:ring-1 focus:ring-gold-500`}
                />
              </div>

              {/* Venue */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-blue-200" : "text-gray-700"
                  }`}
                >
                  Venue (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. YPG Hall, Ahinsan District"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white focus:border-gold-500 placeholder-blue-200/30"
                      : "bg-white border-gray-300 text-navy-950 focus:border-gold-500"
                  } focus:outline-none focus:ring-1 focus:ring-gold-500`}
                />
              </div>

              {/* Is Anticipated - Toggle */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-blue-200" : "text-gray-700"
                  }`}
                >
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        is_anticipated: !formData.is_anticipated,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_anticipated ? "bg-gold-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_anticipated ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-blue-100" : "text-gray-700"
                    }`}
                  >
                    {formData.is_anticipated ? "Anticipated" : "Regular"}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-blue-300/60" : "text-gray-400"
                  }`}
                >
                  When turned on, the announcement shows as &quot;Anticipated&quot; on
                  the main page
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-400 transition-colors font-medium text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? "Update" : "Create"}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? "bg-white/10 text-blue-100 hover:bg-white/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div
          className={`text-center py-16 rounded-xl border ${
            isDark
              ? "bg-white/5 border-white/10"
              : "bg-white border-gray-200"
          }`}
        >
          <Megaphone
            className={`w-12 h-12 mx-auto mb-3 ${
              isDark ? "text-blue-300/40" : "text-gray-300"
            }`}
          />
          <p
            className={`text-sm ${
              isDark ? "text-blue-200/60" : "text-gray-500"
            }`}
          >
            No announcements yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark
                  ? "bg-white/5 border-white/10 hover:bg-white/8"
                  : "bg-white border-gray-200 hover:shadow-md"
              } transition-all`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    announcement.is_anticipated
                      ? "bg-gold-500/20 text-gold-400"
                      : isDark
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {announcement.is_anticipated ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Megaphone className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-navy-950"
                    }`}
                  >
                    {announcement.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {announcement.date && (
                      <>
                        <Calendar
                          className={`w-3.5 h-3.5 ${
                            isDark ? "text-blue-300/60" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-blue-200/60" : "text-gray-500"
                          }`}
                        >
                          {formatDate(announcement.date)}
                        </span>
                      </>
                    )}
                    {announcement.venue && (
                      <>
                        <MapPin
                          className={`w-3.5 h-3.5 ${
                            isDark ? "text-blue-300/60" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs truncate max-w-[180px] ${
                            isDark ? "text-blue-200/60" : "text-gray-500"
                          }`}
                        >
                          {announcement.venue}
                        </span>
                      </>
                    )}
                    {announcement.is_anticipated && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-medium">
                        Anticipated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-14 sm:ml-0">
                <button
                  onClick={() => handleEdit(announcement)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "text-blue-200 hover:bg-white/10"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
