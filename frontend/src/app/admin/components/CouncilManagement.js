"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Upload,
  X,
  Check,
  AlertTriangle,
  Crown,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CouncilManagement({ theme }) {
  const [councilMembers, setCouncilMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    congregation: "",
    phone: "",
    email: "",
    description: "",
    image: null,
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchCouncilMembers = async () => {
      try {
        const response = await fetch("http://localhost:8002/api/council");
        const data = await response.json();
        if (data.success) {
          setCouncilMembers(data.councilMembers);
        } else {
          console.error("Failed to fetch council members:", data.error);
          toast.error("Failed to load council members");
        }
      } catch (error) {
        console.error("Error fetching council members:", error);
        toast.error("Error loading council members");
      }
    };

    fetchCouncilMembers();
  }, []);

  // Validation functions
  const validatePhone = (phone) => {
    if (!phone) return "";
    const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "Please enter a valid Ghana phone number (e.g., 0244123456 or +233244123456)";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      congregation: "",
      phone: "",
      email: "",
      description: "",
      image: null,
    });
    setValidationErrors({
      phone: "",
      email: "",
    });
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        position: member.position,
        congregation: member.congregation,
        phone: member.phone,
        email: member.email,
        description: member.description,
        image: member.image,
      });
    } else {
      setEditingMember(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    resetForm();
  };

  // Real-time validation handlers
  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    const error = validatePhone(value);
    setValidationErrors({ ...validationErrors, phone: error });
  };

  const handleEmailChange = (value) => {
    setFormData({ ...formData, email: value });
    const error = validateEmail(value);
    setValidationErrors({ ...validationErrors, email: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.position || !formData.congregation) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Check for validation errors
      const phoneError = validatePhone(formData.phone);
      const emailError = validateEmail(formData.email);

      if (phoneError || emailError) {
        setValidationErrors({ phone: phoneError, email: emailError });
        toast.error("Please fix validation errors before submitting");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("congregation", formData.congregation);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("description", formData.description);

      if (formData.image && formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (editingMember) {
        formDataToSend.append("id", editingMember.id);
        response = await fetch(
          `http://localhost:8002/api/council/${editingMember.id}/update/`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
      } else {
        response = await fetch("http://localhost:8002/api/council/create/", {
          method: "POST",
          body: formDataToSend,
        });
      }

      const data = await response.json();
      if (data.success) {
        const saved = data.member || data.councilMember || data;
        if (editingMember) {
          setCouncilMembers(
            councilMembers.map((member) =>
              member && member.id === editingMember.id ? saved : member
            )
          );
          toast.success("Council member updated successfully!");
        } else {
          setCouncilMembers([...councilMembers, saved]);
          toast.success("Council member added successfully!");
        }
        closeModal();
      } else {
        toast.error(data.error || "Failed to save council member");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleDeleteMember = async (deleteType) => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8002/api/council/${memberToDelete.id}/delete/`,
        { method: "DELETE" }
      );

      if (response.ok) {
        if (deleteType === "both") {
          setCouncilMembers(
            councilMembers.filter((member) => member.id !== memberToDelete.id)
          );
          toast.success("Council member permanently deleted!");
        } else {
          setCouncilMembers(
            councilMembers.map((member) =>
              member.id === memberToDelete.id
                ? { ...member, dashboard_deleted: true }
                : member
            )
          );
          toast.success("Council member removed from dashboard!");
        }
        setShowDeleteModal(false);
        setMemberToDelete(null);
      } else {
        toast.error("Failed to delete council member");
      }
    } catch (error) {
      console.error("Error deleting council member:", error);
      toast.error("Failed to delete council member. Please try again.");
    }
  };

  // List of congregations
  const congregations = [
    "Emmanuel Congregation Ahinsan",
    "Christ Congregation Ahinsan Estate",
    "Peniel Congregation Esreso No1",
    "Mizpah Congregation Odagya No1",
    "Ebenezer Congregation Dompoase Aprabo",
    "Favour Congregation Esreso No2",
    "Liberty Congregation High Tension",
    "Odagya No2",
    "Kokobriko",
  ];

  const getImageUrl = (url) => {
    if (!url) return "/placeholder-item.jpg";
    if (url.startsWith("http")) return url;
    return `http://localhost:8002${url.startsWith("/") ? url : "/" + url}`;
  };

  const getPositionIcon = (position) => {
    if (position.includes("President")) return <Crown className="w-5 h-5" />;
    if (position.includes("Secretary")) return <User className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  return (
    <div
      className={`w-full ${theme === "dark" ? "text-white" : "text-gray-900"}`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-600" />
            Council Members Management
          </h1>
          <p
            className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage branch presidents and secretaries
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors self-start lg:self-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Council Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <span
                className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Total Members
              </span>
            </div>
            <span className="text-2xl font-bold">{councilMembers.length}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-600 mr-3" />
              <span
                className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Presidents
              </span>
            </div>
            <span className="text-2xl font-bold">
              {
                councilMembers.filter((member) =>
                  (member?.position || "").includes("President")
                ).length
              }
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-lg shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <span
                className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Secretaries
              </span>
            </div>
            <span className="text-2xl font-bold">
              {
                councilMembers.filter((member) =>
                  (member?.position || "").includes("Secretary")
                ).length
              }
            </span>
          </div>
        </motion.div>
      </div>

      {/* Council Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {councilMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg shadow-md overflow-hidden ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Member Image */}
            <div className="relative h-72 bg-gray-200">
              <img
                src={getImageUrl(member.image)}
                alt={member.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center text-xs font-medium">
                {getPositionIcon(member.position || "")}
                <span className="ml-1">{member.position || ""}</span>
              </div>
            </div>

            {/* Member Details */}
            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-purple-600 font-semibold text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {member.congregation}
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-3 space-y-1">
                {member.phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Mail className="w-3 h-3 mr-1" />
                    <span>{member.email}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {member.description && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p
                    className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} italic line-clamp-2`}
                  >
                    "{member.description}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(member)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(member)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Cute Header with Gradient */}
                <div className="relative mb-6 pb-6">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-2xl -mx-6 -mt-6 pt-6 px-6"></div>

                  <div className="relative flex items-center justify-between">
                    <div>
                      <h2
                        className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                      >
                        {editingMember
                          ? "Edit Council Member"
                          : "Add New Council Member"}
                      </h2>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} flex items-center mt-1"`}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        {editingMember
                          ? "Update member information with care"
                          : "Welcome a new leader to our council"}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className={`p-2 rounded-full transition-all duration-200 hover:rotate-90 ${
                        theme === "dark"
                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                          : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cute divider */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information Section */}
                  <div
                    className={`rounded-xl p-4 border ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 flex items-center ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <User
                        className={`w-5 h-5 mr-2 ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter full name"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Position *
                        </label>
                        <select
                          value={formData.position}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                          required
                        >
                          <option value="">Select Position</option>
                          <option value="Branch President">
                            Branch President
                          </option>
                          <option value="Branch Secretary">
                            Branch Secretary
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Congregation *
                      </label>
                      <select
                        value={formData.congregation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            congregation: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        required
                      >
                        <option value="">Select Congregation</option>
                        {congregations.map((congregation, index) => (
                          <option key={index} value={congregation}>
                            {congregation}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div
                    className={`rounded-xl p-4 border ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 flex items-center ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <Phone
                        className={`w-5 h-5 mr-2 ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          <Phone className="w-4 h-4 inline mr-1" />
                          Phone
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="0244123456"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors ${
                              validationErrors.phone
                                ? "border-red-500 bg-red-50"
                                : formData.phone && !validationErrors.phone
                                  ? "border-green-500 bg-green-50"
                                  : theme === "dark"
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                          />
                          {formData.phone && !validationErrors.phone && (
                            <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {validationErrors.phone && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {validationErrors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            placeholder="name@ypg.com"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors ${
                              validationErrors.email
                                ? "border-red-500 bg-red-50"
                                : formData.email && !validationErrors.email
                                  ? "border-green-500 bg-green-50"
                                  : theme === "dark"
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                          />
                          {formData.email && !validationErrors.email && (
                            <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {validationErrors.email && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {validationErrors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div
                    className={`rounded-xl p-4 border ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700/50"
                        : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 flex items-center ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <Edit
                        className={`w-5 h-5 mr-2 ${
                          theme === "dark" ? "text-amber-400" : "text-amber-600"
                        }`}
                      />
                      Description & Quote
                    </h3>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        💭 Personal Quote or Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Share an inspiring quote or brief description..."
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div
                    className={`rounded-xl p-4 border ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-pink-900/30 to-rose-900/30 border-pink-700/50"
                        : "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-100"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 flex items-center ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <Upload
                        className={`w-5 h-5 mr-2 ${
                          theme === "dark" ? "text-pink-400" : "text-pink-600"
                        }`}
                      />
                      Profile Picture
                    </h3>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        📸 Upload a professional photo
                      </label>
                      <div className="flex gap-3">
                        {/* Upload button - now same size as preview */}
                        <div className="w-32">
                          <label
                            className={`h-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                              theme === "dark"
                                ? "border-purple-500 hover:border-purple-400 hover:bg-purple-900/20 bg-purple-900/10"
                                : "border-purple-300 hover:border-purple-400 hover:bg-purple-50 bg-purple-25"
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-1">
                              <Upload className="w-3 h-3 text-white" />
                            </div>
                            <span
                              className={`text-xs font-medium ${
                                theme === "dark"
                                  ? "text-purple-400"
                                  : "text-purple-600"
                              }`}
                            >
                              Choose File
                            </span>
                            <span
                              className={`text-xs ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              JPG, PNG
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  image: e.target.files[0],
                                })
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {/* Image preview - now same size as upload button */}
                        <div
                          className={`w-32 h-16 border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-200 ${
                            formData.image
                              ? theme === "dark"
                                ? "border-green-400 bg-green-900/20"
                                : "border-green-400 bg-green-50"
                              : theme === "dark"
                                ? "bg-gray-800 border-gray-600 hover:border-gray-500"
                                : "bg-gray-50 border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {formData.image ? (
                            <div className="text-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                                  theme === "dark"
                                    ? "bg-green-800"
                                    : "bg-green-100"
                                }`}
                              >
                                <Check
                                  className={`w-3 h-3 ${
                                    theme === "dark"
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <p
                                className={`text-xs font-medium truncate px-1 ${
                                  theme === "dark"
                                    ? "text-green-400"
                                    : "text-green-700"
                                }`}
                              >
                                {formData.image instanceof File
                                  ? "Selected"
                                  : "Current"}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                                  theme === "dark"
                                    ? "bg-gray-700"
                                    : "bg-gray-200"
                                }`}
                              >
                                <Upload
                                  className={`w-3 h-3 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                />
                              </div>
                              <p
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                No image
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                        theme === "dark"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : editingMember ? (
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Update Member</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Add Member</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && memberToDelete && (
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
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl p-6 w-full max-w-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-semibold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMemberToDelete(null);
                  }}
                  className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700" : ""}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                >
                  Are you sure you want to delete{" "}
                  <strong>&quot;{memberToDelete.name}&quot;</strong>?
                </p>
                <p
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  Choose your deletion option:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteMember("dashboard")}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
                >
                  <div className="font-semibold">
                    Delete from Dashboard Only
                  </div>
                  <div className="text-sm">
                    Member will be hidden from admin but remain on main website
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteMember("both")}
                  className="w-full px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
                >
                  <div className="font-semibold">Delete from Both</div>
                  <div className="text-sm">
                    Member will be permanently deleted from dashboard and main
                    website
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMemberToDelete(null);
                  }}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                    theme === "dark"
                      ? "text-gray-300 border-gray-600 hover:bg-gray-700"
                      : "text-gray-700"
                  }`}
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
}
