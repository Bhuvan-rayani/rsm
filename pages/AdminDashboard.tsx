import React from 'react';
import { useAuth } from '../auth/AuthContext';

interface Performance {
  student: string;
  tasksCompleted: number;
  score: number; // 0-100
}

const mockPerformance: Performance[] = [
  { student: 'Aarav', tasksCompleted: 3, score: 78 },
  { student: 'Diya', tasksCompleted: 2, score: 84 },
  { student: 'Karthik', tasksCompleted: 4, score: 91 },
  { student: 'Meera', tasksCompleted: 1, score: 66 }
];

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const THEME = {
    primary: '#1A1653',
    textPrimary: '#F5F6FA',
    textSecondary: '#B8BCD9',
    cardBg: '#2E2E3A',
  };

  const avgScore = Math.round(
    mockPerformance.reduce((acc, p) => acc + p.score, 0) / mockPerformance.length
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: THEME.primary }}>
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col py-6 px-6 border-r" style={{ backgroundColor: THEME.primary, borderColor: `${THEME.textSecondary}33` }}>
        <div className="mb-10">
          <h2 className="text-lg font-bold" style={{ color: THEME.textPrimary }}>Admin Panel</h2>
          <p className="text-xs" style={{ color: THEME.textSecondary }}>Research Society MIT</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all" style={{ backgroundColor: `${THEME.textSecondary}33`, color: THEME.textPrimary }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </button>
        </nav>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
          style={{ color: '#FF6B6B' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="border-b px-8 py-6" style={{ borderColor: `${THEME.textSecondary}33` }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: THEME.textPrimary }}>Admin Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Manage students & tasks</p>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ color: THEME.textSecondary }}>{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="backdrop-blur-sm border rounded-xl p-6" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: THEME.textSecondary }}>Active Students</h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: THEME.textPrimary }}>{mockPerformance.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#4A9FFF33' }}>
                    👥
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm border rounded-xl p-6" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: THEME.textSecondary }}>Average Score</h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: THEME.textPrimary }}>{avgScore}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#51CF6633' }}>
                    📊
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-sm border rounded-xl p-6" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: THEME.textSecondary }}>Total Tasks</h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: THEME.textPrimary }}>{mockPerformance.reduce((acc, p) => acc + p.tasksCompleted, 0)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#A78BFA33' }}>
                    ✓
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm border rounded-xl overflow-hidden" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
              <div className="p-6 border-b" style={{ borderColor: `${THEME.textSecondary}33` }}>
                <h3 className="text-xl font-bold" style={{ color: THEME.textPrimary }}>Student Performance</h3>
              </div>
              <div style={{ borderColor: `${THEME.textSecondary}33` }} className="divide-y">
                {mockPerformance.map((p) => (
                  <div key={p.student} className="p-6 flex items-center justify-between hover:opacity-80 transition-all" style={{ backgroundColor: THEME.cardBg }}>
                    <div>
                      <p className="font-semibold" style={{ color: THEME.textPrimary }}>{p.student}</p>
                      <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Tasks Completed: {p.tasksCompleted}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 border rounded-full h-2 overflow-hidden" style={{ backgroundColor: `${THEME.textSecondary}33`, borderColor: `${THEME.textSecondary}33` }}>
                        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500" style={{ width: `${p.score}%` }} />
                      </div>
                      <span className="font-bold w-12 text-right" style={{ color: THEME.textPrimary }}>{p.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
