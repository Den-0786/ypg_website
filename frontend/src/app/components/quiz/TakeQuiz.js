"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { quizAPI } from "../../../utils/api";
import toast from "react-hot-toast";

export default function TakeQuiz() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizTitle, setQuizTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Quiz ID is required");
      setIsLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        const result = await quizAPI.getQuizQuestions(id);
        if (result.success) {
          const data = result.data;
          setQuestions(data.questions);
          setQuizTitle(data.title);
        } else {
          throw new Error("No quiz available");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleSelect = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        quiz_id: id,
        answers: answers,
      };

      const result = await quizAPI.submitQuiz(payload);

      if (result.success) {
        const data = result.data;

        toast.success(
          "Quiz submitted successfully! Results will be available after the quiz ends."
        );

        // Redirect to quiz results section
        window.location.href = "/#quiz-results";
      } else {
        setError(result.error || "Failed to submit quiz");
        toast.error(result.error || "Failed to submit quiz");
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting the quiz");
      toast.error(err.message || "An error occurred while submitting the quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse text-blue-600">Loading quiz...</div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-600">
        Error: {error}
      </div>
    );

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every((q) => answers.hasOwnProperty(q.id));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">{quizTitle}</h2>
        <p className="text-gray-600">
          {questions.length} questions • Select one answer for each question
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg font-semibold mb-4">
              <span className="text-blue-600">{index + 1}.</span> {q.text}
            </p>
            <div className="space-y-3">
              {q.answers.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    answers[q.id] === a.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(q.id, a.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        answers[q.id] === a.id
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[q.id] === a.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{a.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium text-white ${
            allQuestionsAnswered
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          } transition-colors`}
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
        {!allQuestionsAnswered && questions.length > 0 && (
          <p className="mt-3 text-sm text-red-500">
            Please select an option from [A - D] before submitting
          </p>
        )}
      </div>
    </div>
  );
}
