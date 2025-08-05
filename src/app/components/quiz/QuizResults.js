'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, CheckCircle, XCircle, Church } from "lucide-react";

export default function QuizResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchQuizResults();
    }, []);

    const fetchQuizResults = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/quizzes/results/');
            if (!response.ok) {
                throw new Error('Failed to fetch quiz results');
            }
            const data = await response.json();
            
            if (data.success) {
                setResults(data.results);
            } else {
                console.error('Error fetching quiz results:', data.error);
                setError('Failed to load quiz results');
            }
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            setError('Failed to load quiz results');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section id="quiz-results" className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading quiz results...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="quiz-results" className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-bold mb-4 text-blue-800">Quiz Results & Leaderboard</h2>
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
                        <h3 className="text-2xl font-bold text-gray-800">{quizResult.quiz_title}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <span>Completed: {new Date(quizResult.end_date).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-800">{quizResult.total_participants}</p>
                            <p className="text-sm text-gray-600">Total Participants</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-800">{quizResult.correct_answers}</p>
                            <p className="text-sm text-gray-600">Correct Answers</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-800">{quizResult.incorrect_answers}</p>
                            <p className="text-sm text-gray-600">Incorrect Answers</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                            <Church className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-800">{quizResult.congregations_count}</p>
                            <p className="text-sm text-gray-600">Congregations</p>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    {quizResult.leaderboard && quizResult.leaderboard.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                                <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                                Top Performers
                            </h4>
                            <div className="space-y-3">
                                {quizResult.leaderboard.map((participant, idx) => (
                                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                                                idx === 0 ? 'bg-yellow-500 text-white' :
                                                idx === 1 ? 'bg-gray-400 text-white' :
                                                idx === 2 ? 'bg-orange-500 text-white' :
                                                'bg-gray-200 text-gray-700'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-gray-800">{participant.name}</p>
                                                <p className="text-sm text-gray-600">{participant.congregation}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">{participant.score}%</p>
                                            <p className="text-sm text-gray-500">{participant.time_taken} mins</p>
                                        </div>
                                    </div>
                                ))}
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
                                    <div key={congregation.name} className="bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-semibold text-gray-800 mb-2">{congregation.name}</h5>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex justify-between">
                                                <span>Participants:</span>
                                                <span className="font-medium">{congregation.participants}</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span>Average Score:</span>
                                                <span className="font-medium text-blue-600">{congregation.average_score}%</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span>Best Score:</span>
                                                <span className="font-medium text-green-600">{congregation.best_score}%</span>
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
                    <p className="text-gray-500 text-lg">No quiz results available at the moment.</p>
                </motion.div>
            )}
        </section>
    );
} 