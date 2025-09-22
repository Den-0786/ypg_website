"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Building, FileText, Camera, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TestimonialSubmissionForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    congregation: "",
    content: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.congregation.trim()) {
      newErrors.congregation = "Congregation is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Testimonial content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("congregation", formData.congregation);
      formDataToSend.append("content", formData.content);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/testimonials/submit/`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Testimonial Submitted!
              </p>
              <p className="text-sm text-gray-600">
                Your testimonial is pending review and will be published once
                approved.
              </p>
            </div>
          </div>,
          {
            duration: 6000,
            position: "top-center",
            style: {
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
          }
        );

        // Reset form
        setFormData({
          name: "",
          phone: "",
          congregation: "",
          content: "",
          image: null,
        });
        onClose();
      } else {
        toast.error(
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Submission Failed</p>
              <p className="text-sm text-gray-600">
                Please try again or contact us directly.
              </p>
            </div>
          </div>,
          {
            duration: 5000,
            position: "top-center",
            style: {
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Share your experience with YPG! Your testimonial will be reviewed before
        being published.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Congregation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Congregation *
            </label>
            <input
              type="text"
              name="congregation"
              value={formData.congregation}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                errors.congregation ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your congregation"
            />
            {errors.congregation && (
              <p className="text-red-500 text-sm mt-1">{errors.congregation}</p>
            )}
          </div>
        </div>

        {/* Testimonial Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Your Testimonial *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none ${
              errors.content ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Share your experience with YPG. Tell us how it has impacted your life, what you've learned, or how it has helped you grow spiritually..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {formData.content.length} characters
            </p>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-2" />
            Photo (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <Camera className="w-5 h-5 mr-2 text-gray-500" />
              Choose Photo
            </label>
            {formData.image && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {formData.image.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: null }))
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Testimonial"}
          </motion.button>
        </div>
      </form>

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 5000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      />
    </div>
  );
}
