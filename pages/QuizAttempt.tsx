import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Quiz, Question } from '../types';

interface QuizAnswers {
  [questionId: string]: string | string[];
}

interface QuizResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  timeInSeconds: number;
  answers: QuizAnswers;
  completedAt: Date;
}

const THEME = {
  background: '#0A0E27',
  textPrimary: '#F5F6FA',
  textSecondary: '#B8BCD9',
  card: '#2E2E3A',
  accentPrimary: '#1DB854',
  accentSecondary: '#26D07C'
};

const QuizAttempt: React.FC<{ quiz: Quiz; onComplete: (result: QuizResult) => void; onCancel: () => void }> = ({ quiz, onComplete, onCancel }) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const question = quiz.questions[currentQuestion];
  const isMultiChoice = question.type === 'multiple-choice';
  const currentAnswer = answers[question.id] || (isMultiChoice ? [] : '');

  const handleAnswer = (value: string) => {
    if (isMultiChoice) {
      const arr = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (arr.includes(value)) {
        setAnswers({
          ...answers,
          [question.id]: arr.filter(a => a !== value)
        });
      } else {
        setAnswers({
          ...answers,
          [question.id]: [...arr, value]
        });
      }
    } else {
      setAnswers({
        ...answers,
        [question.id]: value
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = () => {
    // Calculate score
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach(q => {
      totalPoints += q.points;
      const userAnswer = answers[q.id];
      
      if (isCorrect(q, userAnswer)) {
        score += q.points;
      }
    });

    const result: QuizResult = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      totalPoints,
      timeInSeconds,
      answers,
      completedAt: new Date()
    };

    onComplete(result);
    setShowResults(true);
  };

  const isCorrect = (question: Question, answer: any): boolean => {
    if (question.type === 'multiple-choice') {
      const userAnswers = Array.isArray(answer) ? answer : [];
      const correctAnswers = question.correctAnswers || [];
      return userAnswers.length === correctAnswers.length && 
             userAnswers.every(a => correctAnswers.includes(a));
    } else {
      return answer === question.correctAnswers?.[0];
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const score = calculateScore();
  const percentage = Math.round((score.score / score.totalPoints) * 100);

  function calculateScore() {
    let s = 0;
    let total = 0;
    quiz.questions.forEach(q => {
      total += q.points;
      if (isCorrect(q, answers[q.id])) {
        s += q.points;
      }
    });
    return { score: s, totalPoints: total };
  }

  if (showResults) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: THEME.card,
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ color: THEME.textPrimary, fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
            Quiz Complete! 🎉
          </h2>

          {/* Score Display */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: THEME.background,
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '64px', fontWeight: 'bold', color: percentage >= 70 ? '#10B981' : '#F59E0B', marginBottom: '10px' }}>
              {percentage}%
            </div>
            <div style={{ color: THEME.textSecondary, marginBottom: '10px' }}>
              Score: {score.score}/{score.totalPoints} points
            </div>
            <div style={{ color: THEME.textSecondary }}>
              Time: {formatTime(timeInSeconds)}
            </div>
          </div>

          {/* Results Review */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: THEME.textPrimary, fontWeight: 'bold', marginBottom: '15px' }}>Answer Review</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {quiz.questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isAnswerCorrect = isCorrect(q, userAnswer);
                return (
                  <div key={q.id} style={{
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: THEME.background,
                    borderRadius: '8px',
                    borderLeft: `4px solid ${isAnswerCorrect ? '#10B981' : '#EF4444'}`
                  }}>
                    <div style={{ color: THEME.textPrimary, fontWeight: 'bold', marginBottom: '8px' }}>
                      Q{idx + 1}: {q.text}
                    </div>
                    <div style={{ color: isAnswerCorrect ? '#10B981' : '#EF4444', fontSize: '14px', marginBottom: '5px' }}>
                      {isAnswerCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </div>
                    <div style={{ color: THEME.textSecondary, fontSize: '14px' }}>
                      Your Answer: {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'No answer'}
                    </div>
                    {!isAnswerCorrect && (
                      <div style={{ color: '#10B981', fontSize: '14px', marginTop: '5px' }}>
                        Correct Answer: {q.correctAnswers?.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              onCancel();
              setShowResults(false);
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: THEME.accentPrimary,
              color: THEME.background,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: THEME.card,
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '700px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: THEME.textPrimary, fontSize: '24px', fontWeight: 'bold' }}>
            {quiz.title}
          </h2>
          <div style={{ color: THEME.textSecondary, fontWeight: 'bold' }}>
            ⏱️ {formatTime(timeInSeconds)}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
            color: THEME.textSecondary,
            fontSize: '14px'
          }}>
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: THEME.background,
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: THEME.accentPrimary,
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
              transition: 'width 0.3s'
            }}></div>
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: THEME.textPrimary,
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            {question.text}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options?.map((option, idx) => {
              const isSelected = isMultiChoice
                ? (Array.isArray(currentAnswer) && currentAnswer.includes(option))
                : currentAnswer === option;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: isSelected ? THEME.accentPrimary : THEME.background,
                    color: isSelected ? THEME.background : THEME.textPrimary,
                    border: isSelected ? 'none' : `2px solid ${THEME.accentPrimary}40`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = THEME.accentPrimary + '20';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = THEME.background;
                    }
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: THEME.background,
              color: THEME.textPrimary,
              border: `2px solid ${THEME.accentPrimary}40`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: THEME.background,
                  color: THEME.textSecondary,
                  border: `2px solid ${THEME.accentPrimary}40`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ← Previous
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                backgroundColor: THEME.accentPrimary,
                color: THEME.background,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.accentSecondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.accentPrimary}
            >
              {currentQuestion === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
