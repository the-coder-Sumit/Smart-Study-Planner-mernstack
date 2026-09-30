const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');

const QuizScore = require('../models/QuizScore');

// POST /api/quizzes/score - Save a quiz score
router.post('/score', auth, async (req, res) => {
  try {
    const { noteId, noteTitle, score, total } = req.body;
    
    let actualSubjectName = 'General';
    try {
      const Note = require('../models/Note');
      const note = await Note.findById(noteId).populate('subjectId');
      if (note && note.subjectId && note.subjectId.name) {
        actualSubjectName = note.subjectId.name;
      }
    } catch(e) {
      console.log('Error fetching subject', e);
    }

    const newScore = new QuizScore({
      userId: req.userId,
      noteId,
      noteTitle,
      subjectName: actualSubjectName,
      score,
      total
    });
    await newScore.save();
    res.json(newScore);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quizzes/scores - Get all quiz scores for a user
router.get('/scores', auth, async (req, res) => {
  try {
    const scores = await QuizScore.find({ userId: req.userId }).sort({ date: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});




// GET /api/quizzes/:noteId - Fetch existing quiz for a note
router.get('/:noteId', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ noteId: req.params.noteId, userId: req.userId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this note.' });
    }
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching quiz.' });
  }
});

// POST /api/quizzes/generate/:noteId - Generate and save a new quiz using Gemini AI
router.post('/generate/:noteId', auth, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is missing.' });
    }

    const note = await Note.findOne({ _id: req.params.noteId, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ noteId: note._id });
    if (existingQuiz) {
      return res.status(400).json({ message: 'Quiz already exists for this note. Please fetch it instead.' });
    }

    // Construct full path to file
    const filePath = path.join(__dirname, '..', 'uploads', note.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found on server.' });
    }

    // Determine mime type
    let mimeType = 'application/pdf';
    if (note.fileType.includes('image')) {
      mimeType = note.fileType;
    }

    // Upload to Google API
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: note.title,
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The Prompt requesting JSON structure
    const prompt = `Act as an expert tutor. 
    Thoroughly analyze the attached educational document, covering EVERY major topic inside it.
    Extract the core concepts and generate a comprehensive study guide designed for a quick, effective revision.
    The difficulty of the questions should be MODERATE. Avoid overly complex or confusing questions; focus on testing key concepts clearly.
    
    You must generate exactly:
    1. 15 multiple choice questions (MCQs) of moderate difficulty that cover the entire document evenly.
    2. 10 flashcards (question and answer pairs) for quick memorization of important definitions and key terms.
    
    You MUST return ONLY valid JSON matching this exact structure, with no markdown formatting or backticks around it:
    {
      "flashcards": [
        { "front": "Question here", "back": "Answer here" }
      ],
      "mcqs": [
        { "question": "MCQ Question", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }
      ]
    }`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
        }
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini's JSON output
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let generatedData;
    try {
      generatedData = JSON.parse(cleanJsonString);
    } catch (parseErr) {
      console.error("JSON Parse Error. Raw Output:", responseText);
      return res.status(500).json({ message: 'AI returned invalid data format. Try again.' });
    }

    // Save to DB
    const newQuiz = new Quiz({
      userId: req.userId,
      noteId: note._id,
      title: `${note.title} Quiz`,
      flashcards: generatedData.flashcards || [],
      mcqs: generatedData.mcqs || []
    });

    await newQuiz.save();

    // Clean up the file from Google servers
    try {
      await fileManager.deleteFile(uploadResponse.file.name);
    } catch (cleanupErr) {
      console.log('Non-critical error cleaning up file from Google API:', cleanupErr.message);
    }

    res.json(newQuiz);
  } catch (err) {
    console.error('Quiz Generation Error:', err);
    res.status(500).json({ message: `API Error: ${err.message}` });
  }
});

module.exports = router;
