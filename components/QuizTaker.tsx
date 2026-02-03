import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Quiz, Question } from '../types';
import { quiz1 } from '../data/quizzes';

interface QuizTakerProps {
  quiz?: Quiz;
  userId: string;
  userName: string;
  onComplete: (score: number, totalPoints: number) => void;
  onClose: () => void;
  THEME: any;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz = quiz1, userId, userName, onComplete, onClose, THEME }) => {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  // Validate userId on mount
  useEffect(() => {
    if (!userId || userId === 'anonymous') {
      setError('User not authenticated. Please log in to submit quizzes.');
    }
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);

      // Check if quiz has a time limit and if time has expired
      if (quiz.timeLimit && elapsed >= quiz.timeLimit && !submitted) {
        setTimeExpired(true);
        // Auto-submit the quiz
        setTimeout(() => {
          handleSubmitAuto();
        }, 100);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, quiz.timeLimit, submitted]);

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  const handleAnswerChange = (questionId: string, value: string | string[], isMultiple: boolean) => {
    if (isMultiple) {
      const current = (answers[questionId] ?? []) as string[];
      const stringValue = typeof value === 'string' ? value : String(value);
      const updated = current.includes(stringValue)
        ? current.filter(a => a !== stringValue)
        : [...current, stringValue];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const calculateScore = () => {
    let totalScore = 0;

    quiz.questions.forEach(q => {
      const userAnswer = answers[q.id];
      const isCorrect = 
        q.type === 'multiple'
          ? JSON.stringify((userAnswer ?? []).sort()) === JSON.stringify((q.correctAnswers as string[]).sort())
          : userAnswer === q.correctAnswers;

      if (isCorrect) {
        totalScore += q.points;
      }
    });

    return totalScore;
  };

  const handleSubmitAuto = async () => {
    // Auto-submit when time expires - call handleSubmit
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const finalScore = calculateScore();
    setScore(finalScore);

    try {
      // Ensure answers only contain serializable data
      const serializedAnswers: Record<string, any> = {};
      for (const [key, value] of Object.entries(answers)) {
        if (Array.isArray(value)) {
          serializedAnswers[key] = value.map(v => String(v));
        } else {
          serializedAnswers[key] = String(value || '');
        }
      }

      // Check for required fields
      if (!userId || userId === 'anonymous') {
        throw new Error('User ID is invalid or missing. Please ensure you are logged in.');
      }

      const attemptData = {
        userId,
        userName: userName || 'Student',
        quizId: quiz.id || 'unknown-quiz',
        quizTitle: quiz.title || 'Untitled Quiz',
        answers: serializedAnswers,
        score: finalScore,
        totalPoints,
        timeSpent,
        completedAt: serverTimestamp(),
      };

      console.log('=== QUIZ SUBMISSION START ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('User ID:', userId);
      console.log('User Name:', userName);
      console.log('Quiz ID:', quiz.id);
      console.log('Score:', finalScore, '/', totalPoints);
      console.log('Answers count:', Object.keys(serializedAnswers).length);
      console.log('Full attempt data:', JSON.stringify(attemptData, null, 2));

      console.log('\n📤 Sending to Firestore...');
      console.log('Collection: quizAttempts');
      console.log('Database:', db ? 'Connected' : 'NOT CONNECTED');

      const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);
      
      console.log('\n✅ SUCCESS!');
      console.log('Document ID:', docRef.id);
      console.log('Document path:', docRef.path);
      console.log('=== QUIZ SUBMISSION END ===\n');
    } catch (err: any) {
      console.error('\n❌ QUIZ SUBMISSION FAILED');
      console.error('=== ERROR DETAILS ===');
      console.error('Error Type:', err.constructor.name);
      console.error('Error Code:', err.code || 'N/A');
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      console.error('Full Error Object:', err);
      
      // Additional debugging info
      if (err.code === 'permission-denied') {
        console.error('\n🔒 PERMISSION ISSUE:');
        console.error('Firestore security rules are likely blocking this write.');
        console.error('Fix: Update Firestore rules in Firebase Console.');
        console.error('See FIRESTORE_SETUP.md for instructions.');
      }
      
      console.error('=== END ERROR DETAILS ===\n');
      
      const errorMsg = err.code === 'permission-denied' 
        ? 'Permission denied: Check Firestore security rules (see FIRESTORE_SETUP.md)'
        : err.code === 'unauthenticated'
        ? 'Not authenticated: Please log in again'
        : err.message || 'Unknown error occurred';
      
      setError(`❌ Failed to save quiz attempt: ${errorMsg}`);
    } finally {
      setLoading(false);
      // ALWAYS show results, even if save fails
      setSubmitted(true);
      onComplete(finalScore, totalPoints);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (submitted) {
    const percentage = Math.round((score / totalPoints) * 100);
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(26, 22, 83, 0.95)' }}>
          {error && (
            <div className="p-4 rounded-lg border border-orange-500/50 bg-orange-500/15 mb-4">
              <p className="text-orange-300 text-sm font-semibold">⚠️ {error}</p>
              <p className="text-xs mt-1" style={{ color: THEME.textMuted }}>Your score was recorded locally if saved.</p>
            </div>
          )}
          <h2 className="text-3xl font-black mb-6 text-center" style={{ color: THEME.textPrimary }}>
            {percentage >= 80 ? '🎉 Great Job!' : percentage >= 60 ? '👍 Good Effort!' : '📚 Keep Learning!'}
          </h2>

          <div className="text-center mb-8">
            <div className="text-6xl font-black" style={{ color: THEME.accentPrimary }}>
              {score}/{totalPoints}
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: THEME.textSecondary }}>
              {percentage}%
            </p>
            <p className="text-sm mt-2" style={{ color: THEME.textMuted }}>
              Time: {formatTime(timeSpent)}
            </p>
          </div>

          {/* Answer Breakdown */}
          <div className="space-y-4 mb-8">
            <h3 className="font-bold" style={{ color: THEME.textPrimary }}>Answer Breakdown:</h3>
            {quiz.questions.map(q => {
              const userAnswer = answers[q.id];
              const isCorrect =
                q.type === 'multiple'
                  ? JSON.stringify((userAnswer ?? []).sort()) === JSON.stringify((q.correctAnswers as string[]).sort())
                  : userAnswer === q.correctAnswers;

              const correctAnswerLabel = Array.isArray(q.correctAnswers)
                ? (q.correctAnswers as string[]).join(', ')
                : q.correctAnswers;

              const userAnswerLabel = Array.isArray(userAnswer)
                ? (userAnswer as string[]).join(', ') || 'Not answered'
                : userAnswer || 'Not answered';

              return (
                <div
                  key={q.id}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    borderColor: isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: THEME.textPrimary }}>
                    {q.id}: {q.text}
                  </p>
                  <p className="text-xs mt-1" style={{ color: isCorrect ? '#22C55E' : '#EF4444' }}>
                    {isCorrect ? '✅ Correct' : '❌ Incorrect'} (+{isCorrect ? q.points : 0}/{q.points} points)
                  </p>
                  <p className="text-xs mt-1" style={{ color: THEME.textSecondary }}>
                    Your answer: {userAnswerLabel}
                  </p>
                  <p className="text-xs" style={{ color: THEME.textSecondary }}>
                    Correct answer: {correctAnswerLabel}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 font-semibold rounded-lg"
            style={{ backgroundColor: THEME.accentPrimary, color: THEME.background }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(26, 22, 83, 0.95)' }}>
        {error && (
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 mb-4">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
            <button
              onClick={onClose}
              className="mt-3 w-full py-2 rounded-lg font-semibold"
              style={{ backgroundColor: THEME.accentPrimary, color: THEME.background }}
            >
              Close
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: THEME.textPrimary }}>{quiz.title}</h2>
                <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>
                  Question {currentQuestionIdx + 1} of {quiz.questions.length} 
                  {quiz.timeLimit ? ` • Time: ${formatTime(timeSpent)} / ${formatTime(quiz.timeLimit)}` : ` • Time: ${formatTime(timeSpent)}`}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={timeExpired}
                className="text-2xl font-bold hover:opacity-70"
                style={{ color: THEME.textSecondary, opacity: timeExpired ? 0.5 : 1 }}
              >
                ×
              </button>
            </div>

            {/* Time Warning */}
            {quiz.timeLimit && timeSpent >= quiz.timeLimit * 0.9 && !timeExpired && (
              <div className="p-3 rounded-lg border border-orange-500/50 bg-orange-500/15 mb-4">
                <p className="text-orange-300 text-sm font-semibold">
                  ⏰ Time almost expired! {Math.max(0, quiz.timeLimit - timeSpent)} seconds remaining
                </p>
              </div>
            )}

            {timeExpired && (
              <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/15 mb-4">
                <p className="text-red-300 text-sm font-semibold">
                  ⏱️ Time's up! Auto-submitting your quiz...
                </p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: THEME.accentPrimary,
                  width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-6" style={{ color: THEME.textPrimary }}>
                {currentQuestion.text}
              </h3>

              <div className="space-y-3">
                {currentQuestion.type === 'single' && currentQuestion.options && (
                  currentQuestion.options.map(option => (
                    <label key={option} className="flex items-center p-3 rounded-lg border cursor-pointer transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: answers[currentQuestion.id] === option ? `${THEME.accentPrimary}20` : 'transparent' }}>
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option, false)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="ml-3" style={{ color: THEME.textPrimary }}>
                        {option}
                      </span>
                    </label>
                  ))
                )}

                {currentQuestion.type === 'multiple' && currentQuestion.options && (
                  currentQuestion.options.map(option => (
                    <label key={option} className="flex items-center p-3 rounded-lg border cursor-pointer transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: (answers[currentQuestion.id] as string[])?.includes(option) ? `${THEME.accentPrimary}20` : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={(answers[currentQuestion.id] as string[])?.includes(option) ?? false}
                        onChange={() => handleAnswerChange(currentQuestion.id, option, true)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="ml-3" style={{ color: THEME.textPrimary }}>
                        {option}
                      </span>
                    </label>
                  ))
                )}
              </div>

              <p className="text-xs mt-4" style={{ color: THEME.textMuted }}>
                {currentQuestion.type === 'multiple' ? '(Multiple correct answers)' : '(Select one answer)'}
                {currentQuestion.points > 0 && ` • Worth ${currentQuestion.points} points`}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0 || timeExpired}
                className="flex-1 py-2 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: (currentQuestionIdx === 0 || timeExpired) ? 'rgba(255,255,255,0.1)' : THEME.accentPrimary,
                  color: THEME.background,
                  opacity: (currentQuestionIdx === 0 || timeExpired) ? 0.5 : 1,
                  cursor: (currentQuestionIdx === 0 || timeExpired) ? 'not-allowed' : 'pointer'
                }}
              >
                ← Previous
              </button>

              {currentQuestionIdx < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  disabled={timeExpired}
                  className="flex-1 py-2 rounded-lg font-semibold"
                  style={{ 
                    backgroundColor: timeExpired ? 'rgba(255,255,255,0.1)' : THEME.accentPrimary, 
                    color: THEME.background,
                    opacity: timeExpired ? 0.5 : 1,
                    cursor: timeExpired ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || timeExpired}
                  className="flex-1 py-2 rounded-lg font-semibold"
                  style={{ 
                    backgroundColor: (loading || timeExpired) ? 'rgba(255,255,255,0.1)' : THEME.accentPrimary, 
                    color: THEME.background, 
                    opacity: (loading || timeExpired) ? 0.6 : 1,
                    cursor: (loading || timeExpired) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Submitting...' : timeExpired ? 'Auto-submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
