const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#667eea' },
  priority: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);