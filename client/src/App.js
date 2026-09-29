import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pomodoro from './pages/Pomodoro';
import Planner from './pages/Planner';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import AIAssistant from './pages/AIAssistant';
import QuizViewer from './pages/QuizViewer';
import ForgotPassword from './pages/ForgotPassword';
import Leaderboard from './pages/Leaderboard';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import './App.css';

function AppContent({ theme, toggleTheme }) {
  const location = useLocation();
  const isPomodoroVisible = location.pathname === '/pomodoro';
  const token = sessionStorage.getItem('token');

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/pomodoro" element={<PrivateRoute><div /></PrivateRoute>} />
        <Route path="/planner" element={<PrivateRoute><Planner /></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
        <Route path="/quiz/:noteId" element={<PrivateRoute><QuizViewer /></PrivateRoute>} />
        <Route path="/ai" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      </Routes>
      
      {token && (
        <div style={{ display: isPomodoroVisible ? 'block' : 'none' }}>
           <Pomodoro />
        </div>
      )}
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
