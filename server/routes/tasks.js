const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).populate('subjectId');
    res.json(tasks);
  } catch (err) {
    console.log('Get tasks error:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

// Add task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.userId });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.log('Add task error:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

// Update task status
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

module.exports = router;