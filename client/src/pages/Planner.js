import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import API_URL from '../config';
import './Planner.css';

function Planner() {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState('#667eea');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ✅ NEW — View Toggle & Calendar
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    requestNotificationPermission();
    fetchSubjects();
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps


  const requestNotificationPermission = async () => {
    if ('Notification' in window) await Notification.requestPermission();
  };

  const checkDeadlines = (taskList) => {
    if (!('Notification' in window)) {
      alert("Your browser does not support notifications.");
      return;
    }
    
    if (Notification.permission !== 'granted') {
      alert("Please allow notification permissions in your browser settings (near the URL bar) to receive reminders.");
      Notification.requestPermission();
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let notifiedCount = 0;

    taskList.forEach(task => {
      if (!task.deadline || task.status === 'Done') return;
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        new Notification('⚠️ Task Due TODAY!', { body: `"${task.title}" is due today!` });
        notifiedCount++;
      }
      else if (diffDays === 1) {
        new Notification('🔔 Task Due Tomorrow!', { body: `"${task.title}" is due tomorrow!` });
        notifiedCount++;
      }
      else if (diffDays < 0) {
        new Notification('❌ Task Overdue!', { body: `"${task.title}" was due ${Math.abs(diffDays)} day(s) ago!` });
        notifiedCount++;
      }
    });

    if (notifiedCount === 0) {
      alert("You have no pending tasks due today, tomorrow, or overdue! Relax! 😊");
    }
  };

  const fetchSubjects = async () => {
    const res = await axios.get(`${API_URL}/api/subjects`, { headers });
    setSubjects(res.data);
  };

  const fetchTasks = async () => {
    const res = await axios.get(`${API_URL}/api/tasks`, { headers });
    setTasks(res.data);
    checkDeadlines(res.data);
  };

  const addSubject = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/api/subjects`,
      { name: subjectName, color: subjectColor }, { headers });
    setSubjectName('');
    setShowSubjectForm(false);
    fetchSubjects();
  };

  const addTask = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/api/tasks`,
      { title: taskTitle, subjectId: taskSubject, deadline: taskDeadline, priority: taskPriority },
      { headers });
    setTaskTitle('');
    setTaskDeadline('');
    setShowTaskForm(false);
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/api/tasks/${id}`, { status }, { headers });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/api/tasks/${id}`, { headers });
    fetchTasks();
  };

  const deleteSubject = async (id) => {
    await axios.delete(`${API_URL}/api/subjects/${id}`, { headers });
    fetchSubjects();
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#ef4444';
    if (priority === 'Medium') return '#f59e0b';
    return '#10b981';
  };

  const getBadgeClass = (status) => {
    if (status === 'Done') return 'badge-done';
    if (status === 'In Progress') return 'badge-progress';
    return 'badge-pending';
  };

  // ✅ Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => 
      t._id === taskId ? { ...t, status: newStatus } : t
    ));

    // Backend update
    await axios.put(`${API_URL}/api/tasks/${taskId}`, { status: newStatus }, { headers });
    // fetchTasks() usually follows but optimistic update covers us
  };

  // ✅ Calendar — Tasks on selected date
  const getTasksForDate = (date) => {
    return tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear();
    });
  };

  // ✅ Calendar — Dot on dates with tasks
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;
    return (
      <div className="cal-dots">
        {dayTasks.slice(0, 3).map((t, i) => (
          <span key={i} className="cal-dot"
            style={{ background: getPriorityColor(t.priority) }}></span>
        ))}
      </div>
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedDateTasks(getTasksForDate(date));
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = filterSubject
      ? t.subjectId?._id === filterSubject || t.subjectId === filterSubject : true;
    const matchPriority = filterPriority ? t.priority === filterPriority : true;
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchSubject && matchPriority && matchStatus;
  });

  return (
    <div className="planner-page">
      <div className="sidebar">
        <h2>📚 Study Planner</h2>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/planner" className="active">📅 Planner</Link>
          <Link to="/pomodoro">⏱️ Pomodoro</Link>
          <Link to="/notes">📝 Notes</Link>
          <Link to="/ai">🤖 AI Assistant</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/leaderboard">🏆 Leaderboard</Link>
          <Link to="/settings">⚙️ Settings</Link>
        </nav>
      </div>

      <div className="planner-main">
        <div className="planner-header">
          <h1>📅 Study Planner</h1>
          <div className="header-btns">
            <button onClick={() => setShowSubjectForm(!showSubjectForm)}>+ Add Subject</button>
            <button onClick={() => setShowTaskForm(!showTaskForm)}>+ Add Task</button>
            <button className="reminder-btn" onClick={() => checkDeadlines(tasks)}>🔔 Check Reminders</button>
          </div>
        </div>

        {/* ✅ View Toggle */}
        <div className="view-toggle">
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}>
            📋 List View
          </button>
          <button
            className={viewMode === 'board' ? 'active' : ''}
            onClick={() => setViewMode('board')}>
            📌 Board View
          </button>
          <button
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}>
            📅 Calendar View
          </button>
        </div>

        {/* Add Subject Form */}
        {showSubjectForm && (
          <div className="form-card">
            <h3>Add New Subject</h3>
            <form onSubmit={addSubject}>
              <input type="text" placeholder="Subject Name"
                value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
              <div className="color-row">
                <label>Color:</label>
                <input type="color" value={subjectColor}
                  onChange={(e) => setSubjectColor(e.target.value)} />
              </div>
              <button type="submit">Save Subject</button>
            </form>
          </div>
        )}

        {/* Add Task Form */}
        {showTaskForm && (
          <div className="form-card">
            <h3>Add New Task</h3>
            <form onSubmit={addTask}>
              <input type="text" placeholder="Task Title"
                value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
              <select value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input type="date" value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)} />
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <button type="submit">Save Task</button>
            </form>
          </div>
        )}

        {/* ✅ CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <div className="calendar-section">
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileContent={tileContent}
              />
            </div>
            <div className="calendar-tasks">
              <h3>📋 Tasks on {selectedDate.toDateString()}</h3>
              {selectedDateTasks.length === 0 ? (
                <p className="empty">No tasks on this date!</p>
              ) : (
                selectedDateTasks.map(t => (
                  <div key={t._id} className="task-card" style={{ marginBottom: '10px' }}>
                    <div className="task-left">
                      <span className="priority-dot"
                        style={{ background: getPriorityColor(t.priority) }}></span>
                      <div>
                        <h4>{t.title}</h4>
                        <p>{t.subjectId?.name || 'No Subject'} • {t.priority}</p>
                      </div>
                    </div>
                    <div className="task-right">
                      <span className={`status-badge ${getBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                      <select value={t.status}
                        onChange={(e) => updateStatus(t._id, e.target.value)}>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ✅ BOARD VIEW (KANBAN) */}
        {viewMode === 'board' && (
          <div className="board-section">
            {['Pending', 'In Progress', 'Done'].map(status => (
              <div 
                key={status} 
                className="board-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="board-column-header">
                  <h3>{status}</h3>
                  <span className="task-count">
                    {tasks.filter(t => t.status === status).length}
                  </span>
                </div>
                <div className="board-column-content">
                  {tasks.filter(t => t.status === status).map(t => (
                    <div 
                      key={t._id} 
                      className={`board-task-card ${t.status === 'Done' ? 'done' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t._id)}
                    >
                      <div className="task-left">
                        <span className="priority-dot" style={{ background: getPriorityColor(t.priority) }}></span>
                        <div>
                          <h4>{t.title}</h4>
                          <p>{t.subjectId?.name || 'No Subject'} • {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No Deadline'}</p>
                        </div>
                      </div>
                      <button className="del-btn" onClick={() => deleteTask(t._id)}>🗑️</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <>
            {/* Search & Filter */}
            <div className="search-filter-bar">
              <input type="text" placeholder="🔍 Search tasks..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input" />
              <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
                className="filter-select">
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select">
                <option value="">All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select">
                <option value="">All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              {(searchQuery || filterSubject || filterPriority || filterStatus) && (
                <button className="clear-btn" onClick={() => {
                  setSearchQuery(''); setFilterSubject('');
                  setFilterPriority(''); setFilterStatus('');
                }}>✕ Clear</button>
              )}
            </div>

            {/* Subjects */}
            <div className="section">
              <h2>📚 My Subjects</h2>
              {subjects.length === 0 ? (
                <p className="empty">No subjects yet!</p>
              ) : (
                <div className="subjects-grid">
                  {subjects.map(s => (
                    <div key={s._id} className="subject-card"
                      style={{ borderLeft: `4px solid ${s.color}` }}>
                      <span>{s.name}</span>
                      <button onClick={() => deleteSubject(s._id)}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="section">
              <h2>✅ My Tasks
                <span className="task-count"> ({filteredTasks.length}/{tasks.length})</span>
              </h2>
              {tasks.length === 0 ? (
                <p className="empty">No tasks yet!</p>
              ) : filteredTasks.length === 0 ? (
                <p className="empty">😕 No tasks match your search!</p>
              ) : (
                <div className="tasks-list">
                  {filteredTasks.map(t => (
                    <div key={t._id} className={`task-card ${t.status === 'Done' ? 'done' : ''}`}>
                      <div className="task-left">
                        <span className="priority-dot"
                          style={{ background: getPriorityColor(t.priority) }}></span>
                        <div>
                          <h4>{t.title}</h4>
                          <p>{t.subjectId?.name || 'No Subject'} • {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No Deadline'}</p>
                        </div>
                      </div>
                      <div className="task-right">
                        <span className={`status-badge ${getBadgeClass(t.status)}`}>
                          {t.status}
                        </span>
                        <select value={t.status}
                          onChange={(e) => updateStatus(t._id, e.target.value)}>
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Done</option>
                        </select>
                        <button onClick={() => deleteTask(t._id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Planner;