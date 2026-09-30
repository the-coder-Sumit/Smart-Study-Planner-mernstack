import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './QuizViewer.css';

function QuizViewer() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('flashcards');

  // Flashcard state
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // MCQ state
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) navigate('/');
    fetchQuiz();
    // eslint-disable-next-line
  }, [noteId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/quizzes/${noteId}`, { headers });
      setQuiz(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/quizzes/generate/${noteId}`, {}, { headers });
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error generating quiz.');
    }
    setGenerating(false);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentCard(prev => Math.min(prev + 1, quiz.flashcards.length - 1)), 150);
  };
  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentCard(prev => Math.max(prev - 1, 0)), 150);
  };

  const handleOptionSelect = (qIndex, option) => {
    if (showResults) return;
    setAnswers({ ...answers, [qIndex]: option });
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  if (loading) return <div className="quiz-page"><div className="quiz-main"><h2>Loading...</h2></div></div>;

  return (
    <div className="quiz-page">
      <div className="quiz-main">
        <Link to="/notes" className="back-btn">⬅️ Back to Notes</Link>
        
        {!quiz ? (
          <div className="generate-section">
            <h2>🧠 AI Study Material Generator</h2>
            <p>We didn't find an existing quiz for this note.</p>
            <p>EduBot can read your PDF/Image and generate Flashcards & MCQs for you!</p>
            <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
              {generating ? '⏳ AI is reading and generating... (may take 30s)' : '✨ Generate AI Quiz Now'}
            </button>
          </div>
        ) : (
          <>
            <div className="quiz-header">
              <h1>{quiz.title}</h1>
            </div>

            <div className="quiz-tabs">
              <button 
                className={`tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('flashcards')}
              >🗂️ Flashcards</button>
              <button 
                className={`tab-btn ${activeTab === 'mcq' ? 'active' : ''}`}
                onClick={() => setActiveTab('mcq')}
              >📝 MCQ Quiz</button>
            </div>

            {/* FLASHCARDS TAB */}
            {activeTab === 'flashcards' && quiz.flashcards?.length > 0 && (
              <div className="flashcard-container">
                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <h3>{quiz.flashcards[currentCard].front}</h3>
                    </div>
                    <div className="flashcard-back">
                      <h3>{quiz.flashcards[currentCard].back}</h3>
                    </div>
                  </div>
                </div>
                <div className="flashcard-controls">
                  <button onClick={prevCard} disabled={currentCard === 0}>⬅️ Prev</button>
                  <span>{currentCard + 1} / {quiz.flashcards.length}</span>
                  <button onClick={nextCard} disabled={currentCard === quiz.flashcards.length - 1}>Next ➡️</button>
                </div>
                <p style={{marginTop: '15px', color: '#aaa'}}>Click card to flip</p>
              </div>
            )}

            {/* MCQ TAB */}
            {activeTab === 'mcq' && quiz.mcqs?.length > 0 && (
              <div className="mcq-container">
                {quiz.mcqs.map((q, qIndex) => (
                  <div key={qIndex} className="mcq-card">
                    <h3>Q{qIndex + 1}. {q.question}</h3>
                    <div className="mcq-options">
                      {q.options.map((opt, oIndex) => {
                        let className = "mcq-option";
                        if (answers[qIndex] === opt) className += " selected";
                        
                        if (showResults) {
                          if (opt === q.correctAnswer) className += " correct";
                          else if (answers[qIndex] === opt) className += " incorrect";
                        }

                        return (
                          <button 
                            key={oIndex} 
                            className={className}
                            onClick={() => handleOptionSelect(qIndex, opt)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!showResults ? (
                  <button className="submit-quiz-btn" style={{ cursor: "pointer" }} onClick={submitQuiz}>
                    Submit Quiz
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <h2>Your Score: {Object.keys(answers).filter(k => answers[k] === quiz.mcqs[k].correctAnswer).length} / {quiz.mcqs.length}</h2>
                    <button className="tab-btn" onClick={() => {setShowResults(false); setAnswers({});}}>Restart Quiz</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QuizViewer;
