"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const ministries = [
  {
    name: "Y-Singers 🎤",
    description:
      "Youth choir focused on gospel music and worship leading. Our choir ministry provides opportunities for young people to develop their musical talents while leading the congregation in worship. We practice weekly and perform at various church events, youth programs, and special services throughout the year.",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Y-Jama Troop 🪘",
    description:
      "Cultural dance and traditional praise group showcasing Ghanaian heritage. This ministry celebrates our rich cultural traditions through dance, drumming, and traditional music. Members learn authentic Ghanaian dance moves, drumming techniques, and cultural expressions that honor our heritage while glorifying God.",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Choreography Group 💃",
    description:
      "Creative expression of worship through dance and movement. Our choreography team creates beautiful dance routines that enhance worship services and special events. We blend contemporary and traditional dance styles to create meaningful performances that touch hearts and glorify God.",
    color: "from-blue-500 to-teal-500",
  },
  {
    name: "Evangelism & Prayer Team 🙏",
    description:
      "Leads outreach, prayer meetings, and spiritual growth programs. This ministry is dedicated to spreading the gospel and building spiritual maturity. We organize street evangelism, prayer walks, Bible study sessions, and discipleship programs to help young people grow in their faith.",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Y-Media 🎥",
    description:
      "Manages visual content, social media, and church media coverage. Our media team handles photography, videography, live streaming, and social media management. We document church events, create promotional content, and maintain our online presence to reach more people with our message.",
    color: "from-red-500 to-rose-500",
  },
  {
    name: "Dancing Group 🕺",
    description:
      "Contemporary dance ministry expressing joy and praise through movement. We use modern dance styles to express worship and praise in creative ways. Our performances combine energy, creativity, and spiritual meaning to engage audiences and glorify God through movement.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    name: "Ushering Wing 👥",
    description:
      "Welcomes and guides worshippers, maintains order during services. Our ushering team ensures smooth and organized church services by welcoming members, managing seating arrangements, collecting offerings, and maintaining order. We create a welcoming atmosphere for all worshippers.",
    color: "from-emerald-500 to-green-600",
  },
  {
    name: "Youth Bible Study 📖",
    description:
      "Deep dive into scripture, theological discussions, and spiritual growth. Our Bible study ministry provides in-depth study of God's Word through interactive sessions, group discussions, and practical applications. We explore various topics, books of the Bible, and contemporary issues from a biblical perspective.",
    color: "from-orange-500 to-red-500",
  },
];

export default function MinistriesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [expandedMinistries, setExpandedMinistries] = useState({});
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    phone: "",
    congregation: "",
    ministry: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const cardsPerView = isMobile ? 1 : 4;
  const totalSlides = Math.ceil(ministries.length / cardsPerView);

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

    try {
      // In a real implementation, this would send data to your API
      // For now, we'll just simulate a successful submission
      console.log("Submitting registration:", registrationForm);

      // Show success message by closing modal and showing a success message
      setShowRegistrationModal(false);

      // Reset form
      setRegistrationForm({
        name: "",
        phone: "",
        congregation: "",
        ministry: "",
      });

      // Show success message (you could implement a better notification system)
      alert(
        "Registration submitted successfully! Our team will contact you soon."
      );
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Error submitting registration. Please try again.");
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
    setExpandedMinistries((prev) => ({
      ...prev,
      [ministryName]: !prev[ministryName],
    }));
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
            <ChevronLeft className="w-6 h-6 text-blue-600" />
          </button>

          <button
            onClick={nextSlide}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-blue-100 transition"
          >
            <ChevronRight className="w-6 h-6 text-blue-600" />
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
                  className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-8 px-6`}
                >
                  {getVisibleItems().map((ministry, idx) => (
                    <motion.div
                      key={`${currentIndex}-${ministry.name}-${idx}`}
                      className="relative group overflow-hidden rounded-2xl shadow-lg bg-white"
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
                            expandedMinistries[ministry.name]
                          )}
                        </p>

                        <div className="absolute bottom-4 left-6">
                          <button
                            onClick={() =>
                              toggleMinistryExpansion(ministry.name)
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                          >
                            {expandedMinistries[ministry.name]
                              ? "Read Less"
                              : "Read More"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
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
    </section>
  );
}
