"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
} from "lucide-react";
import { quizAPI } from "../../../utils/api";

export default function CongregationLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCongregation, setSelectedCongregation] = useState(null);

  useEffect(() => {
    fetchCongregationStats();
  }, []);

  const fetchCongregationStats = async () => {
    try {
      setLoading(true);
      const result = await quizAPI.getCongregationStats();

      if (result.success) {
        const data = result.data;
        if (data.success) {
          setLeaderboard(data.leaderboard);
        } else {
          setError("Failed to load congregation statistics");
        }
      } else {
        setError("Failed to load congregation statistics");
      }
    } catch (error) {
      console.error("Error fetching congregation stats:", error);
      setError("Failed to load congregation statistics");
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default:
        return "bg-white border border-gray-200";
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchCongregationStats}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center mb-2">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            Congregation Quiz Leaderboard
          </h2>
          <div className="text-sm text-gray-600">
            {leaderboard.length} congregations
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              Top 3 Congregations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg p-4 text-center transform -translate-y-2"
                >
                  <div className="text-3xl mb-2">🥈</div>
                  <h4 className="font-bold text-lg mb-1">
                    {leaderboard[1].name}
                  </h4>
                  <div className="text-2xl font-bold mb-1">
                    {leaderboard[1].total_participants}
                  </div>
                  <div className="text-sm opacity-90">
                    {leaderboard[1].success_rate}% success rate
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg p-4 text-center transform -translate-y-4"
                >
                  <div className="text-3xl mb-2">🥇</div>
                  <h4 className="font-bold text-lg mb-1">
                    {leaderboard[0].name}
                  </h4>
                  <div className="text-2xl font-bold mb-1">
                    {leaderboard[0].total_participants}
                  </div>
                  <div className="text-sm opacity-90">
                    {leaderboard[0].success_rate}% success rate
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg p-4 text-center transform -translate-y-2"
                >
                  <div className="text-3xl mb-2">🥉</div>
                  <h4 className="font-bold text-lg mb-1">
                    {leaderboard[2].name}
                  </h4>
                  <div className="text-2xl font-bold mb-1">
                    {leaderboard[2].total_participants}
                  </div>
                  <div className="text-sm opacity-90">
                    {leaderboard[2].success_rate}% success rate
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
            Complete Leaderboard
          </h3>
          <div className="space-y-3">
            {leaderboard.map((congregation, index) => (
              <motion.div
                key={congregation.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  selectedCongregation?.name === congregation.name
                    ? "ring-2 ring-blue-500"
                    : ""
                } ${getRankColor(congregation.rank)}`}
                onClick={() =>
                  setSelectedCongregation(
                    selectedCongregation?.name === congregation.name
                      ? null
                      : congregation
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold">
                      {getRankIcon(congregation.rank)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{congregation.name}</h4>
                      <div className="flex items-center space-x-4 text-sm opacity-80">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {congregation.total_participants} participants
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {congregation.total_correct_answers} correct
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {congregation.total_quizzes} quizzes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {congregation.total_participants}
                    </div>
                    <div className="text-sm opacity-80">
                      {congregation.success_rate}% success
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedCongregation?.name === congregation.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <h5 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Quiz Participation History
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {congregation.quiz_participation.map((quiz, idx) => (
                        <div
                          key={quiz.quiz_id}
                          className="bg-gray-50 rounded p-3"
                        >
                          <div className="font-medium text-sm mb-1">
                            {quiz.quiz_title}
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{quiz.participants} participants</span>
                            <span>{quiz.correct_answers} correct</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
