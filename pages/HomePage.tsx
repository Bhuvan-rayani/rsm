'use client'

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { SplineSceneBasic } from '../components/SplineSceneBasic';
import { MagicTextReveal } from '../components/ui/magic-text-reveal';
import logo from '../assets/Screenshot 2026-01-24 011404.png';
import heroVideo from '../assets/video.mp4';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const THEME_COLOR = '#1A1653';
  
  // Premium color palette
  const colors = {
    accent: '#D4AF37',            // Premium gold
    accentHover: '#F4D03F',       // Brighter gold
    textPrimary: '#FFFFFF',
    textSecondary: '#B8C5D6',
    border: 'rgba(212, 175, 55, 0.2)'
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: THEME_COLOR,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          color: colors.accent, 
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      overflow: 'hidden', 
      backgroundColor: THEME_COLOR, 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Video Background */}
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
      
      {/* Glassmorphism Overlay */}
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
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Only show buttons when not logged in */}
        {!user && (
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(12px, 3vw, 20px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0 clamp(16px, 4vw, 32px)'
          }}>
            <button
              onClick={() => navigate('/login')}
              style={{                minWidth: 'clamp(200px, 40vw, 280px)',                padding: 'clamp(14px, 3vw, 18px) clamp(32px, 8vw, 56px)',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                color: '#0A0E27',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(14px, 3vw, 18px)',
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
              onClick={() => navigate('/login')}
              style={{
                minWidth: 'clamp(200px, 40vw, 280px)',
                padding: 'clamp(14px, 3vw, 18px) clamp(32px, 8vw, 56px)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: 'white',
                border: '2px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '12px',
                fontSize: 'clamp(14px, 3vw, 18px)',
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
        )}
        
        {/* Show 3D scene with overlays when logged in */}
        {user && (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Text and Button Overlay on left */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '80px',
              transform: 'translateY(-50%)',
              zIndex: 15,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Magic Text Reveal with User's Name - Above Research Society */}
              <MagicTextReveal 
                text={`Welcome, ${user.displayName || user.email?.split('@')[0] || 'User'}!`}
                color={colors.accent}
                fontSize={40}
                fontWeight={700}
                spread={50}
                speed={0.6}
                density={5}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: '0',
                  marginBottom: '20px'
                }}
              />
              
              <h1 style={{
                fontSize: 'clamp(32px, 8vw, 64px)',
                fontWeight: '800',
                background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.accent} 100%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '10px',
                letterSpacing: '1px',
                lineHeight: '1.1'
              }}>
                Research Society Manipal
              </h1>
              <h2 style={{
                fontSize: 'clamp(18px, 4vw, 36px)',
                fontWeight: '600',
                color: colors.textSecondary,
                letterSpacing: '0.5px',
                marginBottom: '20px'
              }}>
                Robotics TaskPhase
              </h2>
              
              {/* Dashboard Button */}
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: 'clamp(14px, 3vw, 18px) clamp(32px, 8vw, 56px)',
                  minWidth: 'clamp(200px, 40vw, 300px)',
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #B8860B 100%)`,
                  color: '#0A0E27',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: `0 10px 30px rgba(212, 175, 55, 0.4)`,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  width: 'fit-content'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 15px 40px rgba(212, 175, 55, 0.6)`;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.accentHover} 0%, ${colors.accent} 100%)`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 10px 30px rgba(212, 175, 55, 0.4)`;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.accent} 0%, #B8860B 100%)`;
                }}
              >
                Go to Dashboard
              </button>
            </div>
            
            {/* 3D Scene Full Page */}
            <SplineSceneBasic />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
