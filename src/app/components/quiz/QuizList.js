"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Clock, Users, Trophy, CheckCircle, XCircle } from "lucide-react";
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
          <h2 className="text-4xl font-bold mb-4 text-blue-800">
            Quiz Of The Week
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test your knowledge and grow in faith. New quizzes are posted
            weekly!
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div
          className={`${quizzes.length === 1 ? "flex justify-center" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white p-6 shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer ${quizzes.length === 1 ? "w-full max-w-md" : ""}`}
              onClick={() => handleQuizClick(quiz)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {quiz.title}
                </h3>
                {quiz.requiresPassword && (
                  <Lock className="w-5 h-5 text-blue-600" />
                )}
              </div>

              <p className="text-gray-600 mb-4">{quiz.description}</p>

              {quiz.type === "active" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatTimeLeft(quiz.endTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{quiz.participants} participants</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      Active Now
                    </p>
                    <p className="text-xs text-green-600">
                      Click to participate
                    </p>
                  </div>
                </>
              )}

              {quiz.type === "results" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span>Results Available</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{quiz.totalParticipants} participants</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">
                      Completed
                    </p>
                    <p className="text-xs text-blue-600">
                      {quiz.totalCorrect} correct answers
                    </p>
                  </div>
                </>
              )}

              {quiz.type === "statistics" && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {quiz.totalQuizzes}
                      </p>
                      <p className="text-gray-600">Total Quizzes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {quiz.totalParticipants}
                      </p>
                      <p className="text-gray-600">Total Participants</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg mt-4">
                    <p className="text-sm text-purple-700 font-medium">
                      Overall Statistics
                    </p>
                    <p className="text-xs text-purple-600">
                      {quiz.totalCorrect} correct, {quiz.totalWrong} incorrect
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">
              No quizzes available at the moment.
            </p>
          </motion.div>
        )}
      </section>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enter Quiz Password
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handlePasswordSubmit();
                }
              }}
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                  setSelectedQuiz(null);
                  setError("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuiz && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedQuiz.title}
                </h2>
                <button
                  onClick={() => {
                    setShowQuiz(false);
                    setSelectedQuiz(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <QuizInterface
                quiz={selectedQuiz}
                onClose={() => setShowQuiz(false)}
              />
            </div>
          </div>
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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={participantInfo.name}
              onChange={handleNameChange}
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
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0241234567"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Congregation *
            </label>
            <select
              value={participantInfo.congregation}
              onChange={handleCongregationChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Question:
          </h3>
          <p className="text-gray-700 mb-6">{quiz.question}</p>

          <div className="space-y-3">
            {[
              { key: "A", text: quiz.optionA },
              { key: "B", text: quiz.optionB },
              { key: "C", text: quiz.optionC },
              { key: "D", text: quiz.optionD },
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
    </div>
  );
}
