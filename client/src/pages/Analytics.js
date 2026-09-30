import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import API_URL from '../config';
import './Analytics.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalDistractions: 0,
    todaySessions: 0,
    todayMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [quizScores, setQuizScores] = useState([]);

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, subjectsRes, weeklyRes, statsRes, scoresRes] = await Promise.all([
        axios.get(`${API_URL}/api/tasks`, { headers }),
        axios.get(`${API_URL}/api/subjects`, { headers }),
        axios.get(`${API_URL}/api/sessions/weekly`, { headers }),
        axios.get(`${API_URL}/api/sessions/stats`, { headers }),
        axios.get(`${API_URL}/api/quizzes/scores`, { headers }).catch(e => ({data: []})),
      ]);
      setTasks(tasksRes.data);
      setSubjects(subjectsRes.data);
      setWeeklyData(weeklyRes.data);
      setSessionStats(statsRes.data);
      setQuizScores(scoresRes.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  // Task Status Data for Pie Chart
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const done = tasks.filter(t => t.status === 'Done').length;

  const pieData = [
    { name: 'Pending', value: pending || 0 },
    { name: 'In Progress', value: inProgress || 0 },
    { name: 'Done', value: done || 0 },
  ];

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  // Tasks per Subject for Bar Chart
  const barData = subjects.map(s => ({
    name: s.name,
    tasks: tasks.filter(t => t.subjectId?._id === s._id || t.subjectId === s._id).length,
  }));

  const completionRate = tasks.length > 0
    ? Math.round((done / tasks.length) * 100)
    : 0;

  const totalHours = parseFloat((sessionStats.totalMinutes / 60).toFixed(1));
  const todayHours = parseFloat(((sessionStats.todayMinutes || 0) / 60).toFixed(1));

  const exportPDF = () => {
    const input = document.getElementById('report-content');
    // Hide theme specific styling for print if needed, but html2canvas captures current DOM.
    html2canvas(input, { scale: 2, backgroundColor: '#1e293b' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Study_Report.pdf');
    });
  };

  return (
    <div className="analytics-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics" className="active">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>📊 Analytics & Reports</h1>
            <p className="subtitle">Track your study progress</p>
          </div>
          <button onClick={exportPDF} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📄 Export Study Report (PDF)
          </button>
        </div>

        <div id="report-content" style={{ padding: '20px', background: 'inherit', borderRadius: '15px' }}>
        {/* Stats Row */}
        <div className="stats-row">
          <div className="mini-card blue">
            <h3>{tasks.length}</h3>
            <p>Total Tasks</p>
          </div>
          <div className="mini-card green">
            <h3>{done}</h3>
            <p>Completed</p>
          </div>
          <div className="mini-card orange">
            <h3>{inProgress}</h3>
            <p>In Progress</p>
          </div>
          <div className="mini-card purple">
            <h3>{completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
          <div className="mini-card teal">
            <h3>{subjects.length}</h3>
            <p>Subjects</p>
          </div>
        </div>

        {/* Pomodoro Stats Row */}
        <div className="stats-row">
          <div className="mini-card red">
            <h3>🍅 {sessionStats.totalSessions}</h3>
            <p>Total Sessions</p>
          </div>
          <div className="mini-card indigo">
            <h3>⏱️ {totalHours}h</h3>
            <p>Total Hours Studied</p>
          </div>
          <div className="mini-card yellow">
            <h3>☀️ {todayHours}h</h3>
            <p>Today's Study</p>
          </div>
          <div className="mini-card rose">
            <h3>😵 {sessionStats.totalDistractions}</h3>
            <p>Total Distractions</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Bar Chart — Weekly Study (REAL DATA) */}
          <div className="chart-card">
            <h3>📅 Weekly Study Hours <span className="real-badge">● Live</span></h3>
            {weeklyData.every(d => d.hours === 0) ? (
              <p className="no-data">No sessions yet! Start the Pomodoro timer 🍅</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#aaa" />
                  <YAxis stroke="#aaa" unit="h" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                    formatter={(val) => [`${val} hrs`, 'Study Time']}
                  />
                  <Bar dataKey="hours" fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart — Task Status */}
          <div className="chart-card">
            <h3>✅ Task Status</h3>
            {tasks.length === 0 ? (
              <p className="no-data">No tasks yet!</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tasks Per Subject Bar Chart */}
        <div className="chart-card full-width">
          <h3>📚 Tasks Per Subject</h3>
          {barData.length === 0 ? (
            <p className="no-data">No subjects yet!</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                />
                <Bar dataKey="tasks" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        </div>
      
        {/* Quiz History Section */}
        <div className="chart-card" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
          <h3>📜 Quiz Performance History</h3>
          {quizScores.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #4a3f75', textAlign: 'left', color: '#ffb86c' }}>
                    <th style={{ padding: '12px 10px' }}>Date</th>
                    <th style={{ padding: '12px 10px' }}>Chapter / PDF</th>
                    <th style={{ padding: '12px 10px' }}>Score</th>
                    <th style={{ padding: '12px 10px' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {quizScores.map((score, i) => {
                    const percentage = (score.score / score.total) * 100;
                    let color = '#ef4444'; // Red
                    let emoji = '❌ Needs Work';
                    if (percentage >= 80) { color = '#10b981'; emoji = '🏆 Excellent'; }
                    else if (percentage >= 50) { color = '#f59e0b'; emoji = '👍 Good'; }
                    
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #3e3565', color: '#fff' }}>
                        <td style={{ padding: '12px 10px' }}>{new Date(score.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 10px' }}>{score.noteTitle}</td>
                        <td style={{ padding: '12px 10px', color: color, fontWeight: 'bold' }}>{score.score} / {score.total} ({percentage.toFixed(0)}%)</td>
                        <td style={{ padding: '12px 10px' }}>{emoji}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#8b80b7', marginTop: '15px' }}>No quizzes taken yet. Generate an AI quiz from your notes to see your history!</p>
          )}
        </div>
</div>
    </div>
  );
}

export default Analytics;