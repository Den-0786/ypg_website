"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { quizAPI } from "../../../utils/api";
import toast from "react-hot-toast";

export default function QuizAccess() {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [participantInfo, setParticipantInfo] = useState({
    name: "",
    phone_number: "",
    congregation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveQuiz();
  }, []);

  const fetchActiveQuiz = async () => {
    try {
      setLoading(true);
      const result = await quizAPI.getActiveQuiz();
      
      if (result.success) {
        const data = result.data;
        if (data.success && data.quiz) {
          setActiveQuiz(data.quiz);
        } else {
          setError("No active quiz available at the moment.");
        }
      } else {
        setError("Failed to fetch quiz information.");
      }
    } catch (error) {
      console.error("Error fetching active quiz:", error);
      setError("Failed to connect to quiz server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === activeQuiz.password) {
      setShowQuiz(true);
      setError("");
      toast.success("Password correct! Quiz interface opened.");
    } else {
      setError("Incorrect password. Please try again.");
      toast.error("Incorrect password. Please try again.");
    }
  };

  const handleQuizSubmit = async () => {
    if (
      !participantInfo.name ||
      !participantInfo.phone_number ||
      !participantInfo.congregation ||
      !selectedAnswer
    ) {
      setError("Please fill in all fields and select an answer.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const result = await quizAPI.submitQuiz({
        quiz_id: activeQuiz.id,
        name: participantInfo.name,
        phone_number: participantInfo.phone_number,
        congregation: participantInfo.congregation,
        selected_answer: selectedAnswer,
      });

      if (result.success) {
        const data = result.data;

      if (data.success) {
        toast.success("Quiz submitted successfully! Results will be available after the quiz ends.");
        setShowQuiz(false); // Close the quiz interface
      } else {
        setError(data.error || "Failed to submit quiz.");
        toast.error(data.error || "Failed to submit quiz.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Failed to submit quiz. Please try again.");
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setSelectedAnswer("");
    setParticipantInfo({ name: "", phone_number: "", congregation: "" });
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!activeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Active Quiz
          </h2>
          <p className="text-gray-600">
            There is no active quiz available at the moment.
          </p>
        </div>
      </div>
    );
  }



  if (!showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Quiz Access
            </h2>
            <p className="text-gray-600">Enter the quiz password to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter quiz password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              onClick={handlePasswordSubmit}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Access Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {activeQuiz.title}
            </h1>
            {activeQuiz.description && (
              <p className="text-gray-600">{activeQuiz.description}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Participant Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={participantInfo.name}
                  onChange={(e) =>
                    setParticipantInfo({
                      ...participantInfo,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={participantInfo.phone_number}
                  onChange={(e) =>
                    setParticipantInfo({
                      ...participantInfo,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Congregation *
                </label>
                <input
                  type="text"
                  value={participantInfo.congregation}
                  onChange={(e) =>
                    setParticipantInfo({
                      ...participantInfo,
                      congregation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your congregation"
                />
              </div>
            </div>

            {/* Quiz Question */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Question:
              </h3>
              <p className="text-gray-700 mb-6">{activeQuiz.question}</p>

              <div className="space-y-3">
                {[
                  { key: "A", text: activeQuiz.option_a },
                  { key: "B", text: activeQuiz.option_b },
                  { key: "C", text: activeQuiz.option_c },
                  { key: "D", text: activeQuiz.option_d },
                ].map((option) => (
                  <div
                    key={option.key}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAnswer === option.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAnswer(option.key)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          selectedAnswer === option.key
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswer === option.key && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="font-medium mr-2">{option.key}.</span>
                      <span>{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleQuizSubmit}
                disabled={
                  isSubmitting ||
                  !participantInfo.name ||
                  !participantInfo.phone_number ||
                  !participantInfo.congregation ||
                  !selectedAnswer
                }
                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                  isSubmitting ||
                  !participantInfo.name ||
                  !participantInfo.phone_number ||
                  !participantInfo.congregation ||
                  !selectedAnswer
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
