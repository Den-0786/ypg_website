/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { donationAPI } from "../../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  BookOpen,
  Home,
  GraduationCap,
  Gift,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

export default function DonateSection() {
  const [formData, setFormData] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: "",
    paymentMethod: "",
    purpose: "general",
    message: "",
    isRecurring: false,
    recurringFrequency: "monthly",
    dedicationName: "",
    dedicationType: "",
    organizationName: "",
  });

  const [selectedAmount, setSelectedAmount] = useState("");
  const [showMomoInstructions, setShowMomoInstructions] = useState(false);
  const [momoTooltipPosition, setMomoTooltipPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [receiptCode, setReceiptCode] = useState("");
  const [impactStats, setImpactStats] = useState({
    youth_reached: 500,
    events_organized: 50,
    community_impact: 100,
  });
  const [verificationFields, setVerificationFields] = useState({
    momoTransactionId: "",
    cashReceiptNumber: "",
    bankReference: "",
  });

  // Fetch impact statistics on component mount
  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/impact-statistics/`
      );
      const data = await response.json();
      if (data.success) {
        setImpactStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching impact statistics:", error);
      // Keep default values if fetch fails
    }
  };

  const processCardPayment = async (donationId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/donations/process-payment/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donation_id: donationId,
            payment_method: "card",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log(
          "Payment processed successfully:",
          data.data.transaction_id
        );
        // Update impact stats after successful payment
        fetchImpactStats();
      } else {
        console.error("Payment processing failed:", data.data.error);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const donationAmounts = [
    {
      amount: 50,
      label: "Can support 1 youth event",
      impact: "Help organize monthly youth gatherings",
    },
    {
      amount: 100,
      label: "Can provide ministry materials",
      impact: "Support Bible study and ministry resources",
    },
    {
      amount: 250,
      label: "Can fund welfare activities",
      impact: "Help community outreach programs",
    },
    {
      amount: 500,
      label: "Can sponsor major events",
      impact: "Support annual conferences and retreats",
    },
  ];

  const purposeOptions = [
    {
      value: "general",
      label: "General Fund",
      icon: Heart,
      description: "Support all YPG activities",
    },
    {
      value: "events",
      label: "Events & Activities",
      icon: Users,
      description: "Youth gatherings and conferences",
    },
    {
      value: "welfare",
      label: "Welfare Committee",
      icon: Gift,
      description: "Community outreach programs",
    },
    {
      value: "ministry",
      label: "Ministry Support",
      icon: BookOpen,
      description: "Bible study and ministry resources",
    },
    {
      value: "building",
      label: "Building Fund",
      icon: Home,
      description: "Facility improvements and maintenance",
    },
    {
      value: "education",
      label: "Education Fund",
      icon: GraduationCap,
      description: "Educational programs and scholarships",
    },
  ];

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

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("");
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "phone") {
      validatePhone(value);
    }
    if (name === "email") {
      validateEmail(value);
    }
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setFormData((prev) => ({ ...prev, amount: amount.toString() }));
  };

  const handlePaymentMethodChange = (method, event) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    if (method === "momo") {
      const rect = event.currentTarget.getBoundingClientRect();
      setMomoTooltipPosition({
        top: rect.top - 200,
        left: rect.left - 50,
      });
      setShowMomoInstructions(true);
    } else {
      setShowMomoInstructions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);

    if (!isPhoneValid || !isEmailValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("submitting");

    try {
      const result = await donationAPI.submitDonation({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString().split("T")[0],
      });

      if (result.success) {
        const data = result.data;
        if (data.success) {
          const donation = data.donation;

          // Handle different payment methods
          if (formData.paymentMethod === "card") {
            // Process card payment
            await processCardPayment(donation.id);
          } else if (formData.paymentMethod === "momo") {
            // Show MoMo instructions
            setShowMomoInstructions(true);
          }

          setReceiptCode(data.receipt_code);
          setSubmissionStatus("success");
          setFormData({
            donorName: "",
            email: "",
            phone: "",
            amount: "",
            paymentMethod: "",
            purpose: "general",
            message: "",
            isRecurring: false,
            recurringFrequency: "monthly",
            dedicationName: "",
            dedicationType: "",
            organizationName: "",
          });
          setSelectedAmount("");
          setPhoneError("");
          setEmailError("");
        } else {
          setSubmissionStatus("error");
        }
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="donate" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Donation Section - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Donation Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Make a Donation
            </h2>

            {/* Donation Type */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Donation Type
              </h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isRecurring: false }))
                  }
                  className={`px-8 py-4 rounded-lg font-medium transition-all text-lg ${
                    !formData.isRecurring
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  One-Time
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isRecurring: true }))
                  }
                  className={`px-8 py-4 rounded-lg font-medium transition-all text-lg ${
                    formData.isRecurring
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Amount
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {donationAmounts.map((item, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => handleAmountSelect(item.amount)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedAmount === item.amount
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-xl font-bold mb-2">₵{item.amount}</div>
                    <div className="text-sm text-gray-600">{item.label}</div>
                  </motion.button>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold text-gray-500">₵</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Custom amount"
                    className="flex-1 text-xl font-bold bg-transparent border-none outline-none"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Purpose Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Purpose
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {purposeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          purpose: option.value,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.purpose === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <IconComponent className="w-5 h-5" />
                        <span className="text-base font-medium">
                          {option.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    method: "momo",
                    label: "Mobile Money",
                    icon: Smartphone,
                    color: "bg-blue-500",
                  },
                  {
                    method: "cash",
                    label: "Cash",
                    icon: Banknote,
                    color: "bg-yellow-500",
                  },
                  {
                    method: "bank",
                    label: "Bank Transfer",
                    icon: Building,
                    color: "bg-blue-500",
                  },
                  {
                    method: "card",
                    label: "Credit Card",
                    icon: CreditCard,
                    color: "bg-purple-500",
                  },
                ].map((payment) => {
                  const IconComponent = payment.icon;
                  return (
                    <motion.button
                      key={payment.method}
                      type="button"
                      onClick={(e) =>
                        handlePaymentMethodChange(payment.method, e)
                      }
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.paymentMethod === payment.method
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`w-10 h-10 ${payment.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        {payment.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* MoMo Instructions Tooltip */}
              <AnimatePresence>
                {showMomoInstructions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed z-50 bg-white border border-blue-200 rounded-xl p-4 shadow-xl max-w-sm"
                    style={{
                      top: `${momoTooltipPosition.top}px`,
                      left: `${momoTooltipPosition.left}px`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-blue-800">
                        Mobile Money Instructions
                      </h4>
                      <button
                        onClick={() => setShowMomoInstructions(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>1. Dial *170# on your phone</p>
                      <p>2. Select "Send Money"</p>
                      <p>
                        3. Enter YPG number:{" "}
                        <span className="font-bold text-blue-800">
                          0541107445
                        </span>
                      </p>
                      <p>
                        4. Amount:{" "}
                        <span className="font-bold text-blue-800">
                          ₵{formData.amount || "___"}
                        </span>
                      </p>
                      <p>
                        5. Reference:{" "}
                        <span className="font-bold text-blue-800">
                          YPG-{receiptCode || "XXXX"}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Complete Donation"
              )}
            </motion.button>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {submissionStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-semibold">
                        Donation Submitted Successfully!
                      </p>
                      <p className="text-sm">
                        Receipt Code:{" "}
                        <span className="font-mono font-bold">
                          {receiptCode}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {submissionStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Hero Card with Impact */}
          <div className="bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Give to the <span className="text-blue-100">Youth</span>
              </h2>
              <p className="text-blue-50 mb-6 leading-relaxed">
                Support the next generation of Christian leaders through
                meaningful programs, events, and community outreach.
              </p>

              {/* Impact Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">
                    {impactStats.youth_reached}+
                  </div>
                  <div className="text-xs text-blue-50">Youth</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">
                    {impactStats.events_organized}+
                  </div>
                  <div className="text-xs text-blue-50">Events</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">
                    {impactStats.community_impact}%
                  </div>
                  <div className="text-xs text-blue-50">Community</div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="flex justify-center">
                <img
                  src="/hero/youth.jpeg"
                  alt="Youth group members"
                  className="w-48 h-48 object-cover rounded-xl shadow-2xl"
                />
              </div>
            </div>

            {/* Impact Section - Moved into green card */}
            <div className="mt-8 mb-6">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Your Impact Matters
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-white mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">
                    {impactStats.youth_reached}+ Youth
                  </h4>
                  <p className="text-blue-50 text-sm">
                    Directly supported through our programs
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <BookOpen className="w-8 h-8 text-white mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">
                    {impactStats.events_organized}+ Events
                  </h4>
                  <p className="text-blue-50 text-sm">
                    Organized annually for spiritual growth
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Heart className="w-8 h-8 text-white mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">
                    {impactStats.community_impact}% Community
                  </h4>
                  <p className="text-blue-50 text-sm">
                    Building stronger Christian communities
                  </p>
                </div>
              </div>
            </div>

            {/* Your Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Your Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 text-white placeholder-white/60"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 text-white placeholder-white/60 ${
                        emailError ? "border-red-400" : "border-white/30"
                      }`}
                      placeholder="your@email.com"
                    />
                    {emailError && (
                      <p className="text-red-200 text-xs mt-1">{emailError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 text-white placeholder-white/60 ${
                        phoneError ? "border-red-400" : "border-white/30"
                      }`}
                      placeholder="0541107445"
                    />
                    {phoneError && (
                      <p className="text-red-200 text-xs mt-1">{phoneError}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 text-white placeholder-white/60"
                    placeholder="Share a message with your donation"
                  />
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {submissionStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 bg-white/20 border border-white/30 rounded-xl p-4 text-center"
                >
                  <CheckCircle className="w-12 h-12 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Thank You!
                  </h3>
                  <p className="text-green-100 text-sm mb-2">
                    Your donation has been submitted successfully.
                  </p>
                  <div className="bg-white/20 rounded-lg p-3 inline-block">
                    <p className="text-xs text-green-200">Receipt Code:</p>
                    <p className="text-lg font-bold text-white">
                      {receiptCode}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {submissionStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-center"
                >
                  <h3 className="text-lg font-bold text-white mb-1">
                    Something went wrong
                  </h3>
                  <p className="text-red-100 text-sm">
                    Please try again or contact us if the problem persists.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
