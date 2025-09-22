/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  BookOpen,
  Calendar,
  Image,
  Video,
  AlertTriangle,
  X,
} from "lucide-react";

export default function ContentManagement({
  activeContentTab,
  events,
  media,
  blogPosts,
  setEvents,
  setMedia,
  setBlogPosts,
  theme,
}) {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("blog"); // 'blog', 'event', 'media'

  const [newEvent, setNewEvent] = useState({
    title: "",
    venue: "",
    image: "",
    startDate: "",
    endDate: "",
    description: "",
    type: "upcoming",
  });

  const [newMedia, setNewMedia] = useState({
    type: "image",
    url: "",
    title: "",
    description: "",
  });

  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    image: null,
  });

  // Add Event handler
  const handleAddEvent = (e) => {
    e.preventDefault();
    setEvents([
      ...events,
      {
        id: Date.now(),
        ...newEvent,
        attendees: 0,
        status: "active",
      },
    ]);
    setShowAddEvent(false);
    setNewEvent({
      title: "",
      venue: "",
      image: "",
      startDate: "",
      endDate: "",
      description: "",
      type: "upcoming",
    });
  };

  const handleAddMedia = (e) => {
    e.preventDefault();
    setMedia([
      ...media,
      {
        id: Date.now(),
        ...newMedia,
      },
    ]);
    setShowAddMedia(false);
    setNewMedia({ type: "image", url: "", title: "", description: "" });
  };

  // Helper to format date as 'Month Day, Year'
  function getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const handleAddBlog = (e) => {
    e.preventDefault();
    setBlogPosts((prev) => {
      const updated = prev.length >= 10 ? prev.slice(1) : prev;
      return [
        ...updated,
        {
          id: Date.now(),
          ...newBlog,
          date: newBlog.date || getFormattedDate(),
        },
      ];
    });
    setShowAddBlog(false);
    setNewBlog({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      image: null,
    });
  };

  if (activeContentTab === "events") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Events Management
          </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddEvent(true)}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Event
          </button>
        </div>
        {/* Add Event Modal */}
        <Transition.Root show={showAddEvent} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setShowAddEvent}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
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
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 mb-4"
                    >
                      Add Upcoming Event
                    </Dialog.Title>
                    <form onSubmit={handleAddEvent} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Venue (Congregation/Location)
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newEvent.venue}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, venue: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Browse Media
                        </label>
                        <div className="flex items-center gap-2">
                          {/* Left: Icon + Preview or No file chosen */}
                          <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                            <ImageIcon className="w-4 h-4 text-blue-400" />
                            {newEvent.image ? (
                              <span>
                                {typeof newEvent.image === "string"
                                  ? newEvent.image
                                  : newEvent.image.name}
                              </span>
                            ) : (
                              <span>No file chosen</span>
                            )}
                          </div>
                          {/* Right: Browse/Upload button */}
                          <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              required
                              className="hidden"
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  image: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                            value={newEvent.startDate}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                            value={newEvent.endDate}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          rows={3}
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <input type="hidden" value="upcoming" />
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => setShowAddEvent(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          Add Event
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.type === "upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.attendees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeContentTab === "media") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Media Management
          </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddMedia(true)}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Add Media
          </button>
        </div>
        {/* Add Media Modal */}
        <Transition.Root show={showAddMedia} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setShowAddMedia}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
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
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 mb-4"
                    >
                      Add Media
                    </Dialog.Title>
                    <form onSubmit={handleAddMedia} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Media Type
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newMedia.type}
                          onChange={(e) =>
                            setNewMedia({ ...newMedia, type: e.target.value })
                          }
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Browse Media
                        </label>
                        <div className="flex items-center gap-2">
                          {/* Left: Icon + Preview or No file chosen */}
                          <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                            {newMedia.type === "image" ? (
                              <ImageIcon className="w-4 h-4 text-blue-400" />
                            ) : (
                              <VideoIcon className="w-4 h-4 text-blue-400" />
                            )}
                            {newMedia.file ? (
                              <span>
                                {typeof newMedia.file === "string"
                                  ? newMedia.file
                                  : newMedia.file.name}
                              </span>
                            ) : (
                              <span>No file chosen</span>
                            )}
                          </div>
                          {/* Right: Browse/Upload button */}
                          <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                            Upload
                            <input
                              type="file"
                              accept={
                                newMedia.type === "image"
                                  ? "image/*"
                                  : "video/*"
                              }
                              required
                              className="hidden"
                              onChange={(e) =>
                                setNewMedia({
                                  ...newMedia,
                                  file: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title/Caption
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newMedia.title}
                          onChange={(e) =>
                            setNewMedia({ ...newMedia, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brief Description (include location/congregation)
                        </label>
                        <textarea
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          rows={2}
                          value={newMedia.description}
                          onChange={(e) =>
                            setNewMedia({
                              ...newMedia,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => setShowAddMedia(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          Add Media
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Cards: grid for md+, horizontal scroll for small screens */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden`}
            >
              <div className="aspect-video relative overflow-hidden">
                {item.image ? (
                  <img
                    src={`http://localhost:8002${item.image}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center`}
                  >
                    {item.category === "video" ? (
                      <Video
                        className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                      />
                    ) : (
                      <Image
                        className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3
                  className={`font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {item.category}
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
                    className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="md:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="min-w-[260px] bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden flex-shrink-0"
            >
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {item.type === "video" ? (
                  <Video className="w-12 h-12 text-gray-400" />
                ) : (
                  <Image className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{item.type}</p>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (activeContentTab === "blog") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddBlog(true)}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Add Blog Post
          </button>
        </div>
        {/* Add Blog Modal */}
        <Transition.Root show={showAddBlog} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setShowAddBlog}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
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
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 mb-4"
                    >
                      Add Blog Post
                    </Dialog.Title>
                    <form onSubmit={handleAddBlog} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newBlog.title}
                          onChange={(e) =>
                            setNewBlog({ ...newBlog, title: e.target.value })
                          }
                          placeholder="Enter blog post title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Excerpt *
                        </label>
                        <textarea
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          rows={3}
                          value={newBlog.excerpt}
                          onChange={(e) =>
                            setNewBlog({ ...newBlog, excerpt: e.target.value })
                          }
                          placeholder="Enter a short excerpt for the blog post"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Content
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          rows={4}
                          value={newBlog.content}
                          onChange={(e) =>
                            setNewBlog({ ...newBlog, content: e.target.value })
                          }
                          placeholder="Enter the full content of the blog post (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Author
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                            value={newBlog.author}
                            onChange={(e) =>
                              setNewBlog({ ...newBlog, author: e.target.value })
                            }
                            placeholder="Enter author name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                            value={newBlog.category}
                            onChange={(e) =>
                              setNewBlog({
                                ...newBlog,
                                category: e.target.value,
                              })
                            }
                          >
                            <option value="">Select a category</option>
                            <option value="Events">Events</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Service">Service</option>
                            <option value="Training">Training</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Fellowship">Fellowship</option>
                            <option value="Missions">Missions</option>
                            <option value="Prayer">Prayer</option>
                            <option value="Worship">Worship</option>
                            <option value="Announcements">Announcements</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                          value={newBlog.date}
                          onChange={(e) =>
                            setNewBlog({ ...newBlog, date: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image (optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                            <ImageIcon className="w-4 h-4 text-blue-400" />
                            {newBlog.image ? (
                              <span>
                                {typeof newBlog.image === "string"
                                  ? newBlog.image
                                  : newBlog.image.name}
                              </span>
                            ) : (
                              <span>No file chosen</span>
                            )}
                          </div>
                          <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setNewBlog({
                                  ...newBlog,
                                  image: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => setShowAddBlog(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          Add Blog Post
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Blog post list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md border p-4 flex gap-4 items-start"
            >
              {post.image && (
                <img
                  src={
                    typeof post.image === "string"
                      ? post.image
                      : URL.createObjectURL(post.image)
                  }
                  alt="Blog"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{post.date}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 text-base">
                  {post.title}
                </h4>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {post.excerpt || post.description}
                </p>
                {post.author && (
                  <p className="text-xs text-gray-500 mt-1">By {post.author}</p>
                )}
              </div>
            </div>
          ))}
          {blogPosts.length === 0 && (
            <div className="text-gray-400 text-center col-span-full">
              No blog posts yet.
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Delete handlers
  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteItem = (deleteType) => {
    if (!itemToDelete) return;

    if (deleteType === "dashboard") {
      // Soft delete - hide from dashboard only
      if (deleteType === "blog") {
        setBlogPosts(
          blogPosts.map((post) =>
            post.id === itemToDelete.id
              ? { ...post, dashboard_deleted: true }
              : post
          )
        );
      } else if (deleteType === "event") {
        setEvents(
          events.map((event) =>
            event.id === itemToDelete.id
              ? { ...event, dashboard_deleted: true }
              : event
          )
        );
      } else if (deleteType === "media") {
        setMedia(
          media.map((item) =>
            item.id === itemToDelete.id
              ? { ...item, dashboard_deleted: true }
              : item
          )
        );
      }
    } else {
      // Hard delete - remove completely
      if (deleteType === "blog") {
        setBlogPosts(blogPosts.filter((post) => post.id !== itemToDelete.id));
      } else if (deleteType === "event") {
        setEvents(events.filter((event) => event.id !== itemToDelete.id));
      } else if (deleteType === "media") {
        setMedia(media.filter((item) => item.id !== itemToDelete.id));
      }
    }

    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Filter out soft-deleted items
  const visibleBlogPosts = blogPosts.filter((post) => !post.dashboard_deleted);
  const visibleEvents = events.filter((event) => !event.dashboard_deleted);
  const visibleMedia = media.filter((item) => !item.dashboard_deleted);

  return (
    <>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && itemToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                    setItemToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>
                    &quot;{itemToDelete.title || itemToDelete.name}&quot;
                  </strong>
                  ?
                </p>
                <p className="text-sm text-gray-500">
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteItem("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Item will be hidden from admin but remain on main website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteItem("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Item will be permanently deleted from dashboard and main
                    website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
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

      {/* Render content based on active tab */}
      {activeContentTab === "events" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Events Management
            </h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddEvent(true)}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Event
            </button>
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visibleEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.type === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.attendees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(event, "event")}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeContentTab === "media" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Media Management
            </h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddMedia(true)}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Add Media
            </button>
          </div>

          {/* Media Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  {item.type === "video" ? (
                    <Video className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{item.type}</p>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item, "media")}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeContentTab === "blog" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddBlog(true)}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Add Blog Post
            </button>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleBlogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-md border p-4 flex gap-4 items-start"
              >
                {post.image && (
                  <img
                    src={
                      typeof post.image === "string"
                        ? post.image
                        : URL.createObjectURL(post.image)
                    }
                    alt="Blog"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{post.date}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 text-base">
                    {post.title}
                  </h4>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {post.excerpt || post.description}
                  </p>
                  {post.author && (
                    <p className="text-xs text-gray-500 mt-1">
                      By {post.author}
                    </p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post, "blog")}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {visibleBlogPosts.length === 0 && (
              <div className="text-gray-400 text-center col-span-full">
                No blog posts yet.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeContentTab === null && null}
    </>
  );
}
