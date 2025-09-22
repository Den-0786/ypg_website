import { useState, useEffect } from "react";
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
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Download,
  Search,
  BarChart3,
  PieChart,
  Target,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Heart,
  BookOpen,
  Home,
  GraduationCap,
  Gift,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const DonationsManagement = ({ donations = [], setDonations, theme }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donor_name: "",
    amount: "",
    email: "",
    phone: "",
    message: "",
    payment_method: "momo",
    purpose: "general",
    payment_status: "pending",
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
    const cleanPhone = phone.replace(/\s+/g, "");
    if (!cleanPhone.startsWith("0") && !cleanPhone.startsWith("+233")) {
      setPhoneError("Number must start with 0 or +233");
      return false;
    }
    let expectedLength = 10;
    if (cleanPhone.startsWith("+233")) {
      expectedLength = 13;
    }
    if (cleanPhone.length !== expectedLength) {
      setPhoneError("Number must be 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Purpose options
  const purposeOptions = [
    {
      value: "general",
      label: "General Fund",
      icon: Heart,
      color: "bg-red-500",
    },
    {
      value: "events",
      label: "Events & Activities",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      value: "welfare",
      label: "Welfare Committee",
      icon: Gift,
      color: "bg-green-500",
    },
    {
      value: "ministry",
      label: "Ministry Support",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      value: "building",
      label: "Building Fund",
      icon: Home,
      color: "bg-orange-500",
    },
    {
      value: "education",
      label: "Education Fund",
      icon: GraduationCap,
      color: "bg-indigo-500",
    },
  ];

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalAmount = donations.reduce(
      (sum, donation) => sum + parseFloat(donation.amount || 0),
      0
    );
    const verifiedAmount = donations
      .filter((d) => d.payment_status === "verified")
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const pendingCount = donations.filter(
      (d) => d.payment_status === "pending"
    ).length;
    const verifiedCount = donations.filter(
      (d) => d.payment_status === "verified"
    ).length;
    const failedCount = donations.filter(
      (d) => d.payment_status === "failed"
    ).length;

    const momoTotal = donations
      .filter(
        (d) => d.payment_method === "momo" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const cashTotal = donations
      .filter(
        (d) => d.payment_method === "cash" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const bankTotal = donations
      .filter(
        (d) => d.payment_method === "bank" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    const cardTotal = donations
      .filter(
        (d) => d.payment_method === "card" && d.payment_status === "verified"
      )
      .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

    // Purpose breakdown
    const purposeBreakdown = purposeOptions.map((purpose) => ({
      ...purpose,
      amount: donations
        .filter(
          (d) => d.purpose === purpose.value && d.payment_status === "verified"
        )
        .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0),
      count: donations.filter((d) => d.purpose === purpose.value).length,
    }));

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthAmount = donations
        .filter((d) => {
          const donationDate = new Date(d.created_at);
          return (
            donationDate.getMonth() === date.getMonth() &&
            donationDate.getFullYear() === date.getFullYear() &&
            d.payment_status === "verified"
          );
        })
        .reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);

      monthlyTrends.push({ month, year, amount: monthAmount });
    }

    return {
      totalAmount,
      verifiedAmount,
      pendingCount,
      verifiedCount,
      failedCount,
      momoTotal,
      cashTotal,
      bankTotal,
      cardTotal,
      purposeBreakdown,
      monthlyTrends,
    };
  };

  const analytics = calculateAnalytics();

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.receipt_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPurpose =
      selectedPurpose === "all" || donation.purpose === selectedPurpose;
    const matchesStatus =
      selectedStatus === "all" || donation.payment_status === selectedStatus;

    const matchesPending =
      !showPendingOnly || donation.payment_status === "pending";

    return matchesSearch && matchesPurpose && matchesStatus && matchesPending;
  });

  const handleAddDonation = async () => {
    const isEmailValid = validateEmail(newDonation.email);
    const isPhoneValid = validatePhone(newDonation.phone);

    if (!isEmailValid || !isPhoneValid) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8002/api/donations", {
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
          donor_name: "",
          amount: "",
          email: "",
          phone: "",
          message: "",
          payment_method: "momo",
          purpose: "general",
          payment_status: "pending",
        });
        setEmailError("");
        setPhoneError("");
        toast.success("Donation added successfully!");
      }
    } catch (error) {
      console.error("Error adding donation:", error);
      toast.error("Failed to add donation. Please try again.");
    }
  };

  const handleVerifyDonation = async (donation) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/donations/${donation.id}/verify/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedDonation = await response.json();
        setDonations(
          donations.map((d) =>
            d.id === donation.id ? { ...d, payment_status: "verified" } : d
          )
        );
        toast.success("Donation verified successfully!");
      }
    } catch (error) {
      console.error("Error verifying donation:", error);
      toast.error("Failed to verify donation. Please try again.");
    }
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        const response = await fetch(
          `http://localhost:8002/api/donations/${id}/delete/`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setDonations(donations.filter((d) => d.id !== id));
          toast.success("Donation deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting donation:", error);
        toast.error("Failed to delete donation. Please try again.");
      }
    }
  };

  const exportDonations = () => {
    const csvContent = [
      [
        "Donor Name",
        "Email",
        "Phone",
        "Amount",
        "Purpose",
        "Payment Method",
        "Status",
        "Date",
        "Receipt Code",
      ],
      ...filteredDonations.map((donation) => [
        donation.donor_name,
        donation.email,
        donation.phone,
        donation.amount,
        donation.purpose,
        donation.payment_method,
        donation.payment_status,
        new Date(donation.created_at).toLocaleDateString(),
        donation.receipt_code,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "momo":
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case "cash":
        return <Banknote className="w-5 h-5 text-yellow-600" />;
      case "bank":
        return <Building className="w-5 h-5 text-blue-600" />;
      case "card":
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Donations Management
          </h2>
          <p className="text-gray-600">
            Manage and track all donations to the YPG ministry
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>{showAnalytics ? "Hide" : "Show"} Analytics</span>
          </button>
          <button
            onClick={exportDonations}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Donation</span>
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Donation Analytics
            </h3>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Total Verified
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                      ₵{analytics.verifiedAmount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Total Donations
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {donations.length}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">
                      Pending
                    </p>
                    <p className="text-3xl font-bold text-yellow-700">
                      {analytics.pendingCount}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">
                      Verified
                    </p>
                    <p className="text-3xl font-bold text-purple-700">
                      {analytics.verifiedCount}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Methods
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      method: "Mobile Money",
                      amount: analytics.momoTotal,
                      icon: Smartphone,
                      color: "bg-green-500",
                    },
                    {
                      method: "Cash",
                      amount: analytics.cashTotal,
                      icon: Banknote,
                      color: "bg-yellow-500",
                    },
                    {
                      method: "Bank Transfer",
                      amount: analytics.bankTotal,
                      icon: Building,
                      color: "bg-blue-500",
                    },
                    {
                      method: "Card",
                      amount: analytics.cardTotal,
                      icon: CreditCard,
                      color: "bg-purple-500",
                    },
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    const percentage =
                      analytics.verifiedAmount > 0
                        ? (item.amount / analytics.verifiedAmount) * 100
                        : 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">
                            {item.method}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₵{item.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Purpose Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Purpose Breakdown
                </h4>
                <div className="space-y-4">
                  {analytics.purposeBreakdown.map((purpose, index) => {
                    const IconComponent = purpose.icon;
                    const percentage =
                      analytics.verifiedAmount > 0
                        ? (purpose.amount / analytics.verifiedAmount) * 100
                        : 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${purpose.color} rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              {purpose.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {purpose.count} donations
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₵{purpose.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Trends (Last 6 Months)
              </h4>
              <div className="flex items-end space-x-4 h-32">
                {analytics.monthlyTrends.map((month, index) => {
                  const maxAmount = Math.max(
                    ...analytics.monthlyTrends.map((m) => m.amount)
                  );
                  const height =
                    maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-gray-200 rounded-t-lg relative"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {month.month}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₵{month.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Purposes</option>
            {purposeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pending Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <motion.tr
                  key={donation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donor_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.email}
                      </div>
                      {donation.phone && (
                        <div className="text-sm text-gray-500">
                          {donation.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ₵{donation.amount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {donation.currency || "GHS"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const purpose = purposeOptions.find(
                          (p) => p.value === donation.purpose
                        );
                        if (purpose) {
                          const IconComponent = purpose.icon;
                          return (
                            <>
                              <div
                                className={`w-6 h-6 ${purpose.color} rounded flex items-center justify-center`}
                              >
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">
                                {purpose.label}
                              </span>
                            </>
                          );
                        }
                        return (
                          <span className="text-sm text-gray-700">
                            {donation.purpose}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(donation.payment_method)}
                      <span className="text-sm text-gray-700 capitalize">
                        {donation.payment_method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(donation.payment_status)}
                      <span className="text-sm text-gray-700 capitalize">
                        {donation.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {donation.payment_status === "pending" && (
                      <button
                        onClick={() => handleVerifyDonation(donation)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Verify Donation"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDonation(donation.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Donation"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No donations found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or add a new donation.
            </p>
          </div>
        )}
      </div>

      {/* Add Donation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Add New Donation
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDonation();
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donor Name *
                    </label>
                    <input
                      type="text"
                      value={newDonation.donor_name}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          donor_name: e.target.value,
                        })
                      }
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
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
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
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
                      required
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        emailError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        phoneError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose
                    </label>
                    <select
                      value={newDonation.purpose}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          purpose: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {purposeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={newDonation.payment_method}
                      onChange={(e) =>
                        setNewDonation({
                          ...newDonation,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="momo">Mobile Money</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Credit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Donation
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationsManagement;
