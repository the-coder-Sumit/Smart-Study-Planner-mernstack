import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [viewImage, setViewImage] = useState(false);
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
  const [uploading, setUploading] = useState(false);
  const headers = { Authorization: 'Bearer ' + sessionStorage.getItem('token') };

  
  
  const handleProfilePicDelete = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    try {
      setUploading(true);
      await axios.delete(`${API_URL}/api/users/profile-picture`, { headers });
      let currentUser = JSON.parse(sessionStorage.getItem('user'));
      currentUser.profilePicture = '';
      sessionStorage.setItem('user', JSON.stringify(currentUser));
      alert("Profile picture removed successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to remove profile picture: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        setUploading(true);
        const res = await axios.put(`${API_URL}/api/users/profile-picture`, 
          { profilePicture: reader.result }, 
          { headers }
        );
        let currentUser = JSON.parse(sessionStorage.getItem('user'));
        currentUser.profilePicture = res.data.profilePicture;
        sessionStorage.setItem('user', JSON.stringify(currentUser));
        alert("Profile picture updated successfully!");
        window.location.reload();
      } catch (err) {
        alert("Failed to update profile picture: " + (err.response?.data?.message || err.message)); console.log(err);
      } finally {
        setUploading(false);
      }
    };
  };

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

          <div className="form-group">
            <label>Profile Picture</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {JSON.parse(sessionStorage.getItem('user'))?.profilePicture ? (
                <img src={JSON.parse(sessionStorage.getItem('user')).profilePicture} alt="Profile" onClick={() => setViewImage(true)} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4a3f75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold' }}>
                  {JSON.parse(sessionStorage.getItem('user'))?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} disabled={uploading} style={{ padding: '10px' }} />
              {uploading && <span>Uploading...</span>}
              {JSON.parse(sessionStorage.getItem('user'))?.profilePicture && (
                <button 
                  type="button" 
                  onClick={handleProfilePicDelete} 
                  disabled={uploading}
                  style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}
                >
                  🗑️ Remove
                </button>
              )}

            </div>
          </div>


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

export default Settings;