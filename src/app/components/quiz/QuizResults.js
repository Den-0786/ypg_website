"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  Church,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
} from "lucide-react";
import { quizAPI } from "../../../utils/api";

export default function QuizResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [participantsPerPage] = useState(20);

  useEffect(() => {
    fetchQuizResults();
  }, []);

  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      const result = await quizAPI.getQuizResults();

      if (result.success) {
        const data = result.data;

        if (data.success) {
          setResults(data.results);
        } else {
          console.error("Error fetching quiz results:", data.error);
          setError("Failed to load quiz results");
        }
      } else {
        setError("Failed to load quiz results");
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      setError("Failed to load quiz results");
    } finally {
      setLoading(false);
    }
  };

  // Filter participants based on search term
  const getFilteredParticipants = (quizResult) => {
    if (!quizResult.all_participants) return [];

    return quizResult.all_participants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.phone_number.includes(searchTerm) ||
        participant.congregation
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  };

  // Get paginated participants
  const getPaginatedParticipants = (participants) => {
    const startIndex = (currentPage - 1) * participantsPerPage;
    const endIndex = startIndex + participantsPerPage;
    return participants.slice(startIndex, endIndex);
  };

  // Copy participant list to clipboard
  const copyToClipboard = (participants) => {
    const text = participants
      .map((p) => `${p.name} - ${p.congregation}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  // Export participants as CSV
  const exportAsCSV = (participants, quizTitle) => {
    const csvContent = [
      ["Name", "Phone Number", "Congregation", "Submission Time"],
      ...participants.map((p) => [
        p.name,
        p.phone_number,
        p.congregation,
        new Date(p.submitted_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quizTitle}_participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <section
        id="quiz-results"
        className="max-w-7xl mx-auto px-4 py-16 bg-gray-50"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz results...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="quiz-results"
      className="max-w-7xl mx-auto px-4 py-16 bg-gray-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4 text-blue-800">
          Quiz Results & Leaderboard
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See how participants performed in recent quizzes
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {results.map((quizResult, index) => (
        <motion.div
          key={quizResult.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {quizResult.quiz_title}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <span>
                Completed: {new Date(quizResult.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">
                {quizResult.total_participants}
              </p>
              <p className="text-sm text-gray-600">Total Participants</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">
                {quizResult.correct_answers}
              </p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-800">
                {quizResult.incorrect_answers}
              </p>
              <p className="text-sm text-gray-600">Incorrect Answers</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <Church className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-800">
                {quizResult.congregations_count}
              </p>
              <p className="text-sm text-gray-600">Congregations</p>
            </div>
          </div>

          {/* Congregation Leaderboard */}
          {quizResult.congregation_leaderboard &&
            quizResult.congregation_leaderboard.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                  Top 3 Congregations by Participants
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quizResult.congregation_leaderboard.map(
                    (congregation, idx) => (
                      <div
                        key={congregation.congregation}
                        className={`p-4 rounded-lg border-2 transform transition-all hover:scale-105 ${
                          congregation.rank === 1
                            ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg"
                            : congregation.rank === 2
                              ? "border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 shadow-md"
                              : "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-lg font-bold ${
                              congregation.rank === 1
                                ? "text-yellow-600"
                                : congregation.rank === 2
                                  ? "text-gray-600"
                                  : "text-orange-600"
                            }`}
                          >
                            {congregation.rank === 1
                              ? "🥇"
                              : congregation.rank === 2
                                ? "🥈"
                                : "🥉"}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              congregation.success_rate >= 80
                                ? "bg-green-100 text-green-700"
                                : congregation.success_rate >= 60
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {congregation.success_rate}% success
                          </span>
                        </div>
                        <h5 className="font-bold text-gray-800 mb-3 text-center">
                          {congregation.congregation}
                        </h5>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {congregation.participants}
                          </div>
                          <div className="text-sm text-gray-600">
                            {congregation.correct_answers} correct answers
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone number, or congregation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Correct Participants Section */}
          {quizResult.all_participants &&
            quizResult.all_participants.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                    Correct Participants (
                    {
                      quizResult.all_participants.filter((p) => p.is_correct)
                        .length
                    }{" "}
                    correct answers)
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        copyToClipboard(quizResult.all_participants)
                      }
                      className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy List
                    </button>
                    <button
                      onClick={() =>
                        exportAsCSV(
                          quizResult.all_participants,
                          quizResult.quiz_title
                        )
                      }
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Filtered Participants */}
                {(() => {
                  const filteredParticipants =
                    getFilteredParticipants(quizResult);
                  const paginatedParticipants =
                    getPaginatedParticipants(filteredParticipants);
                  const totalPages = Math.ceil(
                    filteredParticipants.length / participantsPerPage
                  );

                  return (
                    <>
                      {filteredParticipants.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No participants found matching your search.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">
                              Showing{" "}
                              {(currentPage - 1) * participantsPerPage + 1} to{" "}
                              {Math.min(
                                currentPage * participantsPerPage,
                                filteredParticipants.length
                              )}{" "}
                              of {filteredParticipants.length} participants
                            </p>
                          </div>

                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {paginatedParticipants.map((participant, idx) => (
                              <div
                                key={participant.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center">
                                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold mr-3">
                                    ✓
                                  </span>
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {participant.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {participant.congregation}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">
                                    {participant.phone_number}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(
                                      participant.submitted_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                              <button
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1)
                                  )
                                }
                                disabled={currentPage === 1}
                                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                              </button>

                              <div className="flex space-x-2">
                                {Array.from(
                                  { length: totalPages },
                                  (_, i) => i + 1
                                ).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded-md ${
                                      currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

          {/* Leaderboard */}
          {quizResult.leaderboard && quizResult.leaderboard.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                Top Performers
              </h4>
              <div className="space-y-3">
                {quizResult.leaderboard.map((participant, idx) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                          idx === 0
                            ? "bg-yellow-500 text-white"
                            : idx === 1
                              ? "bg-gray-400 text-white"
                              : idx === 2
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {participant.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.congregation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {participant.score}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {participant.time_taken} mins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Participants Display */}
          {quizResult.all_participants &&
            quizResult.all_participants.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  Correct Answers - Participant Names
                </h4>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizResult.all_participants
                      .filter((participant) => participant.is_correct)
                      .map((participant, index) => (
                        <div
                          key={`${participant.phone_number}-${index}`}
                          className="bg-white rounded-lg p-4 border border-green-200 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-lg">
                                {participant.name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {participant.congregation}
                              </p>
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                Correct Answer ✅
                              </p>
                            </div>
                            <div className="ml-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {quizResult.all_participants.filter((p) => p.is_correct)
                    .length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No correct answers for this quiz yet.
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Congregations Performance */}
          {quizResult.congregations && quizResult.congregations.length > 0 && (
            <div>
              <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <Church className="w-6 h-6 text-blue-500 mr-2" />
                Congregations Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizResult.congregations.map((congregation) => (
                  <div
                    key={congregation.name}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h5 className="font-semibold text-gray-800 mb-2">
                      {congregation.name}
                    </h5>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span>Participants:</span>
                        <span className="font-medium">
                          {congregation.participants}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Average Score:</span>
                        <span className="font-medium text-blue-600">
                          {congregation.average_score}%
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Best Score:</span>
                        <span className="font-medium text-green-600">
                          {congregation.best_score}%
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">
            No quiz results available at the moment.
          </p>
        </motion.div>
      )}
    </section>
  );
}
