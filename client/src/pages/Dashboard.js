import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [viewImage, setViewImage] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" onClick={() => setViewImage(true)} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#4a3f75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Let's make today productive!</p>
          </div>
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

      <div className="search-bar-container" style={{ margin: '20px 0' }}>
        <input 
          type="text" 
          placeholder="🔍 Search for tasks, subjects, or notes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '12px 20px', borderRadius: '30px', border: 'none', backgroundColor: '#2d254b', color: '#fff', fontSize: '16px', outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        />
      </div>

      {searchQuery && (
        <div className="search-results" style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#2d254b', borderRadius: '15px' }}>
          <h3 style={{ color: '#ffb86c', marginBottom: '15px' }}>Search Results for "{searchQuery}"</h3>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Task Results */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ color: '#fff', borderBottom: '1px solid #4a3f75', paddingBottom: '10px' }}>📝 Tasks</h4>
              {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(task => (
                <div key={task._id} style={{ padding: '10px', backgroundColor: '#3e3565', borderRadius: '8px', margin: '10px 0', color: '#fff' }}>
                  {task.title}
                </div>
              ))}
              {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && <p style={{ color: '#8b80b7' }}>No tasks found.</p>}
            </div>

            {/* Subject Results */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ color: '#fff', borderBottom: '1px solid #4a3f75', paddingBottom: '10px' }}>📚 Subjects</h4>
              {subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(subject => (
                <div key={subject._id} style={{ padding: '10px', backgroundColor: '#3e3565', borderRadius: '8px', margin: '10px 0', color: '#fff' }}>
                  {subject.name}
                </div>
              ))}
              {subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && <p style={{ color: '#8b80b7' }}>No subjects found.</p>}
            </div>

            {/* Notes Results */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h4 style={{ color: '#fff', borderBottom: '1px solid #4a3f75', paddingBottom: '10px' }}>📄 Notes</h4>
              {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                <div key={note._id} style={{ padding: '10px', backgroundColor: '#3e3565', borderRadius: '8px', margin: '10px 0', color: '#fff' }}>
                  {note.title}
                </div>
              ))}
              {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && <p style={{ color: '#8b80b7' }}>No notes found.</p>}
            </div>
          </div>
        </div>
      )}
    
      {viewImage && (
        <div 
          onClick={() => setViewImage(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
          }}
        >
          <img 
            src={JSON.parse(sessionStorage.getItem('user'))?.profilePicture} 
            alt="Profile View" 
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }} 
          />
        </div>
      )}
        
    </div>
  );
}

export default Dashboard;