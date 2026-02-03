import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Task, TaskCategory, TaskDifficulty } from './types';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import CarouselRow from './components/CarouselRow';
import { SplineSceneBasic } from './components/SplineSceneBasic';
import logo from './assets/Screenshot 2026-01-24 011404.png';
import heroVideo from './assets/video.mp4';
import avatarBluey from './assets/avtars/bluey_1.png';
import avatarVibrent from './assets/avtars/vibrent_3.png';
import avatarToon from './assets/avtars/toon_4.png';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TaskDetail from './pages/TaskDetail';
import Leaderboard from './pages/Leaderboard';
import CompletedTasks from './pages/CompletedTasks';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import ExamPage from './pages/ExamPage';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const THEME_COLOR = '#1A1653';

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          loading ? (
            <div style={{ minHeight: '100vh', backgroundColor: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
              Loading...
            </div>
          ) : (
            <HomePage />
          )
        } 
      />
      <Route
        path="/landing"
        element={
          loading ? (
            <div style={{ minHeight: '100vh', backgroundColor: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
              Loading...
            </div>
          ) : (
            <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', backgroundColor: THEME_COLOR, display: 'flex', flexDirection: 'column' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                  opacity: 0.15
                }}
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px'
              }}>
                {/* Logo */}
                <img 
                  src={logo} 
                  alt="RSM Logo" 
                  style={{
                    height: '120px',
                    width: 'auto',
                    marginBottom: '20px',
                    filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3))',
                    zIndex: 2
                  }}
                />
                
                {/* Title */}
                <h1 style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '40px',
                  textAlign: 'center',
                  letterSpacing: '1px',
                  textShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
                  zIndex: 2
                }}>
                  Research Society MIT
                </h1>

                {/* CTA Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      padding: '18px 56px',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                      color: '#0A0E27',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4)',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      zIndex: 2
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.6)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.4)';
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/login', { state: { isSignup: true } })}
                    style={{
                      padding: '18px 56px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '2px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      zIndex: 2
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 0.5)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/task/:taskId" element={<ProtectedRoute role="student"><TaskDetail /></ProtectedRoute>} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/exam" element={<ProtectedRoute role="student"><ExamPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute role="student"><Leaderboard /></ProtectedRoute>} />
      <Route path="/completed" element={<ProtectedRoute role="student"><CompletedTasks /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;
