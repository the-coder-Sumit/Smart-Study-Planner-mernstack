const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/users/me — Get user profile (streak, goals)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/goal — Update daily goal
router.put('/goal', auth, async (req, res) => {
  try {
    const { dailyGoalHours } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { dailyGoalHours },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/password — Change Password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/leaderboard — Get top 10 users by score
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ score: -1 })
      .limit(10)
      .select('name score longestStreak currentStreak totalStudyMinutes');
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
