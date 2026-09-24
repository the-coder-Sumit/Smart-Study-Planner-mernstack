import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [workTime, setWorkTime] = useState(parseInt(localStorage.getItem('workTime')) || 25);
  const [breakTime, setBreakTime] = useState(parseInt(localStorage.getItem('breakTime')) || 5);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalHours || 2);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    // Save Pomodoro settings to localStorage
    localStorage.setItem('workTime', workTime);
    localStorage.setItem('breakTime', breakTime);
    
    // Save daily goal to backend
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/goal`, 
        { dailyGoalHours: dailyGoal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log('Error saving goal', err);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg('New passwords do not match!');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/users/password`, {
        currentPassword, newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwdMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg(err.response?.data?.message || 'Error updating password');
    }
  };

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings" className="active">⚙️ Settings</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main */}
      <div className="settings-main">
        <h1>⚙️ Settings</h1>
        <p className="subtitle">Manage your preferences</p>

        {saved && <div className="success-msg">✅ Settings saved successfully!</div>}

        <form onSubmit={handleSave}>

          {/* Profile Section */}
          <div className="settings-card">
            <h3>👤 Profile</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name}
                onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <small>Email cannot be changed</small>
            </div>
          </div>

          {/* Pomodoro Settings */}
          <div className="settings-card">
            <h3>⏱️ Pomodoro Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Focus Time (minutes)</label>
                <input type="number" min="1" max="60" value={workTime}
                  onChange={(e) => setWorkTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Break Time (minutes)</label>
                <input type="number" min="1" max="30" value={breakTime}
                  onChange={(e) => setBreakTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Study Goal */}
          <div className="settings-card">
            <h3>🎯 Daily Study Goal</h3>
            <div className="form-group">
              <label>Daily Goal (hours): <strong>{dailyGoal} hrs</strong></label>
              <input type="range" min="1" max="12" value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)} />
              <div className="range-labels">
                <span>1 hr</span>
                <span>12 hrs</span>
              </div>
            </div>
          </div>

          <button type="submit" className="save-btn">💾 Save Settings</button>
        </form>

        <form onSubmit={handleChangePassword} style={{ marginTop: '30px' }}>
          <div className="settings-card">
            <h3>🔒 Change Password</h3>
            {pwdMsg && <p style={{ color: pwdMsg.includes('success') ? '#10b981' : '#ef4444', marginBottom: '15px' }}>{pwdMsg}</p>}
            
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={currentPassword} required
                onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>New Password (Min 6 chars)</label>
                <input type="password" value={newPassword} minLength="6" required
                  onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} minLength="6" required
                  onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            
            <button type="submit" className="save-btn" style={{ background: '#3b82f6' }}>Update Password</button>
          </div>
        </form>

        <div className="settings-card" style={{ marginTop: '30px' }}>
          <h3>ℹ️ About</h3>
            <div className="about-info">
              <p>📚 <strong>Smart Study Planner</strong></p>
              <p>Version: 1.0.0</p>
              <p>Developer: Sumit Kumar</p>
              <p>Roll No: 2301220100182</p>
              <p>SRMCEM — CSE Department</p>
            </div>
          </div>

      </div>
    </div>
  );
}

export default Settings;