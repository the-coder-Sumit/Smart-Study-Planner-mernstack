const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  flashcards: [{
    front: String,
    back: String
  }],
  mcqs: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
