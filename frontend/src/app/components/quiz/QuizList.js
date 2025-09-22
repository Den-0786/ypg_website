"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Timer,
  Calendar,
  Play,
  Sparkles,
} from "lucide-react";
import { quizAPI } from "../../../utils/api";
import toast from "react-hot-toast";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const result = await quizAPI.getQuizzes();

      if (result.success) {
        const data = result.data;

        if (data.success) {
          const transformedQuizzes = data.quizzes.map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            description:
              quiz.description || "Test your knowledge and grow in faith",
            requiresPassword: true,
            password: quiz.password,
            endTime: quiz.end_time,
            participants: quiz.submissions_count,
            questions: 1,
            points: 100,
            type: quiz.is_currently_active
              ? "active"
              : quiz.has_ended
                ? "results"
                : "upcoming",
            question: quiz.question,
            optionA: quiz.option_a,
            optionB: quiz.option_b,
            optionC: quiz.option_c,
            optionD: quiz.option_d,
            correctAnswers: quiz.correct_submissions_count,
            wrongAnswers:
              quiz.submissions_count - quiz.correct_submissions_count,
            congregations: 5,
            totalParticipants: quiz.submissions_count,
            totalCorrect: quiz.correct_submissions_count,
            totalWrong: quiz.submissions_count - quiz.correct_submissions_count,
            totalCongregations: 5,
            totalQuizzes: data.quizzes.length,
            totalParticipants: data.quizzes.reduce(
              (sum, q) => sum + q.submissions_count,
              0
            ),
            totalCorrect: data.quizzes.reduce(
              (sum, q) => sum + q.correct_submissions_count,
              0
            ),
            totalWrong: data.quizzes.reduce(
              (sum, q) =>
                sum + (q.submissions_count - q.correct_submissions_count),
              0
            ),
            totalCongregations: 5,
          }));

          setQuizzes(transformedQuizzes);
        } else {
          console.error("Error fetching quizzes:", data.error);
          setError("Failed to load quizzes");
        }
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleQuizClick = (quiz) => {
    if (quiz.requiresPassword) {
      setSelectedQuiz(quiz);
      setShowPasswordModal(true);
    } else {
      console.log("Quiz clicked:", quiz);
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedQuiz && password === selectedQuiz.password) {
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      setShowQuiz(true);
      toast.success("Password correct! Quiz interface opened.");
    } else {
      setError("Incorrect password!");
      toast.error("Incorrect password! Please try again.");
    }
  };

  if (loading) {
    return (
      <section id="quiz" className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quizzes...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="quiz" className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25"></div>
            <h2 className="relative text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quiz Of The Week
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Challenge yourself, learn something new, and compete with fellow
            members!
            <br />
            <span className="text-lg text-purple-600 font-medium">
              New exciting quizzes every week 🎯
            </span>
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div
          className={`${quizzes.length === 1 ? "flex justify-center" : "grid gap-8 md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-8 shadow-xl rounded-2xl border border-white/50 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden ${quizzes.length === 1 ? "w-full max-w-lg" : ""}`}
              onClick={() => handleQuizClick(quiz)}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-full"></div>

              {/* Sparkle effects */}
              <div className="absolute top-4 right-4 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {quiz.title}
                    </h3>
                  </div>
                  {quiz.requiresPassword && (
                    <div className="flex items-center space-x-1 bg-blue-100 px-3 py-1 rounded-full">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">
                        Protected
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {quiz.description}
                </p>

                {quiz.type === "active" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                        <Timer className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">
                          {formatTimeLeft(quiz.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {quiz.participants} joined
                        </span>
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-2xl text-white overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                          <p className="text-lg font-bold">🔥 LIVE NOW!</p>
                        </div>
                        <p className="text-green-100 text-sm">
                          Join now and compete with others! 🏆
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Click to participate
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {quiz.type === "results" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
                        <span className="text-sm font-medium text-purple-700">
                          Results Ready
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {quiz.totalParticipants} played
                        </span>
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl text-white overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-200" />
                          <p className="text-lg font-bold">✅ Completed!</p>
                        </div>
                        <p className="text-blue-100 text-sm mb-3">
                          Quiz has ended. Check out the results! 📊
                        </p>
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Correct Answers:</span>
                            <span className="font-bold text-lg">
                              {quiz.totalCorrect}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {quiz.type === "statistics" && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center bg-blue-50 p-4 rounded-xl">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                          {quiz.totalQuizzes}
                        </p>
                        <p className="text-blue-600 font-medium text-sm">
                          Total Quizzes
                        </p>
                      </div>
                      <div className="text-center bg-green-50 p-4 rounded-xl">
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                          {quiz.totalParticipants}
                        </p>
                        <p className="text-green-600 font-medium text-sm">
                          Participants
                        </p>
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl text-white overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-3">
                          <p className="text-lg font-bold">📈 Overall Stats</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="font-bold text-lg">
                              {quiz.totalCorrect}
                            </div>
                            <div className="text-purple-100">✅ Correct</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="font-bold text-lg">
                              {quiz.totalWrong}
                            </div>
                            <div className="text-purple-100">❌ Wrong</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                📅 No Quizzes Yet
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                New exciting quizzes are coming soon! 🎆
                <br />
                <span className="text-sm text-purple-600">
                  Check back later for amazing challenges!
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </section>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">🔐 Quiz Access</h3>
                  <p className="text-blue-100 text-sm">
                    Enter password to continue
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the secret password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center space-x-2"
                >
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setSelectedQuiz(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  ✨ Access Quiz
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showQuiz && selectedQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl"></div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedQuiz.title}</h2>
                    <p className="text-blue-100">
                      🎯 Take the challenge and test your knowledge!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowQuiz(false);
                    setSelectedQuiz(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="p-8">
                <QuizInterface
                  quiz={selectedQuiz}
                  onClose={() => setShowQuiz(false)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function QuizInterface({ quiz, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [participantInfo, setParticipantInfo] = useState({
    name: "",
    phone_number: "",
    congregation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const congregations = [
    "Emmanuel Congregation Ahinsan",
    "Christ Congregation Ahinsan Estate",
    "Peniel Congregation Esreso No1",
    "Mizpah Congregation Odagya No1",
    "Ebenezer Congregation Dompoase Aprabo",
    "Favour Congregation Esreso No2",
    "Liberty Congregation High Tension",
    "Odagya No2",
    "Kokobriko",
  ];

  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleNameChange = (e) => {
    setParticipantInfo({
      ...participantInfo,
      name: capitalizeWords(e.target.value),
    });
  };

  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    message: "",
    type: "",
  });

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length === 0) {
      return { isValid: false, message: "", type: "" };
    } else if (cleanPhone.length < 10) {
      return {
        isValid: false,
        message: `${cleanPhone.length}/10 digits - Keep typing!`,
        type: "warning",
      };
    } else if (cleanPhone.length === 10) {
      // Check if it starts with 0 (Ghana format)
      if (cleanPhone.startsWith("0")) {
        return {
          isValid: true,
          message: "✅ Perfect! Valid Ghana number",
          type: "success",
        };
      } else {
        return {
          isValid: false,
          message: "❌ Ghana numbers start with 0",
          type: "error",
        };
      }
    } else {
      return {
        isValid: false,
        message: "❌ Too many digits (max 10)",
        type: "error",
      };
    }
  };

  const formatPhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 4) {
      return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    } else if (cleanPhone.length >= 3) {
      return cleanPhone.replace(/(\d{3})(\d+)/, "$1 $2");
    }
    return cleanPhone;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const validation = validatePhoneNumber(value);

    setPhoneValidation(validation);
    setParticipantInfo({
      ...participantInfo,
      phone_number: value,
    });
  };

  const handleCongregationChange = (e) => {
    setParticipantInfo({
      ...participantInfo,
      congregation: e.target.value,
    });
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
        quiz_id: quiz.id,
        name: participantInfo.name,
        phone_number: participantInfo.phone_number,
        congregation: participantInfo.congregation,
        selected_answer: selectedAnswer,
      });

      if (result.success) {
        const data = result.data;

        if (data.success) {
          toast.success(
            "Quiz submitted successfully! Results will be available after the quiz ends."
          );
          onClose(); // Close the quiz interface
        } else {
          setError(data.error || "Failed to submit quiz.");
          toast.error(data.error || "Failed to submit quiz.");
        }
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
    setSelectedAnswer("");
    setParticipantInfo({
      name: "",
      phone_number: "",
      congregation: "",
    });
    setError("");
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
            currentStep >= 1
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            1
          </div>
          <span className="font-medium">Your Info</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
            currentStep >= 2
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            2
          </div>
          <span className="font-medium">Quiz Time</span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-3"
        >
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>👤 Tell us about yourself</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📝 Full Name *
              </label>
              <input
                type="text"
                value={participantInfo.name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📱 Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formatPhoneNumber(participantInfo.phone_number)}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                    phoneValidation.type === "success"
                      ? "border-green-400 focus:border-green-500 focus:ring-green-200 bg-green-50"
                      : phoneValidation.type === "error"
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50"
                        : phoneValidation.type === "warning"
                          ? "border-yellow-400 focus:border-yellow-500 focus:ring-yellow-200 bg-yellow-50"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                  placeholder="0241 234 567"
                  maxLength={12} // Increased for formatted display
                />
                {phoneValidation.type === "success" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
                {phoneValidation.type === "error" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {phoneValidation.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 text-sm font-medium flex items-center space-x-2 ${
                    phoneValidation.type === "success"
                      ? "text-green-600"
                      : phoneValidation.type === "error"
                        ? "text-red-600"
                        : phoneValidation.type === "warning"
                          ? "text-yellow-600"
                          : "text-gray-600"
                  }`}
                >
                  <span>{phoneValidation.message}</span>
                </motion.div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                ⛪ Congregation *
              </label>
              <select
                value={participantInfo.congregation}
                onChange={handleCongregationChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Select your congregation</option>
                {congregations.map((congregation) => (
                  <option key={congregation} value={congregation}>
                    {congregation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-orange-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl"></div>
            <h3 className="text-2xl font-bold text-gray-800">
              🧠 Quiz Question
            </h3>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-xl text-gray-800 leading-relaxed font-medium">
              {quiz.question}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600 mb-4">
              🔍 Choose the correct answer:
            </p>
            {[
              {
                key: "A",
                text: quiz.optionA,
                color: "from-red-400 to-red-500",
              },
              {
                key: "B",
                text: quiz.optionB,
                color: "from-blue-400 to-blue-500",
              },
              {
                key: "C",
                text: quiz.optionC,
                color: "from-green-400 to-green-500",
              },
              {
                key: "D",
                text: quiz.optionD,
                color: "from-purple-400 to-purple-500",
              },
            ].map((option) => (
              <motion.div
                key={option.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedAnswer === option.key
                    ? `border-blue-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                }`}
                onClick={() => setSelectedAnswer(option.key)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold ${
                      selectedAnswer === option.key
                        ? "border-white bg-white/20 text-white"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    {option.key}
                  </div>
                  <span
                    className={`text-lg ${
                      selectedAnswer === option.key
                        ? "text-white font-medium"
                        : "text-gray-800"
                    }`}
                  >
                    {option.text}
                  </span>
                  {selectedAnswer === option.key && (
                    <CheckCircle className="w-6 h-6 text-white ml-auto" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              🎆 Ready to Submit?
            </h4>
            <p className="text-gray-600">
              Double-check your answer before submitting!
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuizSubmit}
            disabled={
              isSubmitting ||
              !participantInfo.name ||
              !participantInfo.phone_number ||
              !phoneValidation.isValid ||
              !participantInfo.congregation ||
              !selectedAnswer
            }
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
              isSubmitting ||
              !participantInfo.name ||
              !participantInfo.phone_number ||
              !phoneValidation.isValid ||
              !participantInfo.congregation ||
              !selectedAnswer
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🏆 Submit My Answer!</span>
              </div>
            )}
          </motion.button>

          {(!participantInfo.name ||
            !participantInfo.phone_number ||
            !phoneValidation.isValid ||
            !participantInfo.congregation ||
            !selectedAnswer) && (
            <p className="text-sm text-gray-500 mt-4">
              ⚠️ Please fill in all fields with valid information and select an
              answer to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
