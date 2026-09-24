import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import './Leaderboard.css';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchLeaderboard();
  }, [navigate, token]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="leaderboard-page">
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard" className="active">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
      </div>

      <div className="leaderboard-main">
        <div className="leaderboard-header">
          <h1>🏆 Global Leaderboard</h1>
          <p>Compete with friends! Earn points by completing Pomodoro sessions.</p>
        </div>

        {users.length > 0 ? (
          <>
            {/* Podium for Top 3 */}
            <div className="podium-container">
              {/* Rank 2 */}
              {top3[1] && (
                <div className="podium rank-2">
                  <div className="podium-avatar">🥈</div>
                  <div className="podium-name">{top3[1].name}</div>
                  <div className="podium-score">{top3[1].score || 0} pts</div>
                </div>
              )}
              {/* Rank 1 */}
              {top3[0] && (
                <div className="podium rank-1">
                  <div className="podium-avatar">👑</div>
                  <div className="podium-name">{top3[0].name}</div>
                  <div className="podium-score">{top3[0].score || 0} pts</div>
                </div>
              )}
              {/* Rank 3 */}
              {top3[2] && (
                <div className="podium rank-3">
                  <div className="podium-avatar">🥉</div>
                  <div className="podium-name">{top3[2].name}</div>
                  <div className="podium-score">{top3[2].score || 0} pts</div>
                </div>
              )}
            </div>

            {/* List for Rest */}
            <div className="leaderboard-list">
              {rest.map((user, index) => (
                <div key={user._id} className="leaderboard-row">
                  <div className="lb-rank">#{index + 4}</div>
                  <div className="lb-user">
                    <span className="lb-name">{user.name}</span>
                    <span className="lb-stats">
                      Streak: {user.currentStreak || 0} days | Total: {Math.round((user.totalStudyMinutes || 0) / 60)} hrs
                    </span>
                  </div>
                  <div className="lb-score">{user.score || 0} pts</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center' }}>Loading Leaderboard...</p>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
