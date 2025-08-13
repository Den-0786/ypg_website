"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  User,
  Phone,
  Mail,
  MapPin,
  Award,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function WelfareCommittee() {
  const [committee, setCommittee] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    congregation: "",
    picture: null,
    picturePreview: null,
  });

  // Validation state
  const [errors, setErrors] = useState({});

  const positions = [
    "Chairman",
    "Vice Chairman",
    "Secretary",
    "Treasurer",
    "Financial Secretary",
    "Organizing Secretary",
    "Public Relations Officer",
    "Member",
  ];

  const congregations = [
    "Emmanuel Congregation Ahinsan",
    "Peniel Congregation Esreso No1",
    "Mizpah Congregation Odagya No1",
    "Christ Congregation Ahinsan Estate",
    "Ebenezer Congregation Dompaose Aprabo",
    "Favour Congregation Esreso No2",
    "Liberty Congregation High Tension",
    "NOM Kuwait",
    "Odagya No2 Preaching Point Odagya",
    "Kokobriko Preaching Point Kokobriko",
  ];

  // Load committee members
  useEffect(() => {
    loadCommitteeMembers();
  }, []);

  // Theme effect
  useEffect(() => {
    const savedTheme = localStorage.getItem("welfare-theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  const loadCommitteeMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/welfare-committee");
      if (!response.ok) throw new Error("Failed to load committee members");
      const data = await response.json();
      setCommittee(data.members || []);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to load committee members",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("welfare-theme", newTheme ? "dark" : "light");
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^(\+233|0)[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone =
        "Please enter a valid phone number (0 or +233 followed by 9 digits)";
    }

    // Position validation
    if (!formData.position) {
      newErrors.position = "Position is required";
    }

    // Congregation validation
    if (!formData.congregation) {
      newErrors.congregation = "Congregation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("congregation", formData.congregation);
      if (formData.picture) {
        formDataToSend.append("picture", formData.picture);
      }

      const url = editingMember
        ? `/api/welfare-committee/${editingMember.id}`
        : "/api/welfare-committee";
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save member");
      }

      setStatus({
        type: "success",
        message: editingMember
          ? "Committee member updated successfully!"
          : "Committee member added successfully!",
      });

      resetForm();
      loadCommitteeMembers();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      position: member.position,
      congregation: member.congregation,
      picture: null,
      picturePreview: member.picture,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, hardDelete = false) => {
    if (
      !confirm(
        `Are you sure you want to ${hardDelete ? "permanently delete" : "remove"} this member?`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/welfare-committee/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hardDelete }),
      });

      if (!response.ok) throw new Error("Failed to delete member");

      setStatus({
        type: "success",
        message: `Member ${hardDelete ? "permanently deleted" : "removed"} successfully!`,
      });

      loadCommitteeMembers();
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to delete member",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({
          type: "error",
          message: "Image size must be less than 5MB",
        });
        return;
      }

      setFormData({
        ...formData,
        picture: file,
        picturePreview: URL.createObjectURL(file),
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      congregation: "",
      picture: null,
      picturePreview: null,
    });
    setErrors({});
    setEditingMember(null);
    setIsModalOpen(false);
  };

  const filteredAndSortedCommittee = committee
    .filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      const matchesFilter =
        !filterPosition || member.position === filterPosition;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "name") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getInputClassName = (fieldName) => {
    const baseClass =
      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors";
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass = isDarkMode
      ? "border-gray-600 bg-gray-700 text-white"
      : "border-gray-300 bg-white text-gray-900";

    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welfare Committee</h1>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Manage welfare committee members and their profiles
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                  : "bg-white hover:bg-gray-100 text-gray-600 shadow-sm"
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {status.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              status.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{status.message}</span>
            <button
              onClick={() => setStatus({ type: "", message: "" })}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div
          className={`mb-6 p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="name">Sort by Name</option>
                <option value="position">Sort by Position</option>
                <option value="congregation">Sort by Congregation</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className={`p-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                {sortOrder === "asc" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">All Positions</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Committee Members Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredAndSortedCommittee.length === 0 ? (
          <div
            className={`text-center py-12 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm`}
          >
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">
              No committee members found
            </h3>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
            >
              {searchTerm || filterPosition
                ? "Try adjusting your search or filters"
                : "Get started by adding the first committee member"}
            </p>
            {!searchTerm && !filterPosition && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Member</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCommittee.map((member) => (
              <div
                key={member.id}
                className={`rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-750"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Member Picture */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                  {member.picture ? (
                    <img
                      src={member.picture}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <User className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Position Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {member.position}
                    </span>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3">
                    <div className="relative group">
                      <button className="bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <button
                          onClick={() => handleEdit(member)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, false)}
                          className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, true)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Permanently</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{member.name}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{member.congregation}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md max-h-[90vh] rounded-lg shadow-xl overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {editingMember ? "Edit Member" : "Add New Member"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]"
            >
              {/* Picture Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {formData.picturePreview ? (
                      <img
                        src={formData.picturePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center cursor-pointer">
                      <Save className="w-4 h-4 mr-2" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={getInputClassName("name")}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={getInputClassName("email")}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={getInputClassName("phone")}
                  placeholder="+233 20 123 4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className={getInputClassName("position")}
                >
                  <option value="">Select position</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="mt-1 text-xs text-red-600">{errors.position}</p>
                )}
              </div>

              {/* Congregation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Congregation *
                </label>
                <select
                  value={formData.congregation}
                  onChange={(e) =>
                    setFormData({ ...formData, congregation: e.target.value })
                  }
                  className={getInputClassName("congregation")}
                >
                  <option value="">Select congregation</option>
                  {congregations.map((congregation) => (
                    <option key={congregation} value={congregation}>
                      {congregation}
                    </option>
                  ))}
                </select>
                {errors.congregation && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.congregation}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingMember ? "Update" : "Save"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
