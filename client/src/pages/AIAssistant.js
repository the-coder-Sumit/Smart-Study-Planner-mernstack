import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import API_URL from '../config';
import './AIAssistant.css';

function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! I am EduBot, your AI Study Assistant. You can ask me study questions, or click the button above to generate a smart timetable based on your subjects!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingTimetable, setGeneratingTimetable] = useState(false);
  const chatEndRef = useRef(null);
  
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chat`, { message: userMessage }, { headers });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.reply || 'Oops! Something went wrong communicating with the AI.';
      setMessages(prev => [...prev, { sender: 'bot', text: `❌ Error: ${errMsg}` }]);
    }
    setLoading(false);
  };

  const generateTimetable = async () => {
    setGeneratingTimetable(true);
    setMessages(prev => [...prev, { sender: 'bot', text: '⏳ Generating your highly optimized smart timetable... This might take a few seconds.' }]);
    try {
      const res = await axios.get(`${API_URL}/api/ai/timetable`, { headers });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.reply || 'Failed to generate timetable.';
      setMessages(prev => [...prev, { sender: 'bot', text: `❌ Error: ${errMsg}` }]);
    }
    setGeneratingTimetable(false);
  };

  return (
    <div className="ai-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai" className="active">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
      </div>

      <div className="ai-main">
        <div className="ai-header">
          <div>
            <h1>🤖 AI Study Assistant</h1>
            <p className="subtitle">Powered by Google Gemini</p>
          </div>
          <button 
            className="timetable-btn" 
            onClick={generateTimetable}
            disabled={generatingTimetable || loading}
          >
            {generatingTimetable ? '⏳ Generating...' : '📅 Generate Smart Timetable'}
          </button>
        </div>

        <div className="chat-container">
          <div className="chat-box">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <i>EduBot is typing...</i>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask a study question... (e.g., Explain Newton's laws)" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || generatingTimetable}
            />
            <button type="submit" className="send-btn" disabled={loading || generatingTimetable}>
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
