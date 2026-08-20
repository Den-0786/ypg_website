/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { donationAPI, contactAPI } from "../../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  BookOpen,
  Smartphone,
  Building,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export default function DonateSection() {
  const [formData, setFormData] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: "",
    paymentMethod: "momo",
    purpose: "Youth Programs",
    message: "",
    isRecurring: false,
    recurringFrequency: "monthly",
    dedicationName: "",
    dedicationType: "",
    organizationName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [receiptCode, setReceiptCode] = useState("");
  const [impactStats, setImpactStats] = useState({
    youth_reached: 500,
    events_organized: 50,
    community_impact: 100,
  });
  const [paymentTab, setPaymentTab] = useState("momo");
  const [copiedText, setCopiedText] = useState("");

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
    { amount: 20 },
    { amount: 50 },
    { amount: 100 },
    { amount: 200 },
  ];

  const purposeOptions = [
    "Youth Programs",
    "Annual Events",
    "Evangelism & Outreach",
    "General Support",
  ];

  const momoDetails = {
    number: "0541107445",
    name: "YPG District",
    networks: ["MTN", "Telecel", "AT"],
  };

  const bankDetails = {
    bank: "GCB Bank",
    accountNumber: "1234567890",
    accountName: "Youth Prayer Group",
    branch: "Ahinsan",
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

  const handlePaymentMethodChange = (method) => {
    setPaymentTab(method);
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
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
          }

          // Submit contact message to admin
          if (formData.message) {
            try {
              await contactAPI.submitContact({
                name: formData.donorName || "Anonymous",
                email: formData.email || "",
                subject: `Donation Message - ${formData.purpose}`,
                message: `[Donation: GH₵ ${formData.amount}] ${formData.message}`,
                date: new Date().toISOString(),
              });
              if (window.refreshContactMessages) {
                window.refreshContactMessages();
              }
            } catch (err) {
              // Contact message submission is non-critical
            }
          }

          setReceiptCode(data.receipt_code);
          setSubmissionStatus("success");
          setFormData({
            donorName: "",
            email: "",
            phone: "",
            amount: "",
            paymentMethod: "",
            purpose: "Youth Programs",
            message: "",
            isRecurring: false,
            recurringFrequency: "monthly",
            dedicationName: "",
            dedicationType: "",
            organizationName: "",
          });
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Side - Donation Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 flex flex-col">
            {/* Header */}
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-950 mb-2">
              Want to support YPG?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-6">
              Help power our programs, events and our outreach activities kindly follow the steps below:
            </p>

            {/* Suggested Amounts */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-navy-950 mb-3">Suggested Amount</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {donationAmounts.map((item) => (
                  <motion.div
                    key={item.amount}
                    whileHover={{ scale: 1.05, y: -4, boxShadow: "0 8px 30px rgba(212,175,55,0.2)" }}
                    className="rounded-xl border-2 border-gray-200 bg-white p-4 text-center cursor-default transition-colors duration-200"
                  >
                    <span className="text-lg font-bold text-navy-950">GH₵ {item.amount}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-navy-950 mb-2">
                You can also enter a custom amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">GH₵</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="1"
                  className="w-full pl-16 pr-4 py-3 border-2 border-gray-200 rounded-xl text-xl font-bold text-navy-950 focus:border-gold-500 focus:ring-0 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Purpose Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-navy-950 mb-1">
                Select Purpose
              </label>
              <p className="text-xs text-gray-400 mb-2">use any of this as a payment purpose</p>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-navy-950 focus:border-gold-500 focus:ring-0 outline-none transition-colors bg-white appearance-none cursor-pointer"
              >
                {purposeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Helper Note */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Please make sure to enter your selected purpose as the reference/reason when authorizing your MoMo or bank payment.
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange("momo")}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${paymentTab === "momo" ? "bg-white text-navy-950 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Smartphone className="w-4 h-4 inline mr-2" />
                Mobile Money
              </button>
              <button
                type="button"
                onClick={() => handlePaymentMethodChange("bank")}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${paymentTab === "bank" ? "bg-white text-navy-950 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Building className="w-4 h-4 inline mr-2" />
                Bank Transfer
              </button>
            </div>

            {/* Payment Details */}
            <AnimatePresence mode="wait">
              {paymentTab === "momo" && (
                <motion.div
                  key="momo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">MoMo Number</p>
                        <p className="text-lg font-bold text-navy-950">{momoDetails.number}</p>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopyToClipboard(momoDetails.number, "momo")}
                        className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gold-300 transition-colors"
                      >
                        {copiedText === "momo" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </motion.button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Account Name</p>
                      <p className="text-base font-semibold text-navy-950">{momoDetails.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-2">Supported Networks</p>
                      <div className="flex gap-2">
                        {momoDetails.networks.map((network) => (
                          <span key={network} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-navy-950">{network}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentTab === "bank" && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                      <p className="text-base font-semibold text-navy-950">{bankDetails.bank}</p>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Account Number</p>
                        <p className="text-lg font-bold text-navy-950">{bankDetails.accountNumber}</p>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopyToClipboard(bankDetails.accountNumber, "bank")}
                        className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gold-300 transition-colors"
                      >
                        {copiedText === "bank" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </motion.button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Account Name</p>
                      <p className="text-base font-semibold text-navy-950">{bankDetails.accountName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Branch</p>
                      <p className="text-base font-semibold text-navy-950">{bankDetails.branch}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reference Callout */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mt-auto">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                <span className="font-bold">Important:</span> Use <span className="font-bold text-navy-950">{formData.purpose}</span> in your reference field when confirming transfer.
              </p>
            </div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {submissionStatus === "success" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-semibold">Donation Submitted Successfully!</p>
                      <p className="text-sm">Receipt Code: <span className="font-mono font-bold">{receiptCode}</span></p>
                    </div>
                  </div>
                </motion.div>
              )}
              {submissionStatus === "error" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    <p className="font-semibold">Something went wrong. Please try again.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Hero Card with Impact */}
          <div className="bg-gradient-to-b from-gold-500 to-gold-500 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Give to the <span className="text-blue-100">Youth</span>
              </h2>
              <p className="text-blue-50 mb-6 leading-relaxed">
                Support the next generation of Christian leaders through
                meaningful programs, events, and community outreach.
              </p>

              {/* Impact Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
