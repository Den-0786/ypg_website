"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CommunicationManagement({
  contactMessages,
  setContactMessages,
  theme,
}) {
  const [showAddContactMessage, setShowAddContactMessage] = useState(false);
  const [newContactMessage, setNewContactMessage] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    date: new Date().toISOString().split("T")[0],
    status: "unread",
  });
  const [editingContactMessage, setEditingContactMessage] = useState(null);

  // Validation state
  const [emailError, setEmailError] = useState("");

  // Validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
      return true;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Handle adding a new contact message
  const handleAddContactMessage = (e) => {
    e.preventDefault();

    // Validate email before submitting
    const isEmailValid = validateEmail(newContactMessage.email);
    if (!isEmailValid) {
      return; // Don't submit if validation fails
    }

    const newMessageWithId = {
      ...newContactMessage,
      id: Date.now(), // In a real app, this would come from the server
    };
    setContactMessages((prev) => [...prev, newMessageWithId]);
    setShowAddContactMessage(false);
    setNewContactMessage({
      name: "",
      email: "",
      subject: "",
      message: "",
      date: new Date().toISOString().split("T")[0],
      status: "unread",
    });
    // Clear validation errors
    setEmailError("");
    toast.success("Contact message added successfully!");
  };

  // Handle updating a contact message
  const handleUpdateContactMessage = (e) => {
    e.preventDefault();
    setContactMessages((prev) =>
      prev.map((msg) =>
        msg.id === editingContactMessage.id
          ? { ...newContactMessage, id: editingContactMessage.id }
          : msg
      )
    );
    setShowAddContactMessage(false);
    setNewContactMessage({
      name: "",
      email: "",
      subject: "",
      message: "",
      date: new Date().toISOString().split("T")[0],
      status: "unread",
    });
    setEditingContactMessage(null);
    toast.success("Contact message updated successfully!");
  };

  // Handle deleting a contact message
  const handleDeleteContactMessage = (id) => {
    setContactMessages((prev) => prev.filter((msg) => msg.id !== id));
    toast.success("Contact message deleted successfully!");
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowAddContactMessage(false);
    // Clear validation errors when closing modal
    setEmailError("");
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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {
            setEditingContactMessage(null);
            setNewContactMessage({
              name: "",
              email: "",
              subject: "",
              message: "",
              date: new Date().toISOString().split("T")[0],
              status: "unread",
            });
            // Clear validation errors when opening modal
            setEmailError("");
            setShowAddContactMessage(true);
          }}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Message
        </button>
      </div>

      {/* Add Contact Message Modal */}
      <Transition.Root show={showAddContactMessage} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
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
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border`}
                >
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-semibold leading-6 mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {editingContactMessage ? "Edit Message" : "Add Message"}
                  </Dialog.Title>
                  <p
                    className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {editingContactMessage
                      ? "Update the contact message"
                      : "Create a new contact message"}
                  </p>
                  <form
                    onSubmit={
                      editingContactMessage
                        ? handleUpdateContactMessage
                        : handleAddContactMessage
                    }
                    className="space-y-2.5"
                  >
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"}`}
                        value={newContactMessage.name}
                        onChange={(e) =>
                          setNewContactMessage({
                            ...newContactMessage,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          emailError
                            ? "border-red-500 focus:ring-red-500"
                            : theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                        }`}
                        value={newContactMessage.email}
                        onChange={(e) => {
                          setNewContactMessage({
                            ...newContactMessage,
                            email: e.target.value,
                          });
                          validateEmail(e.target.value);
                        }}
                        onBlur={(e) => validateEmail(e.target.value)}
                      />
                      {emailError && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {emailError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"}`}
                        value={newContactMessage.subject}
                        onChange={(e) =>
                          setNewContactMessage({
                            ...newContactMessage,
                            subject: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Message
                      </label>
                      <textarea
                        required
                        className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"}`}
                        rows={3}
                        value={newContactMessage.message}
                        onChange={(e) =>
                          setNewContactMessage({
                            ...newContactMessage,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}
                        value={newContactMessage.date}
                        onChange={(e) =>
                          setNewContactMessage({
                            ...newContactMessage,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Status
                      </label>
                      <select
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-700"}`}
                        value={newContactMessage.status}
                        onChange={(e) =>
                          setNewContactMessage({
                            ...newContactMessage,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        onClick={() => setShowAddContactMessage(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm"
                      >
                        {editingContactMessage ? "Update" : "Add"} Message
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Contact Messages Table */}
      <div
        className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-sm border overflow-hidden`}
      >
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
              {contactMessages.map((message) => (
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
                      className={`mr-3 transition-colors ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"}`}
                      onClick={() => {
                        setEditingContactMessage(message);
                        setNewContactMessage({
                          name: message.name,
                          email: message.email,
                          subject: message.subject,
                          message: message.message,
                          date: message.date,
                          status: message.status,
                        });
                        setShowAddContactMessage(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className={`transition-colors ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}
                      onClick={() => handleDeleteContactMessage(message.id)}
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
  );
}
