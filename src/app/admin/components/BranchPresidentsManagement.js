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
    congregation: "",
    location: "",
    president_name: "",
    phone_number: "",
    email: "",
    is_active: true,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [presidentToDelete, setPresidentToDelete] = useState(null);

  useEffect(() => {
    fetchPresidents();
  }, []);

  const fetchPresidents = async () => {
    try {
      setIsLoading(true);
      const data = await branchPresidentAPI.getAdminPresidents();
      setPresidents(data);
    } catch (error) {
      console.error("Error fetching presidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      congregation: "",
      location: "",
      president_name: "",
      phone_number: "",
      email: "",
      is_active: true,
    });
    setEditingPresident(null);
  };

  const openModal = (president = null) => {
    if (president) {
      setEditingPresident(president);
      setFormData({
        congregation: president.congregation,
        location: president.location,
        president_name: president.president_name,
        phone_number: president.phone_number,
        email: president.email,
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
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Congregation
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Location
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  President Name
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Contact
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Email
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
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
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {president.congregation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {president.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {president.president_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={`tel:${president.phone_number}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {president.phone_number}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={`mailto:${president.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {president.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        president.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingPresident ? "Edit President" : "Add New President"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Congregation Name
                </label>
                <input
                  type="text"
                  value={formData.congregation}
                  onChange={(e) =>
                    setFormData({ ...formData, congregation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  President Name
                </label>
                <input
                  type="text"
                  value={formData.president_name}
                  onChange={(e) =>
                    setFormData({ ...formData, president_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {editingPresident && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingPresident ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
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
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
          >
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete President
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;
                {presidentToDelete?.president_name}&quot; from &quot;
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
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
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
