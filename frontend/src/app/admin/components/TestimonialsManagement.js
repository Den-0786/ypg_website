import { useState } from "react";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Clock,
  User,
  Phone,
  Building,
  FileText,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import toast from "react-hot-toast";

const TestimonialsManagement = ({
  testimonials = [],
  setTestimonials,
  theme,
}) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyNotes, setDenyNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter testimonials by status
  const pendingTestimonials = testimonials.filter(
    (t) => t.status === "pending"
  );
  const approvedTestimonials = testimonials.filter(
    (t) => t.status === "approved"
  );
  const deniedTestimonials = testimonials.filter((t) => t.status === "denied");

  const handleViewTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowViewModal(true);
  };

  const handleApproveTestimonial = async (testimonialId) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/testimonials/${testimonialId}/approve/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setTestimonials(
          testimonials.map((t) =>
            t.id === testimonialId
              ? { ...t, status: "approved", is_active: true }
              : t
          )
        );

        // Trigger refresh on main website
        if (window.refreshTestimonials) {
          window.refreshTestimonials();
        }

        toast.success("Testimonial approved successfully!");
        setShowViewModal(false);
      } else {
        toast.error("Failed to approve testimonial");
      }
    } catch (error) {
      console.error("Error approving testimonial:", error);
      toast.error("Failed to approve testimonial");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDenyTestimonial = async (testimonialId) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/testimonials/${testimonialId}/deny/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ admin_notes: denyNotes }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setTestimonials(
          testimonials.map((t) =>
            t.id === testimonialId
              ? {
                  ...t,
                  status: "denied",
                  is_active: false,
                  admin_notes: denyNotes,
                }
              : t
          )
        );

        // Trigger refresh on main website
        if (window.refreshTestimonials) {
          window.refreshTestimonials();
        }

        toast.success("Testimonial denied");
        setShowDenyModal(false);
        setShowViewModal(false);
        setDenyNotes("");
      } else {
        toast.error("Failed to deny testimonial");
      }
    } catch (error) {
      console.error("Error denying testimonial:", error);
      toast.error("Failed to deny testimonial");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/testimonials/${testimonialId}/delete/`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setTestimonials(testimonials.filter((t) => t.id !== testimonialId));

        // Trigger refresh on main website
        if (window.refreshTestimonials) {
          window.refreshTestimonials();
        }

        toast.success("Testimonial deleted successfully!");
        setShowDeleteModal(false);
        setShowViewModal(false);
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        text: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        iconClassName: "text-yellow-600",
      },
      approved: {
        icon: CheckCircle,
        text: "Approved",
        className: "bg-green-100 text-green-800 border-green-200",
        iconClassName: "text-green-600",
      },
      denied: {
        icon: XCircle,
        text: "Denied",
        className: "bg-red-100 text-red-800 border-red-200",
        iconClassName: "text-red-600",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon className={`w-3 h-3 ${config.iconClassName}`} />
        {config.text}
      </span>
    );
  };

  const TestimonialCard = ({ testimonial }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={
              testimonial.image
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}${testimonial.image}`
                : "/placeholder-item.jpg"
            }
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h3
              className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {testimonial.name}
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {testimonial.congregation}
            </p>
          </div>
        </div>
        {getStatusBadge(testimonial.status)}
      </div>

      <p
        className={`text-sm mb-3 line-clamp-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
      >
        {testimonial.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone className="w-3 h-3" />
          {testimonial.phone}
        </div>
        <button
          onClick={() => handleViewTestimonial(testimonial)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <Eye className="w-3 h-3 inline mr-1" />
          View
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Testimonials Management
          </h2>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Review and manage member testimonials
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`rounded-lg border p-4 ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {pendingTestimonials.length}
              </p>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Pending Review
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {approvedTestimonials.length}
              </p>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Approved
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {deniedTestimonials.length}
              </p>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Denied
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Testimonials */}
      {pendingTestimonials.length > 0 && (
        <div>
          <h3
            className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Pending Review ({pendingTestimonials.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      )}

      {/* Approved Testimonials */}
      {approvedTestimonials.length > 0 && (
        <div>
          <h3
            className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Approved ({approvedTestimonials.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      )}

      {/* Denied Testimonials */}
      {deniedTestimonials.length > 0 && (
        <div>
          <h3
            className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Denied ({deniedTestimonials.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deniedTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3
            className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            No Testimonials Yet
          </h3>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Testimonials submitted by members will appear here for review.
          </p>
        </div>
      )}

      {/* View Testimonial Modal */}
      <Transition.Root show={showViewModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowViewModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-2xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  {selectedTestimonial && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <Dialog.Title
                          as="h3"
                          className={`text-xl font-semibold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Testimonial Review
                        </Dialog.Title>
                        {getStatusBadge(selectedTestimonial.status)}
                      </div>

                      <div className="space-y-6">
                        {/* Testimonial Details */}
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              selectedTestimonial.image
                                ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}${selectedTestimonial.image}`
                                : "/placeholder-item.jpg"
                            }
                            alt={selectedTestimonial.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1">
                            <h4
                              className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                            >
                              {selectedTestimonial.name}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <Building className="w-4 h-4 inline mr-2" />
                                {selectedTestimonial.congregation}
                              </p>
                              <p>
                                <Phone className="w-4 h-4 inline mr-2" />
                                {selectedTestimonial.phone}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Testimonial Content */}
                        <div>
                          <h5
                            className={`font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                          >
                            Testimonial
                          </h5>
                          <p
                            className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {selectedTestimonial.content}
                          </p>
                        </div>

                        {/* Admin Notes (if denied) */}
                        {selectedTestimonial.status === "denied" &&
                          selectedTestimonial.admin_notes && (
                            <div
                              className={`p-3 rounded-lg ${theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border`}
                            >
                              <h5
                                className={`font-medium mb-1 ${theme === "dark" ? "text-red-400" : "text-red-800"}`}
                              >
                                Admin Notes
                              </h5>
                              <p
                                className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}
                              >
                                {selectedTestimonial.admin_notes}
                              </p>
                            </div>
                          )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Delete
                          </button>

                          {selectedTestimonial.status === "pending" && (
                            <>
                              <button
                                onClick={() => setShowDenyModal(true)}
                                className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
                              >
                                <XCircle className="w-4 h-4 inline mr-2" />
                                Deny
                              </button>
                              <button
                                onClick={() =>
                                  handleApproveTestimonial(
                                    selectedTestimonial.id
                                  )
                                }
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                {isProcessing ? "Processing..." : "Approve"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Deny Modal */}
      <Transition.Root show={showDenyModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDenyModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${theme === "dark" ? "bg-red-900/30" : "bg-red-100"}`}
                    >
                      <XCircle
                        className={`w-5 h-5 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
                      />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Deny Testimonial
                    </Dialog.Title>
                  </div>

                  <p
                    className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Please provide a reason for denying this testimonial:
                  </p>

                  <textarea
                    value={denyNotes}
                    onChange={(e) => setDenyNotes(e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Enter reason for denial..."
                  />

                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => setShowDenyModal(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handleDenyTestimonial(selectedTestimonial?.id)
                      }
                      disabled={isProcessing || !denyNotes.trim()}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Processing..." : "Deny Testimonial"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDeleteModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } border`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${theme === "dark" ? "bg-red-900/30" : "bg-red-100"}`}
                    >
                      <Trash2
                        className={`w-5 h-5 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
                      />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Delete Testimonial
                    </Dialog.Title>
                  </div>

                  <p
                    className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Are you sure you want to delete this testimonial? This
                    action cannot be undone.
                  </p>

                  {selectedTestimonial && (
                    <div
                      className={`rounded-lg p-3 mb-6 ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        From: {selectedTestimonial.name}
                      </p>
                      <p
                        className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Congregation: {selectedTestimonial.congregation}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteTestimonial(selectedTestimonial?.id)
                      }
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Deleting..." : "Delete Testimonial"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default TestimonialsManagement;
