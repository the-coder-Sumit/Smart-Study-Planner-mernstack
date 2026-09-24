const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId });
    res.json(subjects);
  } catch (err) {
    console.log('Get subjects error:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

// Add subject
router.post('/', auth, async (req, res) => {
  try {
    const subject = new Subject({ ...req.body, userId: req.userId });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.log('Add subject error:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

// Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

module.exports = router;