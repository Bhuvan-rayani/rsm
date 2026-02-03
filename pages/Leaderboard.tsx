import React from 'react';
import { useAuth } from '../auth/AuthContext';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const THEME = {
    primary: '#1A1653',
    textPrimary: '#F5F6FA',
    textSecondary: '#B8BCD9',
    cardBg: '#2E2E3A',
  };
  const entries = [
    { name: 'Rayani Bhuvan Chand', score: 2850, rank: 1 },
  ];
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: THEME.primary }}>
      {/* SIDEBAR - EMPTY FOR CONSISTENCY */}
      <aside className="w-64 flex flex-col py-6 px-6 border-r" style={{ backgroundColor: THEME.primary, borderColor: `${THEME.textSecondary}33` }}>
        <div className="mb-10">
          <h2 className="text-lg font-bold" style={{ color: THEME.textPrimary }}>Research Society</h2>
          <p className="text-xs" style={{ color: THEME.textSecondary }}>MIT</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all" style={{ backgroundColor: `${THEME.textSecondary}33`, color: THEME.textPrimary }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Leaderboard
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="border-b px-8 py-6" style={{ borderColor: `${THEME.textSecondary}33` }}>
          <h1 className="text-3xl font-bold" style={{ color: THEME.textPrimary }}>Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Top Performers</p>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            <div className="backdrop-blur-sm border rounded-xl overflow-hidden" style={{ backgroundColor: THEME.cardBg, borderColor: `${THEME.textSecondary}33` }}>
              <div className="p-6 border-b" style={{ borderColor: `${THEME.textSecondary}33` }}>
                <h3 className="text-lg font-bold" style={{ color: THEME.textPrimary }}>Global Rankings</h3>
              </div>
              <div style={{ borderColor: `${THEME.textSecondary}33` }} className="divide-y">
                {entries.map((e) => (
                  <div key={e.rank} className="p-6 flex items-center justify-between hover:opacity-80 transition-all group" style={{ backgroundColor: THEME.cardBg }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm`} style={{
                        backgroundColor: e.rank === 1 ? '#FCD34D33' : e.rank === 2 ? '#D1D5DB33' : e.rank === 3 ? '#FB923C33' : '#3B82F633',
                        color: e.rank === 1 ? '#FCD34D' : e.rank === 2 ? '#D1D5DB' : e.rank === 3 ? '#FB923C' : '#3B82F6'
                      }}>
                        {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : e.rank}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: e.rank === 1 ? '#FCD34D' : THEME.textPrimary }}>{e.name}</p>
                        <p className="text-xs mt-1" style={{ color: THEME.textSecondary }}>Rank #{e.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold transition-all" style={{ color: THEME.textPrimary }}>{e.score.toLocaleString()}</p>
                      <p className="text-xs" style={{ color: THEME.textSecondary }}>points</p>
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

export default Leaderboard;