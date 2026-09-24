const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dailyGoalHours: {
    type: Number,
    default: 2 // default goal 2 hours
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: String, // 'YYYY-MM-DD'
    default: null
  },
  resetOtp: {
    type: String
  },
  resetOtpExpires: {
    type: Date
  },
  score: {
    type: Number,
    default: 0
  },
  totalStudyMinutes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);