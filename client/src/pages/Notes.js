import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import './Notes.css';

function Notes() {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps


  useEffect(() => {
    if (selectedSubject) {
      fetchNotes(selectedSubject);
    } else {
      setNotes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps


  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/subjects`, { headers });
      setSubjects(res.data);
      if (res.data.length > 0) {
        setSelectedSubject(res.data[0]._id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotes = async (subId) => {
    try {
      const res = await axios.get(`${API_URL}/api/notes/${subId}`, { headers });
      setNotes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !selectedSubject) return alert("Please fill all fields!");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subjectId', selectedSubject);
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/api/notes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setTitle('');
      setFile(null);
      document.getElementById('fileInput').value = ""; // Reset file input
      fetchNotes(selectedSubject); // refresh notes
    } catch (err) {
      console.log(err);
      alert('Error uploading note.');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, { headers });
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📕';
    if (type?.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div className="notes-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes" className="active">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
      </div>

      <div className="notes-main">
        <h1>📝 Notes Management</h1>
        <p className="subtitle">Upload and organize your study materials (PDFs, Images).</p>

        <div className="notes-container">
          
          {/* Upload Section */}
          <div className="upload-section">
            <h3>⬆️ Upload Material</h3>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Note Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Chapter 1 Summary"
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                {subjects.length === 0 ? (
                  <p style={{ color: '#f59e0b', fontSize: '14px', marginTop: '5px' }}>
                    ⚠️ No subjects found. Please go to Planner and add a subject first.
                  </p>
                ) : (
                  <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>File (PDF/Image)</label>
                <input 
                  type="file" 
                  id="fileInput"
                  onChange={(e) => setFile(e.target.files[0])} 
                  required
                />
              </div>
              <button type="submit" className="upload-btn" disabled={uploading || subjects.length === 0}>
                {uploading ? 'Uploading...' : 'Upload Note'}
              </button>
            </form>
          </div>

          {/* Notes List Section */}
          <div className="notes-list-section">
            <div className="notes-header">
              <h3>📂 Your Notes</h3>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={subjects.length === 0}>
                {subjects.length === 0 && <option value="">No Subjects</option>}
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>Filter: {s.name}</option>
                ))}
              </select>
            </div>

            {notes.length === 0 ? (
              <div className="empty-notes">
                <p>No notes found for this subject.</p>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map(note => (
                  <div key={note._id} className="note-card">
                    <div>
                      <div className="note-icon">{getFileIcon(note.fileType)}</div>
                      <div className="note-title">{note.title}</div>
                      <div className="note-date">{new Date(note.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="note-actions">
                      <a 
                        href={`${API_URL}/uploads/${note.filePath}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="download-btn"
                        download={note.title}
                      >
                        ⬇️ Download
                      </a>
                      <Link to={`/quiz/${note._id}`} className="download-btn" style={{ background: '#8b5cf6' }}>
                        🧠 AI Quiz
                      </Link>
                      <button className="delete-btn" onClick={() => handleDelete(note._id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Notes;
