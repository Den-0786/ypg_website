import { useState } from "react";
import { Users, Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const TeamManagement = ({ teamMembers = [], setTeamMembers, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    quote: "",
    twitter: "",
    facebook: "",
    image: null,
  });

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Validation functions
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

  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError("");
      return true;
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");

    // Check if it starts with 0 or +233 and has exactly 10 digits total
    if (phone.startsWith("0")) {
      if (digitsOnly.length !== 10) {
        setPhoneError(
          "Phone number must be exactly 10 digits (e.g., 0241234567)"
        );
        return false;
      }
    } else if (phone.startsWith("+233")) {
      if (digitsOnly.length !== 12) {
        setPhoneError(
          "Phone number must be exactly 12 digits with +233 (e.g., +233241234567)"
        );
        return false;
      }
    } else {
      setPhoneError("Phone number must start with 0 or +233");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handleAddMember = async () => {
    // Validate email and phone before submitting
    const isEmailValid = validateEmail(newMember.email);
    const isPhoneValid = validatePhone(newMember.phone);

    if (!isEmailValid || !isPhoneValid) {
      return; // Don't submit if validation fails
    }

    const formData = new FormData();
    formData.append("name", newMember.name);
    formData.append("role", newMember.role);
    formData.append("email", newMember.email);
    formData.append("phone", newMember.phone);
    formData.append("quote", newMember.quote);
    formData.append("twitter", newMember.twitter);
    formData.append("facebook", newMember.facebook);
    if (newMember.image) {
      formData.append("image", newMember.image);
    }

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const addedMember = await response.json();
        setTeamMembers([
          ...(Array.isArray(teamMembers) ? teamMembers : []),
          addedMember,
        ]);
        setShowAddModal(false);
        setNewMember({
          name: "",
          role: "",
          email: "",
          phone: "",
          quote: "",
          twitter: "",
          facebook: "",
          image: null,
        });
        // Clear validation errors
        setEmailError("");
        setPhoneError("");
        toast.success("Team member added successfully!");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      toast.error("Failed to add team member. Please try again.");
    }
  };

  const handleUpdateMember = async () => {
    const formData = new FormData();
    formData.append("name", editingMember.name);
    formData.append("role", editingMember.role);
    formData.append("email", editingMember.email);
    formData.append("phone", editingMember.phone);
    formData.append("quote", editingMember.quote);
    formData.append("twitter", editingMember.twitter);
    formData.append("facebook", editingMember.facebook);
    if (editingMember.image) {
      formData.append("image", editingMember.image);
    }

    try {
      const response = await fetch(`/api/team/${editingMember.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setTeamMembers(
          Array.isArray(teamMembers)
            ? teamMembers.map((member) =>
                member.id === editingMember.id ? updatedMember : member
              )
            : [updatedMember]
        );
        setEditingMember(null);
        toast.success("Team member updated successfully!");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member. Please try again.");
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
        `/api/team?id=${memberToDelete.id}&type=${deleteType}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (deleteType === "both") {
          setTeamMembers(
            Array.isArray(teamMembers)
              ? teamMembers.filter((member) => member.id !== memberToDelete.id)
              : []
          );
          toast.success("Team member permanently deleted!");
        } else {
          setTeamMembers(
            Array.isArray(teamMembers)
              ? teamMembers.map((member) =>
                  member.id === memberToDelete.id
                    ? { ...member, dashboard_deleted: true }
                    : member
                )
              : []
          );
          toast.success("Team member removed from dashboard!");
        }
        setShowDeleteModal(false);
        setMemberToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Team Management
        </h2>
        <button
          onClick={() => {
            setShowAddModal(true);
            // Clear validation errors when opening modal
            setEmailError("");
            setPhoneError("");
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Team Cards */}
      <div className="overflow-x-auto">
        {!Array.isArray(teamMembers) ? (
          <div className="text-center py-8">
            <p
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              Loading team members...
            </p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users
              className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
            />
            <p
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              No team members found. Add your first team member!
            </p>
          </div>
        ) : (
          <div className="flex space-x-6 pb-4 min-w-max">
            {teamMembers
              .filter((member) => !member.dashboard_deleted)
              .map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden w-64 flex-shrink-0`}
                >
                  <div
                    className={`h-16 ${theme === "dark" ? "bg-gradient-to-r from-blue-600 to-purple-700" : "bg-gradient-to-r from-blue-500 to-purple-600"} flex items-center justify-center`}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="p-4">
                    <h3
                      className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                    >
                      {member.name}
                    </h3>
                    <p
                      className={`text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {member.role}
                    </p>
                    <p
                      className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {member.email}
                    </p>
                    <p
                      className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {member.phone}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className={`flex-1 flex items-center justify-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(member)}
                        className={`flex-1 flex items-center justify-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${theme === "dark" ? "bg-red-900/30 text-red-300 hover:bg-red-800/40" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Add Team Member
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    // Clear validation errors when closing modal
                    setEmailError("");
                    setPhoneError("");
                  }}
                  className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => {
                      setNewMember({ ...newMember, email: e.target.value });
                      validateEmail(e.target.value);
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      emailError
                        ? "border-red-500 focus:ring-red-500"
                        : theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
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
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => {
                      setNewMember({ ...newMember, phone: e.target.value });
                      validatePhone(e.target.value);
                    }}
                    onBlur={(e) => validatePhone(e.target.value)}
                    placeholder="e.g., 0241234567 or +233241234567"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      phoneError
                        ? "border-red-500 focus:ring-red-500"
                        : theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">📱</span>
                      {phoneError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Quote/Motto
                  </label>
                  <textarea
                    value={newMember.quote}
                    onChange={(e) =>
                      setNewMember({ ...newMember, quote: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter a personal quote or motto"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={newMember.twitter}
                      onChange={(e) =>
                        setNewMember({ ...newMember, twitter: e.target.value })
                      }
                      placeholder="https://twitter.com/username"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={newMember.facebook}
                      onChange={(e) =>
                        setNewMember({ ...newMember, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/username"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Browse Media
                  </label>
                  <div className="flex gap-3">
                    {/* Left side - Media preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      {newMember.image ? (
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
                            {newMember.image.name}
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
                            setNewMember({
                              ...newMember,
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

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    // Clear validation errors when canceling
                    setEmailError("");
                    setPhoneError("");
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {editingMember && (
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
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                >
                  Edit Team Member
                </h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        role: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        email: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingMember.phone}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        phone: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Quote/Motto
                  </label>
                  <textarea
                    value={editingMember.quote}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        quote: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Enter a personal quote or motto"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={editingMember.twitter}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          twitter: e.target.value,
                        })
                      }
                      placeholder="https://twitter.com/username"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={editingMember.facebook}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          facebook: e.target.value,
                        })
                      }
                      placeholder="https://facebook.com/username"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Browse Media
                  </label>
                  <div className="flex gap-3">
                    {/* Left side - Media preview */}
                    <div
                      className={`flex-1 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    >
                      {editingMember.image ? (
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
                            {editingMember.image.name}
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
                            setEditingMember({
                              ...editingMember,
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

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingMember(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMember}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Delete Team Member
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose how you want to delete &ldquo;{memberToDelete?.name}
                    &rdquo;
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleDeleteMember("dashboard")}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Delete from Dashboard Only
                      </h4>
                      <p className="text-sm text-gray-600">
                        Hide from admin dashboard but keep on main website
                      </p>
                    </div>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteMember("both")}
                  className="w-full p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">
                        Delete from Both
                      </h4>
                      <p className="text-sm text-red-600">
                        Permanently remove from dashboard and main website
                      </p>
                    </div>
                    <div className="w-5 h-5 border-2 border-red-500 rounded-full bg-red-500"></div>
                  </div>
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMemberToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

export default TeamManagement;
