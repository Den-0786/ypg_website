"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Trash2, MessageSquare, X, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function CommunicationManagement({
  contactMessages,
  setContactMessages,
  theme,
}) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unread messages
  const unreadMessages = contactMessages.filter(
    (msg) => msg.status === "unread"
  );
  const displayMessages = showUnreadOnly ? unreadMessages : contactMessages;

  // Handle viewing a message (automatically mark as read)
  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    // If message is unread, mark it as read
    if (message.status === "unread") {
      try {
        // Update local state immediately
        setContactMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, status: "read" } : msg
          )
        );

        // Call API to update on server
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contact/${message.id}/read/`;
        console.log("Marking message as read with URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Revert local state if API call fails
          setContactMessages((prev) =>
            prev.map((msg) =>
              msg.id === message.id ? { ...msg, status: "unread" } : msg
            )
          );
          toast.error("Failed to mark message as read");
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
        // Revert local state if API call fails
        setContactMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, status: "unread" } : msg
          )
        );
        toast.error("Failed to mark message as read");
      }
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!messageToDelete || isDeleting) return;

    setIsDeleting(true);
    console.log("Deleting message:", messageToDelete.id);

    try {
      // Call API to delete on server
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/contact/${messageToDelete.id}/delete/`;
      console.log("Deleting message with URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        console.error("Delete failed with status:", response.status);
        toast.error("Failed to delete message");
        return;
      }

      // Update local state
      setContactMessages((prev) =>
        prev.filter((msg) => msg.id !== messageToDelete.id)
      );
      toast.success("Contact message deleted successfully!");

      // Close modals
      setShowDeleteModal(false);
      setShowMessageModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2
          className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Contact Messages
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {contactMessages.length} message
            {contactMessages.length !== 1 ? "s" : ""}
          </div>
          {unreadMessages.length > 0 && (
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                showUnreadOnly
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {showUnreadOnly
                ? "Show All"
                : `Show Unread (${unreadMessages.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Unread Messages Card */}
      {unreadMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border border-dashed p-3 ${
            theme === "dark"
              ? "border-orange-400/40 bg-orange-900/20"
              : "border-orange-300 bg-orange-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-full ${
                  theme === "dark" ? "bg-orange-900/40" : "bg-orange-100"
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-orange-400" : "text-orange-600"
                  }`}
                />
              </div>
              <div>
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {unreadMessages.length} unread message
                  {unreadMessages.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {showUnreadOnly ? "Show All" : "View"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Contact Messages Table */}
      <div
        className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border overflow-hidden`}
      >
        {/* Table Header with Filter Status */}
        {showUnreadOnly && (
          <div
            className={`px-4 py-3 border-b ${
              theme === "dark"
                ? "border-gray-700 bg-gray-700/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    theme === "dark" ? "bg-orange-400" : "bg-orange-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Showing unread messages only
                </span>
              </div>
              <button
                onClick={() => setShowUnreadOnly(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-500 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                ← Back to All Messages
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Name
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Email
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Subject
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Date
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`${theme === "dark" ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"} divide-y`}
            >
              {displayMessages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <MessageSquare
                          className={`w-6 h-6 ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {showUnreadOnly
                            ? "No unread messages"
                            : "No messages"}
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {showUnreadOnly
                            ? "All messages have been read"
                            : "No contact messages yet"}
                        </p>
                      </div>
                      {showUnreadOnly && (
                        <button
                          onClick={() => setShowUnreadOnly(false)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === "dark"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          ← View All Messages
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayMessages.map((message) => (
                  <tr
                    key={message.id}
                    className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      {message.name}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {message.email}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {message.subject}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {new Date(message.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          message.status === "unread"
                            ? theme === "dark"
                              ? "bg-red-900/30 text-red-300"
                              : "bg-red-100 text-red-800"
                            : message.status === "read"
                              ? theme === "dark"
                                ? "bg-green-900/30 text-green-300"
                                : "bg-green-100 text-green-800"
                              : theme === "dark"
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className={`mr-3 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          message.status === "unread"
                            ? theme === "dark"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                            : theme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700 text-gray-300"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        onClick={() => handleViewMessage(message)}
                        title="View full message"
                      >
                        {message.status === "unread" ? "Read" : "View"}
                      </button>
                      <button
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        onClick={() => handleDeleteClick(message)}
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Viewing Modal */}
      <Transition.Root show={showMessageModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowMessageModal(false)}
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
                  className={`w-full max-w-2xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  {selectedMessage && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              theme === "dark"
                                ? "bg-blue-900/30"
                                : "bg-blue-100"
                            }`}
                          >
                            <Mail
                              className={`w-5 h-5 ${
                                theme === "dark"
                                  ? "text-blue-400"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div>
                            <Dialog.Title
                              as="h3"
                              className={`text-lg font-semibold ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {selectedMessage.subject}
                            </Dialog.Title>
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              From: {selectedMessage.name} (
                              {selectedMessage.email})
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowMessageModal(false)}
                          className={`p-2 rounded-full transition-colors ${
                            theme === "dark"
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <X
                            className={`w-5 h-5 ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>

                      <div
                        className={`rounded-lg p-4 ${
                          theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <h4
                          className={`font-medium mb-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Message:
                        </h4>
                        <p
                          className={`whitespace-pre-wrap ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {selectedMessage.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Received:{" "}
                          {new Date(selectedMessage.date).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(selectedMessage.date).toLocaleTimeString()}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowMessageModal(false)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              theme === "dark"
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Close
                          </button>
                          <button
                            onClick={() => {
                              setShowMessageModal(false);
                              setMessageToDelete(selectedMessage);
                              setShowDeleteModal(true);
                            }}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                          >
                            Delete Message
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
                      className={`p-2 rounded-full ${
                        theme === "dark" ? "bg-red-900/30" : "bg-red-100"
                      }`}
                    >
                      <Trash2
                        className={`w-5 h-5 ${
                          theme === "dark" ? "text-red-400" : "text-red-600"
                        }`}
                      />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Delete Message
                    </Dialog.Title>
                  </div>

                  <p
                    className={`text-sm mb-6 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Are you sure you want to delete this message? This action
                    cannot be undone.
                  </p>

                  {messageToDelete && (
                    <div
                      className={`rounded-lg p-3 mb-6 ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        From: {messageToDelete.name}
                      </p>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Subject: {messageToDelete.subject}
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
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? "Deleting..." : "Delete Message"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </motion.div>
  );
}
