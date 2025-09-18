/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { donationAPI } from "../../../utils/api";

export default function DonateSection() {
  const [formData, setFormData] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: "",
    paymentMethod: "",
    purpose: "General Fund",
    message: "",
  });
  const [selectedAmount, setSelectedAmount] = useState("");
  const [showMomoInstructions, setShowMomoInstructions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [receiptCode, setReceiptCode] = useState("");
  const [verificationFields, setVerificationFields] = useState({
    momoTransactionId: "",
    cashReceiptNumber: "",
    bankReference: "",
  });

  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError("");
      return true;
    }

    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/\s+/g, "");

    // Check if starts with 0 or +233
    if (!cleanPhone.startsWith("0") && !cleanPhone.startsWith("+233")) {
      setPhoneError("Number must start with 0 or +233");
      return false;
    }

    // Check length (10 digits for local, 13 for international)
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

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setFormData((prev) => ({ ...prev, phone }));
    validatePhone(phone);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, email }));
    validateEmail(email);
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setFormData((prev) => ({ ...prev, amount: amount }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    setShowMomoInstructions(method === "momo");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields before submission
    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);

    if (!isPhoneValid || !isEmailValid) {
      return; // Don't submit if validation fails
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
          setReceiptCode(data.receipt_code);
          setSubmissionStatus("success");
          // Reset form
          setFormData({
            donorName: "",
            email: "",
            phone: "",
            amount: "",
            paymentMethod: "",
            purpose: "General Fund",
            message: "",
          });
          setSelectedAmount("");
          setVerificationFields({
            momoTransactionId: "",
            cashReceiptNumber: "",
            bankReference: "",
          });
          // Clear validation errors
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

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    // This would be handled by admin verification in real implementation
    alert(
      "Verification submitted. Admin will review and confirm your payment."
    );
  };

  return (
    <section
      id="donate"
      className="py-16 px-4 bg-gradient-to-br from-blue-50 to-white"
    >
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-800">
          Transform Lives Through Your Generosity
        </h2>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Your donation directly supports youth ministries, outreach programs,
          and spiritual growth initiatives.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-5"
        >
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Full Name*
            </label>
            <input
              type="text"
              placeholder="Your Name"
              required
              value={formData.donorName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, donorName: e.target.value }))
              }
              className="w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Email*
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              required
              value={formData.email}
              onChange={handleEmailChange}
              className="w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              placeholder="+233 XX XXX XXXX"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Amount (GHS)*
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[5, 10, 20, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount.toString())}
                  className={`py-2 rounded-lg transition ${
                    selectedAmount === amount.toString()
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                  }`}
                >
                  GHS {amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Other amount"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              GHS 50 provides Bibles for 2 youth members
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Payment Method*
            </label>
            <select
              className="w-full rounded-xl text-gray-800 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            >
              <option value="">Select method</option>
              <option value="momo">Mobile Money</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>

            {/* Mobile Money Instructions */}
            {showMomoInstructions && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>To pay:</strong> Dial *170# → Choose &apos;Mobile
                  Money&apos; → Select &apos;Pay Bill&apos;
                </p>
                <div className="hidden lg:flex justify-center gap-4 mt-2">
                  <img src="/mobile/mtn.png" alt="MTN" className="h-6" />
                  <img
                    src="/mobile/telecel.png"
                    alt="Vodafone"
                    className="h-6"
                  />
                  <img
                    src="/mobile/airteltigo.png"
                    alt="AirtelTigo"
                    className="h-6"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Purpose
            </label>
            <select
              value={formData.purpose}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purpose: e.target.value }))
              }
              className="w-full rounded-xl text-gray-700 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="General Fund">General Fund</option>
              <option value="Youth Ministry">Youth Ministry</option>
              <option value="Building Fund">Building Fund</option>
              <option value="Event Sponsorship">Event Sponsorship</option>
              <option value="Bible Study Materials">Others</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="recurring" className="mr-2" />
            <label htmlFor="recurring" className="text-sm text-gray-700">
              Make this a monthly donation
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition duration-300 hover:scale-[1.02]"
          >
            {isSubmitting ? "Submitting..." : "Submit Donation"}
          </button>

          <p className="text-xs text-gray-500 text-center flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 inline-block mr-1"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clipRule="evenodd"
              />
            </svg>
            100% Secure Donations | SSL Encrypted
          </p>

          {/* Success Message */}
          {submissionStatus === "success" && (
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="text-green-700 font-bold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
                Donation Submitted Successfully!
              </h3>
              <p className="text-green-600 mt-1">
                Your receipt code: <strong>{receiptCode}</strong>
              </p>
              <p className="text-green-600 mt-1">
                Please complete payment and provide verification details below.
              </p>
            </div>
          )}

          {/* Error Message */}
          {submissionStatus === "error" && (
            <div className="bg-red-50 p-4 rounded-xl">
              <h3 className="text-red-700 font-bold">Submission Failed</h3>
              <p className="text-red-600 mt-1">
                Please try again or contact support.
              </p>
            </div>
          )}

          {/* Payment Verification Form */}
          {submissionStatus === "success" && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-3">
                Payment Verification
              </h4>
              <form onSubmit={handleVerificationSubmit} className="space-y-3">
                {formData.paymentMethod === "momo" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MoMo Transaction ID*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., MTN123456789"
                      value={verificationFields.momoTransactionId}
                      onChange={(e) =>
                        setVerificationFields((prev) => ({
                          ...prev,
                          momoTransactionId: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {formData.paymentMethod === "cash" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receipt Number*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CR001"
                      value={verificationFields.cashReceiptNumber}
                      onChange={(e) =>
                        setVerificationFields((prev) => ({
                          ...prev,
                          cashReceiptNumber: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {formData.paymentMethod === "bank" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Reference Number*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., BR001"
                      value={verificationFields.bankReference}
                      onChange={(e) =>
                        setVerificationFields((prev) => ({
                          ...prev,
                          bankReference: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm"
                >
                  Submit Verification
                </button>
              </form>
            </div>
          )}
        </form>

        {/* Treasurer Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-4">
            <img
              src="/mobile/akos.jpg"
              alt="Treasurer Priscilla Asante"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-300 mb-2"
            />
            <h3 className="text-xl font-bold text-blue-700">
              Need Help or Want to Pay?
            </h3>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium">Available 24/7</p>
                <p className="text-sm text-gray-600">Any day, any time</p>
              </div>
            </div>

            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-blue-600 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium">Treasurer</p>
                <p className="text-sm text-gray-600">Priscilla Asante</p>
              </div>
            </div>

            <a
              href="tel:+233541107445"
              className="flex items-center p-2 -mx-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-blue-600 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-blue-600 font-medium">
                +233 54 110 7445
              </span>
            </a>

            <a
              href="https://wa.me/233541107445"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 -mx-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-green-600 mr-2"
              >
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
              <span className="text-blue-600 font-medium">
                Chat on WhatsApp
              </span>
            </a>
          </div>

          <div className="mt-6 p-4 bg-white border border-dashed border-blue-300 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> For Mobile Money payments, please use your
              full name as reference.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm italic text-gray-600 mb-2">
              &quot;Seeing how our donations helped build the youth center was
              priceless!&quot;
            </p>
            <p className="text-sm font-medium text-gray-700">
              — Mr Bright Asenso., Donor since 2020
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
