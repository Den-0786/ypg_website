"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { quizAPI } from "../../../utils/api";

export default function QuizResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true);
        const result = await quizAPI.getQuizResult(id);
        if (result.success) {
          setResult(result.data);
        } else {
          throw new Error("Failed to fetch results");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-red-600">
        Error: {error}
      </div>
    );

  if (!result) return null;

  const percentage = Math.round((result.score / result.total) * 100);
  const isPerfectScore = result.score === result.total;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Results</h2>

        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={
                percentage >= 70
                  ? "#10B981"
                  : percentage >= 50
                    ? "#F59E0B"
                    : "#EF4444"
              }
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>
        </div>

        <p className="text-xl font-semibold mb-1">
          You scored {result.score} out of {result.total}
        </p>
        <p
          className={`text-lg font-medium ${
            isPerfectScore
              ? "text-green-600"
              : percentage >= 70
                ? "text-blue-600"
                : "text-orange-600"
          }`}
        >
          {isPerfectScore
            ? "Perfect Score! 🎉"
            : percentage >= 70
              ? "Well Done!"
              : "Keep Practicing!"}
        </p>
      </div>

      <div className="space-y-4">
        {result.answers.map((ans, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              ans.is_correct
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="font-semibold text-gray-800">
              <span className="text-gray-600">{index + 1}.</span> {ans.question}
            </p>
            <div className="mt-3 space-y-2">
              <p
                className={`text-sm ${
                  ans.is_correct ? "text-green-700" : "text-red-700"
                }`}
              >
                <span className="font-medium">Your answer:</span> {ans.selected}
              </p>
              {!ans.is_correct && (
                <p className="text-sm text-green-700">
                  <span className="font-medium">Correct answer:</span>{" "}
                  {ans.correct}
                </p>
              )}
              {ans.explanation && (
                <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    Explanation:
                  </p>
                  <p className="text-sm text-gray-600">{ans.explanation}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
