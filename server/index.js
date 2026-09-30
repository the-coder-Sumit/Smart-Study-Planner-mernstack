const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Disposition', 'attachment');
  next();
}, express.static('uploads'));

// Routes Import
const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const taskRoutes = require('./routes/tasks');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const notesRoutes = require('./routes/notes');
const aiRoutes = require('./routes/ai');
const quizzesRoutes = require('./routes/quizzes');

// Test Route
app.get('/', (req, res) => {
  res.send('Smart Study Planner API is Running! ✅');
});

// Routes Use
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizzesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error:', err);
  });