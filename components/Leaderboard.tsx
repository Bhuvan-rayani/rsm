import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface LeaderboardEntry {
  userKey: string;
  author: string;
  forumPoints: number;
  quizPoints: number;
  totalPoints: number;
  quizSpecificPoints?: number;
}

interface QuizMeta {
  id: string;
  title: string;
}

interface LeaderboardProps {
  THEME: any;
  currentUserName?: string;
  currentAvatar?: string;
  quizzes?: QuizMeta[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ THEME, currentUserName, currentAvatar, quizzes = [] }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overall');
  const [forumPoints, setForumPoints] = useState<Record<string, number>>({});

  // Debug log
  React.useEffect(() => {
    console.log('Leaderboard received new avatar:', currentAvatar);
  }, [currentAvatar]);
  const [quizPointsAll, setQuizPointsAll] = useState<Record<string, number>>({});
  const [quizPointsByQuiz, setQuizPointsByQuiz] = useState<Record<string, Record<string, number>>>({});
  const [quizTabs, setQuizTabs] = useState<QuizMeta[]>(quizzes);

  // Forum points from posts and replies (upvotes)
  useEffect(() => {
    const postsRef = collection(db, 'forumPosts');
    const unsubscribe = onSnapshot(postsRef, async (snapshot) => {
      const next: Record<string, number> = {};
      
      // Get points from posts
      snapshot.forEach(postDoc => {
        const post = postDoc.data() as any;
        const author = post.author || 'Anonymous';
        next[author] = (next[author] || 0) + (post.upvotes?.length ?? 0);
      });

      // Get points from replies
      const promises = snapshot.docs.map(async (postDoc) => {
        try {
          const repliesRef = collection(db, 'forumPosts', postDoc.id, 'replies');
          const repliesSnapshot = await new Promise<any>((resolve, reject) => {
            const unsubReplies = onSnapshot(repliesRef, resolve, reject);
            setTimeout(() => unsubReplies(), 5000); // Cleanup after 5s
          });
          
          repliesSnapshot.forEach((replyDoc: any) => {
            const reply = replyDoc.data();
            const author = reply.author || 'Anonymous';
            next[author] = (next[author] || 0) + (reply.upvotes?.length ?? 0);
          });
        } catch (err) {
          console.warn('Could not load replies:', err);
        }
      });

      await Promise.all(promises);
      setForumPoints(next);
      setLoading(false);
    }, (err) => {
      console.error('Forum error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Quiz points from quizAttempts - now includes speed bonus
  useEffect(() => {
    const attemptsRef = collection(db, 'quizAttempts');
    const unsubscribe = onSnapshot(attemptsRef, (snapshot) => {
      const total: Record<string, number> = {};
      const byQuiz: Record<string, Record<string, number>> = {};
      const discoveredQuizzes: Record<string, QuizMeta> = {};
      const speedData: Record<string, { time: number; score: number }[]> = {}; // Track time and score for speed bonus

      snapshot.forEach(docSnap => {
        const attempt = docSnap.data() as any;
        const name = attempt.userName || attempt.userId || 'Anonymous';
        const quizId = attempt.quizId || 'quiz';
        const quizTitle = attempt.quizTitle || quizId;
        const points = Number(attempt.score) || 0;
        const timeInSeconds = Number(attempt.timeInSeconds) || 0;

        // Calculate speed bonus (faster completion = higher bonus)
        // Base: score points, Bonus: up to 20% bonus based on speed
        // If quiz has 10 questions at 2 min per question = 20 min avg, faster = bonus
        const estimatedTime = (attempt.totalPoints || 10) * 120; // Assume ~2 min per point
        const speedRatio = Math.min(estimatedTime / Math.max(timeInSeconds, 1), 3); // Cap at 3x
        const speedBonus = Math.floor((speedRatio - 1) * points * 0.2); // Up to 20% bonus
        const finalScore = points + speedBonus;

        total[name] = (total[name] || 0) + finalScore;
        if (!byQuiz[quizId]) byQuiz[quizId] = {};
        byQuiz[quizId][name] = (byQuiz[quizId][name] || 0) + finalScore;
        discoveredQuizzes[quizId] = { id: quizId, title: quizTitle };

        // Track speed data for display
        if (!speedData[name]) speedData[name] = [];
        speedData[name].push({ time: timeInSeconds, score: points });
      });

      // Merge provided quizzes with discovered ones to show tabs even with zero attempts
      const mergedTabs: QuizMeta[] = [];
      const pushUnique = (q: QuizMeta) => {
        if (!mergedTabs.find(x => x.id === q.id)) mergedTabs.push(q);
      };
      quizzes.forEach(pushUnique);
      Object.values(discoveredQuizzes).forEach(pushUnique);

      setQuizTabs(mergedTabs);
      setQuizPointsAll(total);
      setQuizPointsByQuiz(byQuiz);
      setLoading(false);
    }, (err) => {
      console.error('Quiz attempts error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [quizzes]);

  const tabs = useMemo(() => {
    return [
      { key: 'overall', label: '🏆 Overall' },
      { key: 'forum', label: '💬 Forum' },
      { key: 'quiz-all', label: '📝 Quizzes (All)' },
      ...quizTabs.map(q => ({ key: `quiz:${q.id}`, label: `📝 ${q.title}` })),
    ];
  }, [quizTabs]);

  // Recompute leaderboard when data or active tab changes
  useEffect(() => {
    const users = new Set<string>([
      ...Object.keys(forumPoints),
      ...Object.keys(quizPointsAll),
      ...Object.values(quizPointsByQuiz).flatMap(q => Object.keys(q)),
    ]);

    const entries: LeaderboardEntry[] = [];
    users.forEach(author => {
      const forum = forumPoints[author] || 0;
      const quizAll = quizPointsAll[author] || 0;
      entries.push({
        userKey: author,
        author,
        forumPoints: forum,
        quizPoints: quizAll,
        totalPoints: forum + quizAll,
      });
    });

    const sorted = entries
      .map(e => {
        if (activeTab.startsWith('quiz:')) {
          const quizId = activeTab.replace('quiz:', '');
          const points = quizPointsByQuiz[quizId]?.[e.author] || 0;
          return { ...e, quizSpecificPoints: points } as LeaderboardEntry;
        }
        return e;
      })
      .sort((a, b) => {
        if (activeTab === 'forum') return (b.forumPoints || 0) - (a.forumPoints || 0);
        if (activeTab === 'quiz-all') return (b.quizPoints || 0) - (a.quizPoints || 0);
        if (activeTab.startsWith('quiz:')) return (b.quizSpecificPoints || 0) - (a.quizSpecificPoints || 0);
        return (b.totalPoints || 0) - (a.totalPoints || 0);
      });

    setLeaderboard(sorted);
  }, [forumPoints, quizPointsAll, quizPointsByQuiz, activeTab]);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-3 border-b pb-3 overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.key ? THEME.accentPrimary : 'transparent',
              color: activeTab === tab.key ? THEME.background : THEME.textSecondary,
              borderBottom: activeTab === tab.key ? `2px solid ${THEME.accentPrimary}` : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <p style={{ color: THEME.textSecondary }}>Loading leaderboard…</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: THEME.textSecondary }}>
              <p>No leaderboard data yet. Complete a quiz or post in the forum!</p>
            </div>
          )}
          {leaderboard.slice(0, 20).map((entry, idx) => (
            <div
              key={`${entry.userKey}-${idx}`}
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{
                backgroundColor: idx === 0 ? 'rgba(251,146,60,0.08)' : idx === 1 ? 'rgba(168,168,168,0.08)' : idx === 2 ? 'rgba(217,119,6,0.08)' : `${THEME.card}99`,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-black/30 flex items-center justify-center" key={entry.author === currentUserName ? currentAvatar : 'default'}>
                  <img
                    src={entry.author === currentUserName && currentAvatar ? `${currentAvatar}?t=${Math.random()}` : '/rsm/assets/avatars/bluey_1.png'}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/rsm/assets/avatars/bluey_1.png';
                    }}
                  />
                </div>
                <span className="text-lg font-bold w-8 text-center" style={{ color: THEME.accentPrimary }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <span style={{ color: THEME.textPrimary }} className="font-semibold">
                  {entry.author}
                </span>
              </div>

              <div className="flex gap-6 text-sm">
                {activeTab === 'overall' && (
                  <div className="text-center">
                    <p style={{ color: THEME.textSecondary }}>💬 Forum</p>
                    <p style={{ color: THEME.accentPrimary }} className="font-bold">
                      {entry.forumPoints}
                    </p>
                  </div>
                )}
                {activeTab === 'forum' && (
                  <div className="text-center">
                    <p style={{ color: THEME.accentPrimary }} className="font-bold">
                      {entry.forumPoints}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
