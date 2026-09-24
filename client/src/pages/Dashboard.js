import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessionStats, setSessionStats] = useState({ todaySessions: 0, todayMinutes: 0 });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (!userData || !token) {
      navigate('/');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, statsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/me`, { headers }),
        axios.get(`${API_URL}/api/sessions/stats`, { headers }),
        axios.get(`${API_URL}/api/tasks`, { headers })
      ]);
      
      setUser(profileRes.data);
      setSessionStats(statsRes.data);
      setTasks(tasksRes.data);
      setNewGoal(profileRes.data.dailyGoalHours || 2);
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
    }
  };

  const handleGoalUpdate = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/users/goal`, { dailyGoalHours: newGoal }, { headers });
      setUser(res.data);
      setIsEditingGoal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const todayTasks = tasks.filter(t => {
    if (!t.deadline) return false;
    const taskDate = new Date(t.deadline).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return taskDate === today;
  });

  const todayDone = todayTasks.filter(t => t.status === 'Done').length;
  const todayHours = parseFloat(((sessionStats.todayMinutes || 0) / 60).toFixed(1));
  const goalProgress = user?.dailyGoalHours ? Math.min((todayHours / user.dailyGoalHours) * 100, 100) : 0;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard" className="active">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Let's make today productive!</p>
        </div>

        {/* Goal Progress Bar */}
        <div className="goal-section">
          <div className="goal-header">
            <h3>🎯 Daily Goal Progress</h3>
            {!isEditingGoal ? (
              <span className="goal-edit" onClick={() => setIsEditingGoal(true)}>✏️ Edit Goal</span>
            ) : (
              <div className="goal-edit-input">
                <input type="number" step="0.5" min="0.5" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
                <button onClick={handleGoalUpdate}>Save</button>
                <button onClick={() => setIsEditingGoal(false)} className="cancel">X</button>
              </div>
            )}
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${goalProgress}%`, background: goalProgress === 100 ? '#10b981' : '#667eea' }}></div>
          </div>
          <p className="goal-text">{todayHours} / {user?.dailyGoalHours || 2} hrs completed</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card orange">
            <h3>🔥 Streak</h3>
            <h2>{user?.currentStreak || 0} days</h2>
            <p>Longest: {user?.longestStreak || 0} days</p>
          </div>
          <div className="stat-card blue">
            <h3>⏰ Today's Study</h3>
            <h2>{todayHours} hrs</h2>
            <p>From Pomodoro</p>
          </div>
          <div className="stat-card purple">
            <h3>✅ Today's Tasks</h3>
            <h2>{todayDone}/{todayTasks.length}</h2>
            <p>Tasks completed</p>
          </div>
          <div className="stat-card green">
            <h3>🍅 Pomodoros</h3>
            <h2>{sessionStats.todaySessions || 0}</h2>
            <p>Sessions today</p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="tasks-section">
          <h2>📋 Today's Deadlines</h2>
          {todayTasks.length === 0 ? (
            <div className="empty-state">
              <p>🎯 No tasks due today — Enjoy or plan ahead!</p>
              <button className="add-btn" onClick={() => navigate('/planner')}>
                + Add Task
              </button>
            </div>
          ) : (
            <div className="task-list">
              {todayTasks.map(t => (
                <div key={t._id} className="task-item">
                  <span>{t.title}</span>
                  <span className={`badge badge-${t.status === 'Done' ? 'done' : t.status === 'In Progress' ? 'progress' : 'pending'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;