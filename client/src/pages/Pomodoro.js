import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './Pomodoro.css';

function Pomodoro() {
  const [mode, setMode] = useState('work'); // work | break
  const [timeLeft, setTimeLeft] = useState((parseInt(localStorage.getItem('workTime')) || 25) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [todayStats, setTodayStats] = useState({ todaySessions: 0, todayMinutes: 0 });
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const intervalRef = useRef(null);
  const distractionsRef = useRef(0); // track distractions for current session

  const workMins = parseInt(localStorage.getItem('workTime')) || 25;
  const breakMins = parseInt(localStorage.getItem('breakTime')) || 5;
  const WORK_TIME = workMins * 60;
  const BREAK_TIME = breakMins * 60;

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchSubjects();
    fetchTodayStats();
  }, []);

  
  const toggleFocusLock = () => {
    if (!isFocusLocked) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      }
      document.body.classList.add('focus-locked');
      setIsFocusLocked(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      }
      document.body.classList.remove('focus-locked');
      setIsFocusLocked(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocusLocked) {
        // User switched tabs while in Focus Lock!
        playAlertSound();
        alert("🚨 STRICT FOCUS MODE ACTIVE: You switched tabs! Stay focused on your study screen!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.body.classList.remove('focus-locked'); // cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocusLocked]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/subjects`, { headers });
      setSubjects(res.data);
      if (res.data.length > 0) setSelectedSubject(res.data[0]._id);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions/stats`, { headers });
      setTodayStats(res.data);
      setSessions(res.data.todaySessions);
    } catch (err) {
      console.log(err);
    }
  };

  // Save session to DB when a work session completes
  const saveSession = async (type, durationMinutes) => {
    try {
      await axios.post(`${API_URL}/api/sessions`, {
        type,
        durationMinutes,
        distractions: distractionsRef.current,
        subjectId: selectedSubject || null,
      }, { headers });
      distractionsRef.current = 0; // reset for next session
      fetchTodayStats(); // refresh stats
    } catch (err) {
      console.log('Save session error:', err);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (mode === 'work') {
              // Save completed work session
              saveSession('work', workMins);
              setSessions(s => s + 1);
              playAlertSound();
              alert('✅ Focus session complete! Take a break!');
              setMode('break');
              return BREAK_TIME;
            } else {
              playAlertSound();
              alert('☕ Break over! Back to work!');
              setMode('work');
              return WORK_TIME;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
    } catch (e) { /* ignore */ }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };
  const handleReset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };
  const handleSkip = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('work');
      setTimeLeft(WORK_TIME);
    }
  };

  const handleDistraction = () => {
    distractionsRef.current += 1;
    setDistractions(d => d + 1);
  };

  const progress = mode === 'work'
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="pomodoro-page">
      {/* Sidebar */}
      <div className="pomodoro-sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro" className="active">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pomodoro-main">
        <h1>⏱️ Pomodoro Timer</h1>
        <p className="subtitle">Stay focused, study smart!</p>

        {/* Subject Selector */}
        {subjects.length > 0 && (
          <div className="subject-selector">
            <label>📚 Studying:</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="">-- No Subject --</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button className={mode === 'work' ? 'active' : ''} onClick={() => { setMode('work'); setTimeLeft(WORK_TIME); setIsRunning(false); }}>
            🎯 Focus
          </button>
          <button className={mode === 'break' ? 'active' : ''} onClick={() => { setMode('break'); setTimeLeft(BREAK_TIME); setIsRunning(false); }}>
            ☕ Break
          </button>
        </div>

        {/* Timer Circle */}
        <div className="timer-container">
          <svg className="timer-svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle cx="100" cy="100" r="90" fill="none"
              stroke={mode === 'work' ? '#667eea' : '#10b981'}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: '0.5s' }}
            />
          </svg>
          <div className="timer-text">
            <span className="time">{formatTime(timeLeft)}</span>
            <span className="mode-label">{mode === 'work' ? 'Focus Time' : 'Break Time'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          {!isRunning ? (
            <button className="btn start" onClick={handleStart}>▶ Start</button>
          ) : (
            <button className="btn pause" onClick={handlePause}>⏸ Pause</button>
          )}
          <button className="btn reset" onClick={handleReset}>↺ Reset</button>
          <button className="btn skip" onClick={handleSkip}>⏭ Skip</button>
        </div>

        {/* Stats */}
        <div className="pomodoro-stats">
          <div className="stat">
            <h3>🍅 {sessions}</h3>
            <p>Today's Sessions</p>
          </div>
          <div className="stat">
            <h3>⚡ {todayStats.todayMinutes || sessions * 25}</h3>
            <p>Minutes Focused</p>
          </div>
          <div className="stat">
            <h3>😵 {distractions}</h3>
            <p>Distractions</p>
          </div>
        </div>

        
        {/* Distraction Button */}
        <button className="distraction-btn" onClick={handleDistraction}>
          I got distracted!
        </button>

        {/* Strict Focus Lock Button */}
        <button 
          onClick={toggleFocusLock} 
          style={{ 
            marginTop: '15px', padding: '10px 20px', width: '100%', 
            backgroundColor: isFocusLocked ? '#e74c3c' : '#6f4cff', 
            color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
          }}
        >
          {isFocusLocked ? '🔓 Exit Focus Lock' : '🔒 Strict Focus Lock'}
        </button>

      </div>
    </div>
  );
}

export default Pomodoro;