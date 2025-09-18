import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Users,
  MapPin,
  Phone,
  Mail,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";
import { branchPresidentAPI } from "../../../utils/api";

export default function BranchPresidentsManagement({ theme }) {
  const [presidents, setPresidents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPresident, setEditingPresident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    congregation: "",
    location: "",
    phone: "",
    email: "",
    position: "Branch President",
    is_active: true,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [presidentToDelete, setPresidentToDelete] = useState(null);

  // Auto-capitalize function for form inputs
  const capitalizeWords = (text) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Handle input change with auto-capitalization
  const handleInputChange = (field, value) => {
    if (
      field === "name" ||
      field === "congregation" ||
      field === "location" ||
      field === "position"
    ) {
      setFormData({ ...formData, [field]: capitalizeWords(value) });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  useEffect(() => {
    fetchPresidents();
  }, []);

  const fetchPresidents = async () => {
    try {
      setIsLoading(true);
      const data = await branchPresidentAPI.getAdminPresidents();
      setPresidents(data || []);
    } catch (error) {
      console.error("Error fetching presidents:", error);
      setPresidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      congregation: "",
      location: "",
      phone: "",
      email: "",
      position: "Branch President",
      is_active: true,
    });
    setEditingPresident(null);
  };

  const openModal = (president = null) => {
    if (president) {
      setEditingPresident(president);
      setFormData({
        name: president.name,
        congregation: president.congregation,
        location: president.location || "",
        phone: president.phone,
        email: president.email,
        position: president.position || "Branch President",
        is_active: president.is_active,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPresident) {
        await branchPresidentAPI.updatePresident(editingPresident.id, formData);
      } else {
        await branchPresidentAPI.createPresident(formData);
      }
      await fetchPresidents();
      closeModal();
    } catch (error) {
      console.error("Error saving president:", error);
    }
  };

  const handleDeleteClick = (president) => {
    setPresidentToDelete(president);
    setShowDeleteModal(true);
  };

  const handleDeletePresident = async () => {
    try {
      await branchPresidentAPI.deletePresident(presidentToDelete.id);
      await fetchPresidents();
      setShowDeleteModal(false);
      setPresidentToDelete(null);
    } catch (error) {
      console.error("Error deleting president:", error);
    }
  };

  const toggleActiveStatus = async (president) => {
    try {
      await branchPresidentAPI.updatePresident(president.id, {
        ...president,
        is_active: !president.is_active,
      });
      await fetchPresidents();
    } catch (error) {
      console.error("Error updating president status:", error);
    }
  };

  const stats = [
    {
      name: "Total Presidents",
      value: presidents.length,
      icon: UserCheck,
      color: "text-blue-600",
    },
    {
      name: "Active Presidents",
      value: presidents.filter((p) => p.is_active).length,
      icon: Users,
      color: "text-green-600",
    },
    {
      name: "Inactive Presidents",
      value: presidents.filter((p) => !p.is_active).length,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1
            className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Branch Presidents Management
          </h1>
          <p
            className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage branch president information and contact details
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New President
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg shadow p-6 border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {stat.name}
                </p>
                <p
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Presidents List */}
      <div
        className={`rounded-lg shadow overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`px-6 py-4 border-b ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Branch Presidents
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table
            className={`min-w-full divide-y ${
              theme === "dark" ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Name
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Congregation
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Location
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Contact
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Email
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === "dark"
                  ? "bg-gray-800 divide-gray-700"
                  : "bg-white divide-gray-200"
              }`}
            >
              {presidents.map((president, index) => (
                <motion.tr
                  key={president.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {president.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {president.congregation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {president.location || "Not specified"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <a
                        href={`tel:${president.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {president.phone}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <a
                        href={`mailto:${president.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {president.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        president.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {president.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal(president)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActiveStatus(president)}
                        className={`p-1 rounded ${
                          president.is_active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {president.is_active ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(president)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-3xl shadow-2xl border p-8 w-full max-w-lg mx-4 relative overflow-hidden`}
          >
            {/* Decorative gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${theme === "dark" ? "from-blue-900/20 to-purple-900/20" : "from-blue-50 to-purple-50"} opacity-50`}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-2xl ${theme === "dark" ? "bg-blue-600/20" : "bg-blue-100"}`}
                  >
                    <UserCheck
                      className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      {editingPresident
                        ? "Edit President"
                        : "Add New President"}
                    </h3>
                    <p
                      className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"} mt-1`}
                    >
                      {editingPresident
                        ? "Update president information"
                        : "Add a new branch president to the system"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-lg transition-all duration-200 ${theme === "dark" ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <label
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-1`}
                    >
                      President Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      placeholder="Enter president's full name"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-1`}
                    >
                      Congregation Name
                    </label>
                    <input
                      type="text"
                      value={formData.congregation}
                      onChange={(e) =>
                        handleInputChange("congregation", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      placeholder="Enter congregation name"
                      required
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-1`}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      placeholder="Enter location"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-1`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      placeholder="Enter phone number"
                      required
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-1`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                    placeholder="Enter email address"
                    required
                  />
                </motion.div>

                {/* Active/Inactive Status */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <label
                    className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-2`}
                  >
                    Status
                  </label>
                  <div className="flex space-x-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="active"
                        name="status"
                        value="active"
                        checked={formData.is_active === true}
                        onChange={() =>
                          setFormData({ ...formData, is_active: true })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="active"
                        className={`ml-2 text-sm font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Active
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="inactive"
                        name="status"
                        value="inactive"
                        checked={formData.is_active === false}
                        onChange={() =>
                          setFormData({ ...formData, is_active: false })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="inactive"
                        className={`ml-2 text-sm font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Inactive
                      </label>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3 pt-4"
                >
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {editingPresident ? "Update President" : "Create President"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${theme === "dark" ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
                  >
                    Cancel
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4`}
          >
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3
                className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-2`}
              >
                Delete President
              </h3>
              <p
                className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-6`}
              >
                Are you sure you want to delete &quot;
                {presidentToDelete?.name}&quot; from &quot;
                {presidentToDelete?.congregation}&quot;? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeletePresident}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${theme === "dark" ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-700"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
