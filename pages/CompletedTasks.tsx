import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompletedTasks: React.FC = () => {
  const navigate = useNavigate();
  const THEME = {
    primary: '#1A1653',
    textPrimary: '#F5F6FA',
    textSecondary: '#B8BCD9',
    cardBg: '#2E2E3A',
  };
  const tasks = [
    { title: 'Build Robotic Arm', category: 'Robotics', completedDate: 'Jan 20, 2026', score: 95 },
    { title: 'ML Model Training', category: 'ML', completedDate: 'Jan 18, 2026', score: 88 },
    { title: 'Circuit Design', category: 'Electronics', completedDate: 'Jan 15, 2026', score: 92 },
    { title: 'Physics Lab Report', category: 'Physics', completedDate: 'Jan 12, 2026', score: 87 },
    { title: 'Research Paper Summary', category: 'Research', completedDate: 'Jan 10, 2026', score: 90 },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: THEME.primary }}>
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col py-6 px-6 border-r" style={{ backgroundColor: THEME.primary, borderColor: `${THEME.textSecondary}33` }}>
        <div className="mb-10">
          <h2 className="text-lg font-bold" style={{ color: THEME.textPrimary }}>Research Society</h2>
          <p className="text-xs" style={{ color: THEME.textSecondary }}>MIT</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all" style={{ color: THEME.textSecondary }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all" style={{ backgroundColor: `${THEME.textSecondary}33`, color: THEME.textPrimary }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="border-b px-8 py-6" style={{ borderColor: `${THEME.textSecondary}33` }}>
          <h1 className="text-3xl font-bold" style={{ color: THEME.textPrimary }}>Completed Tasks</h1>
          <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Your finished assignments</p>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            {tasks.length === 0 ? (
              <div className="backdrop-blur-sm border rounded-xl p-12 text-center" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
                <p className="text-lg" style={{ color: THEME.textSecondary }}>No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="backdrop-blur-sm border rounded-xl p-6 hover:opacity-80 transition-all" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#51CF6633', color: '#51CF66' }}>
                            ✓
                          </div>
                          <h3 className="font-semibold text-lg" style={{ color: THEME.textPrimary }}>{task.title}</h3>
                        </div>
                        <p className="text-sm mt-2" style={{ color: THEME.textSecondary }}>{task.category}</p>
                        <p className="text-xs mt-1" style={{ color: THEME.textSecondary }}>Completed: {task.completedDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg px-4 py-2">
                          <p className="text-white font-bold text-lg">{task.score}%</p>
                          <p className="text-green-100 text-xs">Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompletedTasks;