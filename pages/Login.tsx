import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Screenshot 2026-01-24 011404.png';

const THEME = {
  primary: '#1A1653',
  textPrimary: '#F5F6FA',
  textSecondary: '#B8BCD9',
  cardBg: '#2E2E3A',
};

const Login: React.FC = () => {
  const { loginStudent, signupStudent, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState((location.state as any)?.isSignup || false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    const result = await loginWithGoogle();
    if (result.success) {
      navigate('/');
    } else {
      if (result.error === 'popup-closed') {
        setError('Sign-in cancelled.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isForgotPassword) {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccess(null);
        }, 3000);
      } else {
        if (result.error === 'user-not-found') {
          setError('No account found with this email.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      }
      return;
    }

    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      const result = await signupStudent(email, password, name);
      if (!result.success) {
        if (result.error === 'email-exists') {
          setError('This email is already registered. Please login instead.');
          setIsSignup(false);
        } else if (result.error === 'weak-password') {
          setError('Password should be at least 6 characters.');
        } else {
          setError('Signup failed. Please try again.');
        }
      } else {
        navigate('/');
      }
    } else {
      const result = await loginStudent(email, password);
      if (!result.success) {
        if (result.error === 'user-not-found') {
          setError('No account found with this email. Please sign up first.');
          setTimeout(() => setIsSignup(true), 2000);
        } else if (result.error === 'wrong-password') {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        navigate('/');
      }
    }
  };

  const THEME = {
    primary: '#1A1653',
    textPrimary: '#F5F6FA',
    textSecondary: '#B8BCD9',
    cardBg: '#2E2E3A',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: THEME.primary }}>
      <div className="backdrop-blur-md rounded-2xl border p-8 w-full max-w-md" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="RSM Logo" className="h-14 w-auto" />
          <h1 className="text-2xl font-bold mt-4" style={{ color: THEME.textPrimary }}>
            {isForgotPassword ? 'Reset Password' : isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Research Society MIT</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {isSignup && !isForgotPassword && (
            <div>
              <label className="text-sm font-semibold block" style={{ color: THEME.textPrimary }}>Full Name</label>
              <input
                className="mt-1 w-full rounded-lg p-3 border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: `${THEME.textSecondary}15`,
                  color: THEME.textPrimary,
                  borderColor: `${THEME.textSecondary}33`,
                  '--tw-ring-color': THEME.primary
                } as any}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold block" style={{ color: THEME.textPrimary }}>Email</label>
            <input
              className="mt-1 w-full rounded-lg p-3 border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: `${THEME.textSecondary}15`,
                color: THEME.textPrimary,
                borderColor: `${THEME.textSecondary}33`,
                '--tw-ring-color': THEME.primary
              } as any}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </div>
          {!isForgotPassword && (
            <div>
              <label className="text-sm font-semibold block" style={{ color: THEME.textPrimary }}>Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg p-3 border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: `${THEME.textSecondary}15`,
                  color: THEME.textPrimary,
                  borderColor: `${THEME.textSecondary}33`,
                  '--tw-ring-color': THEME.primary
                } as any}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}
          {error && <p className="text-sm p-3 rounded-lg" style={{ color: '#FF6B6B', backgroundColor: '#FF6B6B33' }}>{error}</p>}
          {success && <p className="text-sm p-3 rounded-lg" style={{ color: '#51CF66', backgroundColor: '#51CF6633' }}>{success}</p>}
          <button type="submit" className="w-full py-3 rounded-lg font-semibold transition-all mt-6" style={{ backgroundColor: THEME.primary, color: THEME.textPrimary }}>
            {isForgotPassword ? 'Send Reset Email' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {!isForgotPassword && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: `${THEME.textSecondary}33` }}></div>
              <span className="text-sm" style={{ color: THEME.textSecondary }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: `${THEME.textSecondary}33` }}></div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 border rounded-lg font-semibold flex items-center justify-center gap-3 transition-all"
              style={{
                backgroundColor: `${THEME.textSecondary}15`,
                color: THEME.textPrimary,
                borderColor: `${THEME.textSecondary}33`
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </>
        )}

        <div className="flex flex-col gap-2 mt-6">
          {!isForgotPassword && (
            <button
              onClick={() => { setIsSignup(!isSignup); setError(null); setSuccess(null); }}
              className="text-sm transition-colors"
              style={{ color: THEME.textSecondary }}
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}
          {!isSignup && (
            <button
              onClick={() => { setIsForgotPassword(!isForgotPassword); setError(null); setSuccess(null); }}
              className="text-sm transition-colors"
              style={{ color: THEME.textSecondary }}
            >
              {isForgotPassword ? 'Back to Sign In' : 'Forgot password?'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
