import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = await loginAdmin(email, password);
    if (!ok) {
      setError('Access denied. Admin credentials required.');
    } else {
      navigate('/admin');
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
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-4">
            ⚙️
          </div>
          <h1 className="text-2xl font-bold" style={{ color: THEME.textPrimary }}>Admin Access</h1>
          <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Research Society MIT</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold block" style={{ color: THEME.textPrimary }}>Admin Email</label>
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
              placeholder="admin@example.com"
            />
          </div>
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
          {error && <p className="text-sm p-3 rounded-lg" style={{ color: '#FF6B6B', backgroundColor: '#FF6B6B33' }}>{error}</p>}
          <button type="submit" className="w-full py-3 rounded-lg font-semibold transition-all mt-6" style={{ backgroundColor: THEME.primary, color: THEME.textPrimary }}>
            Admin Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
