const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true },
  deadline: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
  estimatedHours: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);