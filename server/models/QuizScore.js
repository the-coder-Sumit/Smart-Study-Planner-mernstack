const mongoose = require('mongoose');

const quizScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  noteTitle: { type: String, required: true },
  subjectName: { type: String, default: 'General' },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizScore', quizScoreSchema);
