"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdvertisementForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    advertiser_name: "",
    advertiser_contact: "",
    advertiser_email: "",
    location: "",
    is_member: false,
    member_congregation: "",
    price_type: "fixed",
    price_fixed: "",
    price_min: "",
    price_max: "",
    images: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [contactWarning, setContactWarning] = useState("");

  const categories = [
    { value: "food", label: "Food & Catering" },
    { value: "fashion", label: "Fashion & Beauty" },
    { value: "technology", label: "Technology" },
    { value: "education", label: "Education & Training" },
    { value: "health", label: "Health & Wellness" },
    { value: "automotive", label: "Automotive" },
    { value: "real_estate", label: "Real Estate" },
    { value: "services", label: "Services" },
    { value: "other", label: "Other" },
  ];

  const validateContact = (contactValue) => {
    if (!contactValue.trim()) {
      return "Contact number is required";
    }

    // Split by "/" to handle multiple numbers
    const numbers = contactValue
      .split("/")
      .map((num) => num.trim())
      .filter((num) => num.length > 0);

    if (numbers.length === 0) {
      return "Please enter at least one contact number";
    }

    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];

      // Remove spaces for validation but keep original for display
      const numberWithoutSpaces = number.replace(/\s/g, "");

      // Check if number starts with +233 or 0
      if (
        !numberWithoutSpaces.startsWith("+233") &&
        !numberWithoutSpaces.startsWith("0")
      ) {
        return `Number ${i + 1}: Must start with +233 or 0`;
      }

      // Check length for each number (without spaces)
      if (
        numberWithoutSpaces.startsWith("0") &&
        numberWithoutSpaces.length !== 10
      ) {
        return `Number ${i + 1}: Must be exactly 10 digits (e.g., 0541107445)`;
      }

      if (
        numberWithoutSpaces.startsWith("+233") &&
        numberWithoutSpaces.length !== 13
      ) {
        return `Number ${i + 1}: Must be exactly 13 digits (e.g., +233241234567)`;
      }

      // Check if it's only digits after +233 or 0 (excluding spaces)
      const digitsOnly = numberWithoutSpaces.startsWith("+233")
        ? numberWithoutSpaces.substring(4)
        : numberWithoutSpaces.substring(1);
      if (!/^\d+$/.test(digitsOnly)) {
        return `Number ${i + 1}: Must contain only digits after the prefix`;
      }
    }

    // Check if there's a "/" but no second number
    if (contactValue.includes("/")) {
      const parts = contactValue.split("/");
      if (parts.length > 1 && parts[parts.length - 1].trim() === "") {
        return "Please complete the second contact number after '/'";
      }
    }

    return null; // No error
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return null; // Email is optional
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const validateForm = () => {
    const errors = {};

    // Validate contact
    const contactError = validateContact(formData.advertiser_contact);
    if (contactError) {
      errors.advertiser_contact = contactError;
    }

    // Check character limit
    if (formData.advertiser_contact.length > 30) {
      errors.advertiser_contact = "Contact field cannot exceed 30 characters";
    }

    // Validate email
    const emailError = validateEmail(formData.advertiser_email);
    if (emailError) {
      errors.advertiser_email = emailError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Add all form fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("advertiser_name", formData.advertiser_name);
      formDataToSend.append("advertiser_contact", formData.advertiser_contact);
      formDataToSend.append(
        "advertiser_email",
        formData.advertiser_email || ""
      );
      formDataToSend.append("location", formData.location);
      formDataToSend.append("is_member", formData.is_member);
      formDataToSend.append(
        "member_congregation",
        formData.member_congregation || ""
      );
      formDataToSend.append("price_type", formData.price_type);
      formDataToSend.append("price_fixed", formData.price_fixed || "");
      formDataToSend.append("price_min", formData.price_min || "");
      formDataToSend.append("price_max", formData.price_max || "");

      // Add images
      formData.images.forEach((file, index) => {
        formDataToSend.append(`image_${index}`, file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/advertisements/create/`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Advertisement submitted successfully! Admin will review and approve."
        );
        setFormData({
          title: "",
          description: "",
          category: "",
          advertiser_name: "",
          advertiser_contact: "",
          advertiser_email: "",
          location: "",
          is_member: false,
          member_congregation: "",
          price_type: "fixed",
          price_fixed: "",
          price_min: "",
          price_max: "",
          images: [],
        });
        onClose();
        if (onSubmit) onSubmit();
      } else {
        // Handle different error formats with more specific messages
        let errorMessage = "Failed to submit advertisement. Please try again.";

        if (typeof data.error === "string") {
          errorMessage = data.error;
        } else if (data.error && typeof data.error === "object") {
          // Handle validation errors - show the first error found
          const errorKeys = Object.keys(data.error);
          if (errorKeys.length > 0) {
            const firstError = data.error[errorKeys[0]];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = `Validation Error: ${firstError[0]}`;
            } else if (typeof firstError === "string") {
              errorMessage = `Validation Error: ${firstError}`;
            }
          }
        }

        // Show specific error messages for common issues
        if (errorMessage.includes("advertiser_contact")) {
          errorMessage =
            "Please check your contact number format. Use +233XXXXXXXXX or 0XXXXXXXXX format.";
        } else if (errorMessage.includes("advertiser_email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (errorMessage.includes("title")) {
          errorMessage = "Please enter a valid advertisement title.";
        } else if (errorMessage.includes("description")) {
          errorMessage = "Please provide a description for your advertisement.";
        } else if (errorMessage.includes("category")) {
          errorMessage = "Please select a category for your advertisement.";
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting advertisement:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Real-time validation for specific fields
    if (name === "advertiser_contact") {
      const error = validateContact(value);
      setValidationErrors((prev) => ({
        ...prev,
        advertiser_contact: error,
      }));

      // Check character count and show warning
      if (value.length >= 30) {
        setContactWarning(
          `Error: Maximum 30 characters allowed. You have ${value.length} characters.`
        );
      } else {
        setContactWarning("");
      }
    } else if (name === "advertiser_email") {
      const error = validateEmail(value);
      setValidationErrors((prev) => ({
        ...prev,
        advertiser_email: error,
      }));
    } else {
      // Clear validation error for other fields when user starts typing
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Submit Advertisement</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <p className="text-blue-100 mt-2">
                Promote your product or service to the YPG community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advertisement Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter advertisement title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product or service"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="advertiser_name"
                    value={formData.advertiser_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="advertiser_contact"
                    value={formData.advertiser_contact}
                    onChange={handleChange}
                    maxLength="30"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.advertiser_contact
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="+233 XX XXX XXXX or 0XX XXX XXXX / +233 XX XXX XXXX"
                  />
                  {validationErrors.advertiser_contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.advertiser_contact}
                    </p>
                  )}
                  {contactWarning && (
                    <p
                      className={`text-xs mt-1 ${
                        contactWarning.includes("Error")
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {contactWarning}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="advertiser_email"
                    value={formData.advertiser_email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.advertiser_email
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="your@email.com"
                  />
                  {validationErrors.advertiser_email && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.advertiser_email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Region"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="is_member"
                    checked={formData.is_member}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Are you a YPG member? (Members get discounted rates!)
                  </label>
                </div>

                {formData.is_member && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Congregation
                    </label>
                    <input
                      type="text"
                      name="member_congregation"
                      value={formData.member_congregation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your congregation name"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing *
                </label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="price_type"
                        value="fixed"
                        checked={formData.price_type === "fixed"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Fixed Price
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="price_type"
                        value="range"
                        checked={formData.price_type === "range"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Price Range
                      </span>
                    </label>
                  </div>

                  {formData.price_type === "fixed" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                        $
                      </span>
                      <input
                        type="number"
                        name="price_fixed"
                        value={formData.price_fixed}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                          $
                        </span>
                        <input
                          type="number"
                          name="price_min"
                          value={formData.price_min}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Min price"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                          $
                        </span>
                        <input
                          type="number"
                          name="price_max"
                          value={formData.price_max}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Max price"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Images (Max 4) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition">
                  <span className="text-2xl text-gray-400 mx-auto mb-2">
                    📤
                  </span>
                  <p className="text-xs text-gray-600 mb-2">
                    Upload images of your product/service
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...newFiles].slice(0, 4),
                      }));
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer text-sm"
                  >
                    Choose Images
                  </label>
                  {formData.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">
                        Selected: {formData.images.length}/4 image(s)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {formData.images.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            <span className="truncate max-w-20">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                              }}
                              className="ml-1 text-red-600 hover:text-red-800 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Advertisement"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
