"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import toast from "react-hot-toast";

const ministriesDefault = [];

export default function MinistriesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expandedName, setExpandedName] = useState("");
  const [ministries, setMinistries] = useState(ministriesDefault);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    congregation: "",
    ministry: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const cardsPerView = isMobile ? 1 : 4;
  const totalSlides = Math.ceil(ministries.length / cardsPerView);
  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministries/`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.ministries)) {
          setMinistries(data.ministries);
        } else {
          setMinistries([]);
        }
      } catch (e) {
        setMinistries([]);
      }
    };
    fetchMinistries();
    const id = setInterval(fetchMinistries, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (totalSlides > 1) {
      const interval = setInterval(() => {
        if (autoPlay) {
          setCurrentIndex((prev) => (prev + 1) % totalSlides);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, totalSlides]);

  // Ensure currentIndex is within bounds
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Validate phone number in real-time
  useEffect(() => {
    const phone = registrationForm.phone;
    if (phone === "") {
      setPhoneError("");
      return;
    }

    // Check if it starts with +233 or 0
    if (!phone.startsWith("+233") && !phone.startsWith("0")) {
      setPhoneError("Please enter correct index (+233 or 0)");
      return;
    }

    // Check length (10 digits for 0 prefix, 13 for +233)
    if (phone.startsWith("0") && phone.length !== 10) {
      setPhoneError("Phone number should be 10 digits");
      return;
    }

    if (phone.startsWith("+233") && phone.length !== 13) {
      setPhoneError("Phone number with +233 should be 13 digits");
      return;
    }

    // If we get here, the phone number is valid
    setPhoneError("");
  }, [registrationForm.phone]);

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    // Check if there's a phone error
    if (phoneError) {
      return;
    }

    // Validate phone number format one more time
    const phoneRegex = /^(\+233|0)\d{9}$/;
    if (!phoneRegex.test(registrationForm.phone)) {
      setPhoneError("Please enter a valid Ghana phone number");
      return;
    }

    // Show confirmation modal instead of direct submission
    setShowConfirmModal(true);
  };

  const confirmRegistration = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/ministry/register/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: registrationForm.name,
            email: registrationForm.email,
            phone: registrationForm.phone,
            ministry: registrationForm.ministry,
            congregation: registrationForm.congregation,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.error
            ? JSON.stringify(data.error)
            : data.message || "Failed to submit"
        );
      }

      // Close both modals
      setShowRegistrationModal(false);
      setShowConfirmModal(false);

      // Reset form
      setRegistrationForm({
        name: "",
        email: "",
        phone: "",
        congregation: "",
        ministry: "",
      });

      // Show success toast
      toast.success(
        "Registration submitted successfully! Our team will contact you soon."
      );

      // Notify dashboard to refresh (cross-tab/window)
      try {
        const channel = new BroadcastChannel("ypg_ministry");
        channel.postMessage({ type: "registration_created" });
        channel.close();
      } catch (e) {
        // no-op: BroadcastChannel may not be supported
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("Error submitting registration. Please try again.");
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getVisibleItems = () => {
    const start = currentIndex * cardsPerView;
    const end = start + cardsPerView;
    const items = ministries.slice(start, end);

    // Ensure we always return at least one item, even if it's the last one
    if (items.length === 0 && ministries.length > 0) {
      return [ministries[ministries.length - 1]];
    }

    return items;
  };

  const toggleMinistryExpansion = (ministryName) => {
    setExpandedName((prev) => (prev === ministryName ? "" : ministryName));
  };

  const getTruncatedDescription = (description, isExpanded) => {
    if (isExpanded) return description;
    return description.length > 80
      ? description.substring(0, 80) + "..."
      : description;
  };

  return (
    <section
      id="ministries"
      className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-blue-400 mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-purple-400 mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="text-lg font-medium text-blue-600 bg-blue-100 px-4 py-1 rounded-full">
              Find Your Calling
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Our <span className="text-blue-600">Ministries</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Discover where you belong and grow your gifts while serving God and
            community
          </motion.p>
        </div>

        <div className="relative">
          <button
            onClick={prevSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-blue-100 transition"
          >
            <span className="text-blue-600 font-bold">‹</span>
          </button>

          <button
            onClick={nextSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-blue-100 transition"
          >
            <span className="text-blue-600 font-bold">›</span>
          </button>

          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div
                  className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-8 px-6 items-start`}
                >
                  {getVisibleItems().map((ministry, idx) => (
                    <motion.div
                      key={`${currentIndex}-${ministry.name}-${idx}`}
                      className="relative group overflow-hidden rounded-2xl shadow-lg bg-white self-start"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${ministry.color} p-0.5 rounded-2xl`}
                      ></div>

                      <div className="relative bg-white rounded-[calc(1rem-2px)] p-6 h-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {ministry.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {getTruncatedDescription(
                            ministry.description,
                            expandedName === ministry.name
                          )}
                        </p>
                        {(ministry.leader_name || ministry.leader_phone) && (
                          <div className="text-sm text-gray-500 space-y-1 mb-8">
                            {ministry.leader_name && (
                              <p>
                                <span className="font-medium">Leader:</span>{" "}
                                {ministry.leader_name}
                              </p>
                            )}
                            {ministry.leader_phone && (
                              <p>
                                <span className="font-medium">Phone:</span>{" "}
                                {ministry.leader_phone}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="absolute bottom-4 left-6">
                          <button
                            onClick={() =>
                              toggleMinistryExpansion(ministry.name)
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                          >
                            {expandedName === ministry.name
                              ? "Read Less"
                              : "Read More"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                                expandedName === ministry.name
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <motion.div
          className="mt-20 bg-white rounded-2xl shadow-lg p-8 md:p-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Join?
            </h3>
            <p className="text-blue-600 font-medium">
              Find purpose, community and growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Why Join?
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Develop your God-given talents</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Build lifelong friendships</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Gain leadership experience</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Serve your community meaningfully</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                How to Join
              </h4>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li>Attend any of our weekly meetings</li>
                <li>Speak to the ministry leader</li>
                <li>Complete a simple registration form</li>
                <li>Start attending practices/meetings</li>
              </ol>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  onClick={() => setShowRegistrationModal(true)}
                >
                  Register Interest
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Registration Modal */}
      <Transition.Root show={showRegistrationModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={setShowRegistrationModal}
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
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 mb-4"
                  >
                    Ministry Registration
                  </Dialog.Title>
                  <form
                    onSubmit={handleRegistrationSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={registrationForm.name}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={registrationForm.email}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 ${
                          phoneError ? "border-red-500" : "border-gray-300"
                        }`}
                        value={registrationForm.phone}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+233XXXXXXXXX or 0XXXXXXXXX"
                      />
                      {phoneError ? (
                        <p className="text-xs text-red-500 mt-1">
                          {phoneError}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Please enter a valid Ghana phone number
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Congregation
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={registrationForm.congregation}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            congregation: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ministry of Interest
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={registrationForm.ministry}
                        onChange={(e) =>
                          setRegistrationForm({
                            ...registrationForm,
                            ministry: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a ministry</option>
                        {ministries.map((ministry, index) => (
                          <option key={index} value={ministry.name}>
                            {ministry.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        onClick={() => setShowRegistrationModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      >
                        Submit Registration
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Confirmation Modal */}
      <Transition.Root show={showConfirmModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowConfirmModal(false)}
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
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center mb-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 text-center mb-2"
                  >
                    Confirm Registration
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 text-center">
                      Are you sure you want to submit your ministry
                      registration? Our team will contact you soon.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                      onClick={confirmRegistration}
                    >
                      Confirm Registration
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </section>
  );
}
