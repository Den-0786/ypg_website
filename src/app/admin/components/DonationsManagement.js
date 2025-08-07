import { useState } from "react";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const DonationsManagement = ({ donations = [], setDonations, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donorName: "",
    amount: "",
    email: "",
    phone: "",
    message: "",
    date: "",
    paymentMethod: "momo",
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

  // Debug logging
  console.log("DonationsManagement - donations:", donations);
  console.log("DonationsManagement - donations type:", typeof donations);
  console.log("DonationsManagement - isArray:", Array.isArray(donations));
  console.log("DonationsManagement - length:", donations?.length);

  const handleAddDonation = async () => {
    // Validate email and phone before submitting
    const isEmailValid = validateEmail(newDonation.email);
    const isPhoneValid = validatePhone(newDonation.phone);

    if (!isEmailValid || !isPhoneValid) {
      return; // Don't submit if validation fails
    }

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDonation),
      });

      if (response.ok) {
        const addedDonation = await response.json();
        setDonations([...donations, addedDonation]);
        setShowAddModal(false);
        setNewDonation({
          donorName: "",
          amount: "",
          email: "",
          phone: "",
          message: "",
          date: "",
          paymentMethod: "momo",
        });
        // Clear validation errors
        setEmailError("");
        setPhoneError("");
        toast.success("Donation added successfully!");
      }
    } catch (error) {
      console.error("Error adding donation:", error);
      toast.error("Failed to add donation. Please try again.");
    }
  };

  const handleUpdateDonation = async () => {
    try {
      const response = await fetch(`/api/donations/${editingDonation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingDonation),
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(
          donations.map((donation) =>
            donation.id === editingDonation.id ? updatedDonation : donation
          )
        );
        setEditingDonation(null);
        toast.success("Donation updated successfully!");
      }
    } catch (error) {
      console.error("Error updating donation:", error);
      toast.error("Failed to update donation. Please try again.");
    }
  };

  const handleDeleteDonation = async (id) => {
    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDonations(donations.filter((donation) => donation.id !== id));
        toast.success("Donation deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting donation:", error);
      toast.error("Failed to delete donation. Please try again.");
    }
  };

  const handleVerifyDonation = async (donation) => {
    try {
      const response = await fetch(`/api/donations/${donation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...donation,
          verification_status: "verified",
          status: "confirmed",
        }),
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(
          donations.map((d) => (d.id === donation.id ? updatedDonation : d))
        );
        toast.success("Donation verified successfully!");
      }
    } catch (error) {
      console.error("Error verifying donation:", error);
      toast.error("Failed to verify donation. Please try again.");
    }
  };

  const handleRejectDonation = async (donation) => {
    try {
      const response = await fetch(`/api/donations/${donation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...donation,
          verification_status: "rejected",
          status: "failed",
        }),
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(
          donations.map((d) => (d.id === donation.id ? updatedDonation : d))
        );
        toast.success("Donation rejected successfully!");
      }
    } catch (error) {
      console.error("Error rejecting donation:", error);
      toast.error("Failed to reject donation. Please try again.");
    }
  };

  // Filter donations based on showPendingOnly
  const filteredDonations = showPendingOnly
    ? donations.filter((d) => d.verification_status === "pending")
    : donations;

  const totalDonations = Array.isArray(filteredDonations)
    ? filteredDonations.reduce(
        (sum, donation) => sum + parseFloat(donation.amount || 0),
        0
      )
    : 0;

  // Calculate totals by payment method (verified only)
  const getTotalByPaymentMethod = (method) => {
    return Array.isArray(donations)
      ? donations
          .filter(
            (donation) =>
              donation.paymentMethod === method &&
              donation.verification_status === "verified"
          )
          .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0)
      : 0;
  };

  const momoTotal = getTotalByPaymentMethod("momo");
  const cashTotal = getTotalByPaymentMethod("cash");
  const bankTotal = getTotalByPaymentMethod("bank");

  // Get pending donations count
  const pendingCount = donations.filter(
    (d) => d.verification_status === "pending"
  ).length;
  const verifiedCount = donations.filter(
    (d) => d.verification_status === "verified"
  ).length;
  const rejectedCount = donations.filter(
    (d) => d.verification_status === "rejected"
  ).length;

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center justify-between min-w-0">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Donations Management
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showPendingOnly
                ? "bg-orange-600 text-white"
                : theme === "dark"
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showPendingOnly ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>
              {showPendingOnly ? "Show All" : `Pending (${pendingCount})`}
            </span>
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              // Clear validation errors when opening modal
              setEmailError("");
              setPhoneError("");
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Donation</span>
          </button>
        </div>
      </div>

      {/* Verification Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`${theme === "dark" ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"} border rounded-xl p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${theme === "dark" ? "text-yellow-300" : "text-yellow-800"}`}
              >
                Pending Verification
              </p>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-700"}`}
              >
                {pendingCount}
              </p>
            </div>
            <Clock
              className={`w-8 h-8 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
            />
          </div>
        </div>
        <div
          className={`${theme === "dark" ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"} border rounded-xl p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${theme === "dark" ? "text-green-300" : "text-green-800"}`}
              >
                Verified
              </p>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-700"}`}
              >
                {verifiedCount}
              </p>
            </div>
            <CheckCircle
              className={`w-8 h-8 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
            />
          </div>
        </div>
        <div
          className={`${theme === "dark" ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"} border rounded-xl p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${theme === "dark" ? "text-red-300" : "text-red-800"}`}
              >
                Rejected
              </p>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-700"}`}
              >
                {rejectedCount}
              </p>
            </div>
            <AlertCircle
              className={`w-8 h-8 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
            />
          </div>
        </div>
      </div>

      {/* Payment Method Cards (Verified Only) */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-3 lg:gap-4">
          {/* MoMo Card */}
          <div
            className={`${theme === "dark" ? "bg-gradient-to-r from-pink-600 to-rose-700" : "bg-gradient-to-r from-pink-500 to-rose-600"} rounded-xl p-6 text-white min-w-[280px] lg:min-w-0`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">
                  MoMo Payments (Verified)
                </p>
                <p className="text-2xl font-bold">
                  ${momoTotal.toLocaleString()}
                </p>
                <p className="text-pink-100 text-xs mt-1">
                  {
                    donations.filter(
                      (d) =>
                        d.paymentMethod === "momo" &&
                        d.verification_status === "verified"
                    ).length
                  }{" "}
                  donations
                </p>
              </div>
              <Smartphone className="w-10 h-10 text-pink-100" />
            </div>
          </div>

          {/* Cash Card */}
          <div
            className={`${theme === "dark" ? "bg-gradient-to-r from-green-600 to-emerald-700" : "bg-gradient-to-r from-green-500 to-emerald-600"} rounded-xl p-6 text-white min-w-[280px] lg:min-w-0`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Cash Payments (Verified)
                </p>
                <p className="text-2xl font-bold">
                  ${cashTotal.toLocaleString()}
                </p>
                <p className="text-green-100 text-xs mt-1">
                  {
                    donations.filter(
                      (d) =>
                        d.paymentMethod === "cash" &&
                        d.verification_status === "verified"
                    ).length
                  }{" "}
                  donations
                </p>
              </div>
              <Banknote className="w-10 h-10 text-green-100" />
            </div>
          </div>

          {/* Bank Card */}
          <div
            className={`${theme === "dark" ? "bg-gradient-to-r from-blue-600 to-indigo-700" : "bg-gradient-to-r from-blue-500 to-indigo-600"} rounded-xl p-6 text-white min-w-[280px] lg:min-w-0`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Bank Transfers (Verified)
                </p>
                <p className="text-2xl font-bold">
                  ${bankTotal.toLocaleString()}
                </p>
                <p className="text-blue-100 text-xs mt-1">
                  {
                    donations.filter(
                      (d) =>
                        d.paymentMethod === "bank" &&
                        d.verification_status === "verified"
                    ).length
                  }{" "}
                  donations
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Total Summary Card (Verified Only) */}
      <div
        className={`${theme === "dark" ? "bg-gradient-to-r from-purple-600 to-violet-700" : "bg-gradient-to-r from-purple-500 to-violet-600"} w-full rounded-xl p-6 text-white min-w-0`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100">Total Verified Donations</p>
            <p className="text-3xl font-bold">
              ${(momoTotal + cashTotal + bankTotal).toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-purple-100" />
        </div>
      </div>

      {/* Donations Table */}
      <div
        className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead
              className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Donor
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Amount
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Payment Method
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Receipt Code
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Date
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
              {Array.isArray(filteredDonations) &&
                filteredDonations.map((donation) => (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"} ${
                      donation.verification_status === "pending"
                        ? theme === "dark"
                          ? "bg-yellow-900/20"
                          : "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div
                          className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {donation.donorName || donation.donor}
                        </div>
                        <div
                          className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {donation.email}
                        </div>
                        {donation.message && (
                          <div
                            className={`text-sm truncate max-w-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {donation.message}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
                      >
                        ${parseFloat(donation.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          donation.paymentMethod === "momo"
                            ? theme === "dark"
                              ? "bg-pink-900/30 text-pink-300"
                              : "bg-pink-100 text-pink-800"
                            : donation.paymentMethod === "cash"
                              ? theme === "dark"
                                ? "bg-green-900/30 text-green-300"
                                : "bg-green-100 text-green-800"
                              : theme === "dark"
                                ? "bg-blue-900/30 text-blue-300"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {donation.paymentMethod === "momo"
                          ? "MoMo"
                          : donation.paymentMethod === "cash"
                            ? "Cash"
                            : donation.paymentMethod === "bank"
                              ? "Bank"
                              : donation.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          donation.verification_status === "verified"
                            ? theme === "dark"
                              ? "bg-green-900/30 text-green-300"
                              : "bg-green-100 text-green-800"
                            : donation.verification_status === "pending"
                              ? theme === "dark"
                                ? "bg-yellow-900/30 text-yellow-300"
                                : "bg-yellow-100 text-yellow-800"
                              : theme === "dark"
                                ? "bg-red-900/30 text-red-300"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.verification_status === "verified" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {donation.verification_status === "pending" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {donation.verification_status === "rejected" && (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {donation.verification_status === "verified"
                          ? "Verified"
                          : donation.verification_status === "pending"
                            ? "Pending"
                            : "Rejected"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {donation.receipt_code || "N/A"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {donation.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {donation.verification_status === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerifyDonation(donation)}
                              className={`${theme === "dark" ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-900"}`}
                              title="Verify Payment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectDonation(donation)}
                              className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}
                              title="Reject Payment"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setEditingDonation(donation)}
                          className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"}`}
                          title="Edit Donation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDonation(donation.id)}
                          className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}
                          title="Delete Donation"
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

      {/* Add Donation Modal */}
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
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto border`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                  >
                    Add Donation
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      // Clear validation errors when closing modal
                      setEmailError("");
                      setPhoneError("");
                    }}
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
                      Donor Name
                    </label>
                    <input
                      type="text"
                      value={newDonation.donorName}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          donorName: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      value={newDonation.amount}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          amount: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Payment Method
                    </label>
                    <select
                      value={newDonation.paymentMethod}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          paymentMethod: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="momo">MoMo</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={newDonation.email}
                      onChange={(e) => {
                        setNewDonation({
                          ...newDonation,
                          email: e.target.value,
                        });
                        validateEmail(e.target.value);
                      }}
                      onBlur={(e) => validateEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
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
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newDonation.phone}
                      onChange={(e) => {
                        setNewDonation({
                          ...newDonation,
                          phone: e.target.value,
                        });
                        validatePhone(e.target.value);
                      }}
                      onBlur={(e) => validatePhone(e.target.value)}
                      placeholder="e.g., 0241234567 or +233241234567"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
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
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Message
                    </label>
                    <textarea
                      value={newDonation.message}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          message: e.target.value,
                        })
                      }
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDonation.date}
                      onChange={(e) =>
                        setNewDonation({ ...newDonation, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-5">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      // Clear validation errors when canceling
                      setEmailError("");
                      setPhoneError("");
                    }}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDonation}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Donation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Donation Modal */}
      <AnimatePresence>
        {editingDonation && (
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
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-2xl shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto border`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                  >
                    Edit Donation
                  </h3>
                  <button
                    onClick={() => setEditingDonation(null)}
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
                      Donor Name
                    </label>
                    <input
                      type="text"
                      value={editingDonation.donorName}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          donorName: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      value={editingDonation.amount}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          amount: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Payment Method
                    </label>
                    <select
                      value={editingDonation.paymentMethod || "momo"}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          paymentMethod: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="momo">MoMo</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Verification Status
                    </label>
                    <select
                      value={editingDonation.verification_status || "pending"}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          verification_status: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingDonation.email}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          email: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editingDonation.phone}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          phone: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Message
                    </label>
                    <textarea
                      value={editingDonation.message}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          message: e.target.value,
                        })
                      }
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      value={editingDonation.date}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          date: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-5">
                  <button
                    onClick={() => setEditingDonation(null)}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${theme === "dark" ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDonation}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Update Donation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationsManagement;
