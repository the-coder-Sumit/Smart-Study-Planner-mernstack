const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Subject = require('../models/Subject');



// We will initialize Gemini API inside the routes to prevent server crashes if the key is missing at startup.
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/chat — Chat with AI
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "API Key missing! Developer needs to add GEMINI_API_KEY in .env file and restart server." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a helpful, encouraging AI study assistant named EduBot. The student is asking: "${message}". Reply concisely and helpful.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ reply: `API Error: ${err.message}` });
  }
});

// GET /api/ai/timetable — Generate Smart Timetable
router.get('/timetable', auth, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "API Key missing! Please configure GEMINI_API_KEY in .env and restart server." });
    }

    // Fetch user's subjects
    const subjects = await Subject.find({ userId: req.userId });
    if (subjects.length === 0) {
      return res.json({ reply: "You don't have any subjects added. Add subjects in the Planner to get a timetable!" });
    }

    const subjectNames = subjects.map(s => s.name).join(', ');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Act as an expert study planner. The student is studying the following subjects: ${subjectNames}. 
    Create a highly optimized, realistic weekly study timetable for them. Include time for Pomodoro breaks and revision.
    Format the response clearly using Markdown with headings for days of the week. Keep it practical.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('AI Timetable Error:', err);
    res.status(500).json({ reply: `API Error: ${err.message}` });
  }
});

module.exports = router;
