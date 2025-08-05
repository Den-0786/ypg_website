'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Clock, Users, Trophy } from "lucide-react";

export default function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/quizzes/');
            if (!response.ok) {
                throw new Error('Failed to fetch quizzes');
            }
            const data = await response.json();
            
            if (data.success) {
                // Transform the data to match the expected format
                const transformedQuizzes = data.quizzes.map(quiz => ({
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description || "Test your knowledge and grow in faith",
                    requiresPassword: true,
                    password: quiz.password,
                    endTime: quiz.end_time,
                    participants: quiz.submissions_count,
                    questions: 1, // Single question format
                    points: 100,
                    type: quiz.is_currently_active ? "active" : quiz.has_ended ? "results" : "upcoming",
                    question: quiz.question,
                    optionA: quiz.option_a,
                    optionB: quiz.option_b,
                    optionC: quiz.option_c,
                    optionD: quiz.option_d,
                    correctAnswers: quiz.correct_submissions_count,
                    wrongAnswers: quiz.submissions_count - quiz.correct_submissions_count,
                    congregations: 5, // Default value
                    totalParticipants: quiz.submissions_count,
                    totalCorrect: quiz.correct_submissions_count,
                    totalWrong: quiz.submissions_count - quiz.correct_submissions_count,
                    totalCongregations: 5, // Default value
                    totalQuizzes: data.quizzes.length,
                    totalParticipants: data.quizzes.reduce((sum, q) => sum + q.submissions_count, 0),
                    totalCorrect: data.quizzes.reduce((sum, q) => sum + q.correct_submissions_count, 0),
                    totalWrong: data.quizzes.reduce((sum, q) => sum + (q.submissions_count - q.correct_submissions_count), 0),
                    totalCongregations: 5, // Default value
                }));
                
                setQuizzes(transformedQuizzes);
            } else {
                console.error('Error fetching quizzes:', data.error);
                setError('Failed to load quizzes');
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setError('Failed to load quizzes');
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
            // Handle quiz without password
            console.log('Quiz clicked:', quiz);
        }
    };

    const handlePasswordSubmit = () => {
        if (selectedQuiz && password === selectedQuiz.password) {
            setShowPasswordModal(false);
            setPassword("");
            setSelectedQuiz(null);
            // Handle successful password entry
            console.log('Password correct for quiz:', selectedQuiz);
        } else {
            setError("Incorrect password!");
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
                <h2 className="text-4xl font-bold mb-4 text-blue-800">Quiz Of The Week</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Test your knowledge and grow in faith. New quizzes are posted weekly!
                </p>
            </motion.div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz, index) => (
                    <motion.div 
                        key={quiz.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white p-6 shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => handleQuizClick(quiz)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
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
                                    <p className="text-sm text-green-700 font-medium">Active Now</p>
                                    <p className="text-xs text-green-600">Click to participate</p>
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
                                    <p className="text-sm text-blue-700 font-medium">Completed</p>
                                    <p className="text-xs text-blue-600">{quiz.totalCorrect} correct answers</p>
                                </div>
                            </>
                        )}
                        
                        {quiz.type === "statistics" && (
                            <>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{quiz.totalQuizzes}</p>
                                        <p className="text-gray-600">Total Quizzes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{quiz.totalParticipants}</p>
                                        <p className="text-gray-600">Total Participants</p>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg mt-4">
                                    <p className="text-sm text-purple-700 font-medium">Overall Statistics</p>
                                    <p className="text-xs text-purple-600">{quiz.totalCorrect} correct, {quiz.totalWrong} incorrect</p>
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
                    <p className="text-gray-500 text-lg">No quizzes available at the moment.</p>
                </motion.div>
            )}
        </section>

        {/* Password Modal */}
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
                    {error && (
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                    )}
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
        </>
    );
}
