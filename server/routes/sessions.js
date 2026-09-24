const express = require('express');
const router = express.Router();
const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ POST /api/sessions — Save a completed Pomodoro session
router.post('/', auth, async (req, res) => {
  try {
    const { type, durationMinutes, distractions, subjectId } = req.body;
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const session = new PomodoroSession({
      userId: req.userId,
      subjectId: subjectId || null,
      type: type || 'work',
      durationMinutes: durationMinutes || 25,
      distractions: distractions || 0,
      date: today,
    });

    await session.save();

    // Gamification & Streak Logic
    if (type === 'work' || !type) {
      const user = await User.findById(req.userId);
      if (user) {
        // Add Score (1 point per minute) and update total minutes
        user.score = (user.score || 0) + (durationMinutes || 25); 
        user.totalStudyMinutes = (user.totalStudyMinutes || 0) + (durationMinutes || 25);

        if (user.lastStudyDate !== today) {
          let newStreak = 1;
          
          if (user.lastStudyDate) {
            const lastDate = new Date(user.lastStudyDate);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak = (user.currentStreak || 0) + 1;
            }
          }
          
          user.currentStreak = newStreak;
          if (newStreak > (user.longestStreak || 0)) {
            user.longestStreak = newStreak;
          }
          user.lastStudyDate = today;
        }
        await user.save();
      }
    }

    res.status(201).json(session);
  } catch (err) {
    console.log('Save session error:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

// ✅ GET /api/sessions — Get all sessions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await PomodoroSession.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// ✅ GET /api/sessions/weekly — Get last 7 days study hours (work sessions only)
router.get('/weekly', auth, async (req, res) => {
  try {
    // Build last 7 days date strings
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    // Fetch all work sessions in the last 7 days
    const sessions = await PomodoroSession.find({
      userId: req.userId,
      type: 'work',
      date: { $in: days },
    });

    // Group by date and sum minutes
    const result = days.map(date => {
      const daySessions = sessions.filter(s => s.date === date);
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const hours = parseFloat((totalMinutes / 60).toFixed(1));
      // Short day label (Mon, Tue etc.)
      const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      return { day: label, hours, date };
    });

    res.json(result);
  } catch (err) {
    console.log('Weekly analytics error:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

// ✅ GET /api/sessions/stats — Total sessions, total minutes, total distractions
router.get('/stats', auth, async (req, res) => {
  try {
    const workSessions = await PomodoroSession.find({ userId: req.userId, type: 'work' });
    const totalSessions = workSessions.length;
    const totalMinutes = workSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalDistractions = workSessions.reduce((sum, s) => sum + s.distractions, 0);

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = workSessions.filter(s => s.date === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.json({
      totalSessions,
      totalMinutes,
      totalDistractions,
      todaySessions: todaySessions.length,
      todayMinutes,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

module.exports = router;
