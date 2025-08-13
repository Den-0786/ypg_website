import { useState } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Archive,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const EventsManagement = ({ events = [], setEvents, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeletedEvents, setShowDeletedEvents] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    location: "",
    image: null,
  });

  // Filter events based on showDeletedEvents toggle and dashboard_deleted status
  const filteredEvents = showDeletedEvents
    ? events
    : events.filter((event) => !event.dashboard_deleted);

  const handleAddEvent = async () => {
    const formData = new FormData();
    formData.append("title", newEvent.title);
    formData.append("description", newEvent.description);
    formData.append("start_date", newEvent.start_date);
    formData.append("start_time", newEvent.start_time);
    formData.append("end_date", newEvent.end_date);
    formData.append("end_time", newEvent.end_time);
    formData.append("location", newEvent.location);
    if (newEvent.image) {
      formData.append("image", newEvent.image);
    }

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const addedEvent = await response.json();
        setEvents([...events, addedEvent]);
        setShowAddModal(false);
        setNewEvent({
          title: "",
          description: "",
          start_date: "",
          start_time: "",
          end_date: "",
          end_time: "",
          location: "",
          image: null,
        });
        toast.success("Event added successfully!");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event. Please try again.");
    }
  };

  const handleUpdateEvent = async () => {
    const formData = new FormData();
    formData.append("title", editingEvent.title);
    formData.append("description", editingEvent.description);
    formData.append("start_date", editingEvent.start_date);
    formData.append("start_time", editingEvent.start_time);
    formData.append("end_date", editingEvent.end_date);
    formData.append("end_time", editingEvent.end_time);
    formData.append("location", editingEvent.location);
    if (editingEvent.image) {
      formData.append("image", editingEvent.image);
    }

    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(
          events.map((event) =>
            event.id === editingEvent.id ? updatedEvent : event
          )
        );
        setEditingEvent(null);
        toast.success("Event updated successfully!");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleDeleteEvent = async (deleteType) => {
    if (!eventToDelete) return;

    try {
      const response = await fetch(
        `/api/events?id=${eventToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          // Remove from both dashboard and main website
          setEvents(events.filter((event) => event.id !== eventToDelete.id));
          toast.success("Event permanently deleted!");
        } else {
          // Hide from dashboard only (soft delete)
          setEvents(
            events.map((event) =>
              event.id === eventToDelete.id
                ? { ...event, dashboard_deleted: true }
                : event
            )
          );
          toast.success("Event removed from dashboard!");
        }
        setShowDeleteModal(false);
        setEventToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    }
  };

  const handleRestoreEvent = async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active" }),
      });

      if (response.ok) {
        setEvents(
          events.map((event) =>
            event.id === id ? { ...event, status: "active" } : event
          )
        );
        toast.success("Event restored successfully!");
      }
    } catch (error) {
      console.error("Error restoring event:", error);
      toast.error("Failed to restore event. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Events Management
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDeletedEvents(!showDeletedEvents)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            {showDeletedEvents ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Deleted</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Show Deleted</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden ${
              event.status === "deleted" ? "opacity-60" : ""
            }`}
          >
            <div
              className={`h-48 ${theme === "dark" ? "bg-gradient-to-r from-blue-600 to-purple-700" : "bg-gradient-to-r from-blue-500 to-purple-600"} flex items-center justify-center relative`}
            >
              <Calendar className="w-12 h-12 text-white" />
              {event.status === "deleted" && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Deleted
                </div>
              )}
              {event.type === "past" && event.status !== "deleted" && (
                <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Past
                </div>
              )}
            </div>
            <div className="p-6">
              <h3
                className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
              >
                {event.title}
              </h3>
              <p
                className={`text-sm mb-3 line-clamp-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                {event.description}
              </p>
              <div
                className={`space-y-1 text-xs mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              >
                <p>
                  📅 {event.start_date}
                  {event.end_date && event.end_date !== event.start_date
                    ? ` - ${event.end_date}`
                    : ""}
                </p>
                <p>
                  🕒 {event.start_time}
                  {event.end_time ? ` - ${event.end_time}` : ""}
                </p>
                <p>📍 {event.location}</p>
                <p
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.type === "upcoming"
                      ? theme === "dark"
                        ? "bg-blue-900/30 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.type}
                </p>
              </div>
              <div className="flex space-x-2">
                {event.status !== "deleted" ? (
                  <>
                    <button
                      onClick={() => setEditingEvent(event)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(event)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-red-900/30 text-red-300 hover:bg-red-800/40" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestoreEvent(event.id)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${theme === "dark" ? "bg-green-900/30 text-green-300 hover:bg-green-800/40" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                  >
                    <Archive className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`${theme === "dark" ? "bg-gray-800/95 border-gray-600" : "bg-white/95 border-gray-200"} rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] border backdrop-blur-sm overflow-hidden`}
            >
              {/* Header with gradient */}
              <div
                className={`relative p-6 pb-4 ${theme === "dark" ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20" : "bg-gradient-to-r from-purple-50 to-blue-50"} rounded-t-3xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-purple-500/20" : "bg-purple-100"}`}
                    >
                      <Calendar
                        className={`w-5 h-5 ${theme === "dark" ? "text-purple-300" : "text-purple-600"}`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                      >
                        Create New Event
                      </h3>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Add a beautiful event to your calendar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className={`p-2 rounded-full transition-all duration-200 ${theme === "dark" ? "hover:bg-gray-700/50 text-gray-300 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Event Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title..."
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 hover:border-purple-300"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Description</span>
                  </label>
                  <textarea
                    placeholder="Tell us about your event..."
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    rows={2}
                    className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200 resize-none ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 hover:border-blue-300"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Start Date & Time</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={newEvent.start_date}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            start_date: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-3 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all duration-200 ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900 hover:border-green-300"}`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Calendar
                          className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="time"
                        value={newEvent.start_time}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            start_time: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-3 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all duration-200 ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900 hover:border-green-300"}`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg
                          className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span>End Date</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newEvent.end_date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, end_date: e.target.value })
                        }
                        className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all duration-200 ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900 hover:border-orange-300"}`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Calendar
                          className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span>End Time</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={newEvent.end_time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, end_time: e.target.value })
                        }
                        className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all duration-200 ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900 hover:border-orange-300"}`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg
                          className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    <span>Location</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Where is the event taking place?"
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, location: e.target.value })
                      }
                      className={`w-full px-3 py-2.5 pl-10 border-2 rounded-lg focus:ring-3 focus:ring-pink-500/20 focus:border-pink-500 text-sm transition-all duration-200 ${theme === "dark" ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 hover:border-pink-300"}`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>Event Image</span>
                  </label>
                  <div className="flex gap-3">
                    {/* Image Preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 ${theme === "dark" ? "bg-gray-700/30 border-gray-600 hover:border-indigo-500" : "bg-gray-50 border-gray-300 hover:border-indigo-400"}`}
                    >
                      {newEvent.image ? (
                        <div className="text-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${theme === "dark" ? "bg-green-500/20" : "bg-green-100"}`}
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
                            className={`text-xs font-medium truncate px-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                          >
                            {newEvent.image.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
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

                    {/* Upload Button */}
                    <label
                      className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${theme === "dark" ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"}`}
                    >
                      <svg
                        className="w-3 h-3"
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
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            image: e.target.files[0],
                          })
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Event</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {editingEvent && (
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
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-sm w-full p-6 border`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Edit Event
                </h3>
                <button
                  onClick={() => setEditingEvent(null)}
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Description
                  </label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={editingEvent.start_date}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          start_date: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editingEvent.end_time}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          start_time: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editingEvent.end_date}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          end_date: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      value={editingEvent.start_time}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          end_time: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
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
                      {editingEvent.image ? (
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
                            {editingEvent.image.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className={`w-4 h-4 mx-auto mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
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
                        <svg
                          className={`w-4 h-4 mb-1 ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`}
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
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              image: e.target.files[0],
                            })
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-5">
                <button
                  onClick={() => setEditingEvent(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEvent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Update Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && eventToDelete && (
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
                    setEventToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>"{eventToDelete.title}"</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteEvent("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Event will be hidden from admin but remain on main website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteEvent("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Event will be permanently deleted from dashboard and main
                    website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEventToDelete(null);
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

export default EventsManagement;
