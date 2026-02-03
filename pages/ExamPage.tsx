"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Trophy, Star, ChevronLeft, ChevronRight, BookOpen, Clock, Award, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  category: string
}

const examData: Question[] = [
  {
    id: 1,
    question: "What is the primary function of the mitochondria in a cell?",
    options: ["Protein synthesis", "Energy production", "DNA replication", "Cell division"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Biology"
  },
  {
    id: 2,
    question: "Which programming paradigm does JavaScript primarily support?",
    options: ["Object-oriented only", "Functional only", "Multi-paradigm", "Procedural only"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Computer Science"
  },
  {
    id: 3,
    question: "What is the derivative of x² with respect to x?",
    options: ["x", "2x", "x²", "2x²"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Mathematics"
  },
  {
    id: 4,
    question: "Which layer of the OSI model is responsible for routing?",
    options: ["Data Link Layer", "Transport Layer", "Network Layer", "Session Layer"],
    correctAnswer: 2,
    difficulty: "hard",
    category: "Networking"
  },
  {
    id: 5,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Algorithms"
  },
  {
    id: 6,
    question: "Which principle states that energy cannot be created or destroyed?",
    options: ["Newton's First Law", "Law of Conservation of Energy", "Second Law of Thermodynamics", "Principle of Relativity"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Physics"
  },
  {
    id: 7,
    question: "What does SQL stand for?",
    options: ["Structured Query Language", "Simple Question Language", "Standard Query Logic", "System Query Language"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Database"
  },
  {
    id: 8,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Data Structures"
  }
]

export default function ExamComponent() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(examData.length).fill(null))
  const [examStarted, setExamStarted] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)
    setShowFeedback(true)

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < examData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[currentQuestion + 1])
      setShowFeedback(answers[currentQuestion + 1] !== null)
    } else {
      setExamCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1])
      setShowFeedback(answers[currentQuestion - 1] !== null)
    }
  }

  const resetExam = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setExamCompleted(false)
    setAnswers(Array(examData.length).fill(null))
    setExamStarted(false)
  }

  const calculateScore = () => {
    return answers.reduce((total, answer, index) => {
      if (answer === examData[index].correctAnswer) {
        return total + 1
      }
      return total
    }, 0)
  }

  const getGrade = () => {
    const percentage = (calculateScore() / examData.length) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" }
    if (percentage >= 80) return { grade: "A", color: "text-green-500" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600" }
    if (percentage >= 50) return { grade: "D", color: "text-orange-600" }
    return { grade: "F", color: "text-red-600" }
  }

  const getPerformanceMessage = () => {
    const percentage = (calculateScore() / examData.length) * 100
    if (percentage >= 90) return "Outstanding Performance! 🎉"
    if (percentage >= 80) return "Excellent Work! 🌟"
    if (percentage >= 70) return "Good Job! 👍"
    if (percentage >= 60) return "Fair Performance 📚"
    return "Keep Practicing! 💪"
  }

  if (!examStarted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Card style={{ width: '100%', maxWidth: '48rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', background: 'rgba(26, 31, 58, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(212, 175, 55, 0.2)', borderRadius: '9999px', filter: 'blur(20px)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                <BookOpen style={{ width: '5rem', height: '5rem', color: '#D4AF37', position: 'relative' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white' }}>Final Examination</h1>
              <p style={{ color: '#B8C5D6', fontSize: '1.125rem' }}>Test Your Knowledge Across Multiple Subjects</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1.5rem 0' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Target style={{ width: '2rem', height: '2rem', color: '#D4AF37', margin: '0 auto' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{examData.length}</div>
                <div style={{ fontSize: '0.875rem', color: '#B8C5D6' }}>Questions</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Clock style={{ width: '2rem', height: '2rem', color: '#D4AF37', margin: '0 auto' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>~{examData.length * 2} min</div>
                <div style={{ fontSize: '0.875rem', color: '#B8C5D6' }}>Duration</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Award style={{ width: '2rem', height: '2rem', color: '#D4AF37', margin: '0 auto' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Mixed</div>
                <div style={{ fontSize: '0.875rem', color: '#B8C5D6' }}>Difficulty</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#D4AF37' }} />
                Exam Instructions:
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#B8C5D6', marginLeft: '1.75rem' }}>
                <li>• Read each question carefully before selecting your answer</li>
                <li>• You can navigate between questions using Previous/Next buttons</li>
                <li>• Once you select an answer, feedback will be shown immediately</li>
                <li>• Your progress is tracked throughout the exam</li>
                <li>• Complete all questions to see your final results</li>
              </ul>
            </div>

            <Button 
              onClick={() => setExamStarted(true)}
              size="lg"
              style={{ width: '100%', fontSize: '1.125rem', height: '3.5rem', background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#0A0E27', border: 'none', fontWeight: '700' }}
            >
              Start Examination
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ... (continuing in next file due to length)

  if (examCompleted) {
    const finalScore = calculateScore()
    const percentage = Math.round((finalScore / examData.length) * 100)
    const gradeInfo = getGrade()

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Card style={{ width: '100%', maxWidth: '64rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', background: 'rgba(26, 31, 58, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(212, 175, 55, 0.2)', borderRadius: '9999px', filter: 'blur(30px)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                <Trophy style={{ width: '6rem', height: '6rem', color: '#D4AF37', position: 'relative' }} />
              </div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white' }}>Exam Completed!</h1>
              <p style={{ color: '#B8C5D6', fontSize: '1.125rem' }}>{getPerformanceMessage()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <Card style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.1) 100%)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#B8C5D6', fontWeight: '500' }}>Your Score</div>
                  <div style={{ fontSize: '3.75rem', fontWeight: '700', color: 'white' }}>
                    {finalScore}/{examData.length}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#B8C5D6' }}>{percentage}%</div>
                  <Progress value={percentage} style={{ height: '0.75rem' }} />
                </div>
              </Card>

              <Card style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#B8C5D6', fontWeight: '500' }}>Grade</div>
                  <div style={{ fontSize: '4.5rem', fontWeight: '700' }} className={gradeInfo.color}>
                    {gradeInfo.grade}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '1rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        style={{
                          width: '2rem',
                          height: '2rem',
                          color: i < Math.ceil((finalScore / examData.length) * 5) ? '#FBBF24' : 'rgba(255, 255, 255, 0.2)',
                          fill: i < Math.ceil((finalScore / examData.length) * 5) ? '#FBBF24' : 'transparent'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white' }}>Question Review</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.75rem' }}>
                {examData.map((question, index) => (
                  <div key={index} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        border: '2px solid',
                        transition: 'all 0.3s',
                        ...(answers[index] === question.correctAnswer
                          ? { background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22C55E', color: '#22C55E' }
                          : { background: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', color: '#EF4444' })
                      }}
                    >
                      {answers[index] === question.correctAnswer ? (
                        <CheckCircle style={{ width: '1.5rem', height: '1.5rem' }} />
                      ) : (
                        <XCircle style={{ width: '1.5rem', height: '1.5rem' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#B8C5D6' }}>Q{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
              <Button 
                onClick={resetExam}
                size="lg"
                style={{ padding: '0 2rem', background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#0A0E27', border: 'none', fontWeight: '700' }}
              >
                Retake Examination
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const question = examData[currentQuestion]
  const progress = ((currentQuestion + 1) / examData.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <Card style={{ width: '100%', maxWidth: '64rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', background: 'rgba(26, 31, 58, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#B8C5D6', fontWeight: '500' }}>
                Question {currentQuestion + 1} of {examData.length}
              </div>
              <Badge variant="secondary" style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: '#D4AF37', border: 'none' }}>
                {question.category}
              </Badge>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#B8C5D6', fontWeight: '500' }}>
                Score: {calculateScore()}/{answers.filter((a) => a !== null).length}
              </div>
              <Badge 
                variant={question.difficulty === "easy" ? "secondary" : question.difficulty === "medium" ? "default" : "destructive"}
                style={{ fontSize: '0.75rem', background: question.difficulty === "easy" ? 'rgba(34, 197, 94, 0.2)' : question.difficulty === "medium" ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: 'white', border: 'none', textTransform: 'capitalize' }}
              >
                {question.difficulty}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Progress value={progress} style={{ height: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
              {examData.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'all 0.3s',
                    ...(answers[index] !== null
                      ? answers[index] === examData[index].correctAnswer
                        ? { background: '#22C55E' }
                        : { background: '#EF4444' }
                      : index === currentQuestion
                        ? { background: '#D4AF37', transform: 'scale(1.5)' }
                        : { background: 'rgba(255, 255, 255, 0.2)' })
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', lineHeight: '1.3' }}>
              {question.question}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {question.options.map((option, index) => {
              let buttonStyle: React.CSSProperties = {
                width: '100%',
                padding: '1rem',
                textAlign: 'left',
                border: '2px solid',
                transition: 'all 0.3s',
                borderRadius: '0.5rem',
                cursor: showFeedback ? 'default' : 'pointer',
                background: 'transparent'
              }

              let icon = null

              if (showFeedback) {
                if (index === question.correctAnswer) {
                  buttonStyle = {
                    ...buttonStyle,
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderColor: '#22C55E',
                    color: '#22C55E'
                  }
                  icon = <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                } else if (index === selectedAnswer) {
                  buttonStyle = {
                    ...buttonStyle,
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#EF4444',
                    color: '#EF4444'
                  }
                  icon = <XCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                } else {
                  buttonStyle = {
                    ...buttonStyle,
                    opacity: 0.5,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#B8C5D6'
                  }
                }
              } else {
                if (index === selectedAnswer) {
                  buttonStyle = {
                    ...buttonStyle,
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderColor: '#D4AF37',
                    color: 'white'
                  }
                } else {
                  buttonStyle = {
                    ...buttonStyle,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }
                }
              }

              return (
                <button
                  key={index}
                  style={buttonStyle}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  onMouseEnter={(e) => {
                    if (!showFeedback) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showFeedback && index !== selectedAnswer) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500' }}>{option}</span>
                    {icon}
                  </div>
                </button>
              )
            })}
          </div>

          {showFeedback && (
            <Card style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ textAlign: 'center' }}>
                {selectedAnswer === question.correctAnswer ? (
                  <div style={{ color: '#22C55E', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Correct Answer! Excellent!</span>
                  </div>
                ) : (
                  <div style={{ color: '#B8C5D6' }}>
                    Correct answer:{" "}
                    <span style={{ fontWeight: '600', color: 'white' }}>
                      {question.options[question.correctAnswer]}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white' }}
            >
              <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
              Previous
            </Button>

            <div style={{ fontSize: '0.875rem', color: '#B8C5D6' }}>
              {selectedAnswer !== null ? "✓ Answered" : "Select an answer"}
            </div>

            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              style={{ display: 'flex', gap: '0.5rem', background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#0A0E27', border: 'none', fontWeight: '700' }}
            >
              {currentQuestion === examData.length - 1 ? "Finish" : "Next"}
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
