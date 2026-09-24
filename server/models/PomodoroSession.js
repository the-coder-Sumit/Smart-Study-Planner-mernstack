const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  type: { type: String, enum: ['work', 'break'], default: 'work' },
  durationMinutes: { type: Number, required: true }, // e.g. 25 for work, 5 for break
  distractions: { type: Number, default: 0 },
  date: { type: String, required: true }, // 'YYYY-MM-DD' string for easy grouping
}, { timestamps: true });

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);
