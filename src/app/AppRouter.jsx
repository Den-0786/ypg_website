
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages';
import QuizList from './components/quiz/QuizList';
import TakeQuiz from './components/quiz/TakeQuiz';
import QuizResult from './components/quiz/QuizResult';

export default function AppRouter() {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quizzes/:id" element={<TakeQuiz />} />
            <Route path="/quizzes/results/:id" element={<QuizResult />} />
        </Routes>
        </Router>
    );
}
