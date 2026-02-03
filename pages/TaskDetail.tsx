import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const THEME = {
    background: '#02040A', // Ultra-dark ink
    surface: 'rgba(13, 17, 23, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#3B82F6', // Blue
    accentMuted: 'rgba(59, 130, 246, 0.1)',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B949E',
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2026-02-10T23:59:59').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock task data - should be replaced with actual data fetching
  const mockTasks = [
    {
      id: 1,
      title: 'RSM Task 1: Basic Research Tools',
      category: 'Research',
      difficulty: 'Medium',
      dueDate: '2025-03-15',
      status: 'pending',
      description: 'Learn to read, understand, and compare robotics research papers using modern research and AI tools.',
      details: {
        overview: 'The goal of this task is to introduce you to reading, understanding, and comparing robotics research papers, while also learning how to use modern research and AI tools effectively.',
        sections: [
          {
            title: '1. Choose a Robotics Problem',
            content: 'Choose any problem domain related to robotics that interests you (e.g., legged robots, robotic manipulators, mobile robots). Briefly describe the chosen problem, what makes it challenging to solve on real-world robots.'
          },
          {
            title: '2. Select Two Research Papers',
            content: 'Choose two high-quality research papers related to your selected problem. For each paper, explain why you selected it and describe the robot, hardware, or simulation setup assumed.'
          },
          {
            title: '3. Deep Dive into One Paper',
            content: 'Pick one paper and explain: core idea and motivation, overall system flow or methodology, one important equation/algorithm/control strategy, and at least one real-world limitation.'
          },
          {
            title: '4. Quick Comparison',
            content: 'Compare the two papers discussing differences in approach, practical feasibility, and justify which approach you would implement on a student-level robot.'
          },
          {
            title: '5. AI Tool Usage',
            content: 'Write two AI prompts you used during this task and explain how each helped you understand the paper or problem better.'
          }
        ],
        tools: [
          { name: 'Google Scholar', url: 'https://scholar.google.com' },
          { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org' },
          { name: 'SciSpace', url: 'https://scispace.com' },
          { name: 'Scopus', url: 'https://www.scopus.com' },
          { name: 'ResearchGate', url: 'https://www.researchgate.net' },
          { name: 'NotebookLM', url: 'https://notebooklm.google.com' },
          { name: 'Zotero', url: 'https://www.zotero.org' },
          { name: 'Mendeley', url: 'https://www.mendeley.com' },
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Obsidian', url: 'https://obsidian.md' }
        ],
        videos: [
          'https://youtu.be/6gjzCrOFETE?si=N67GkVk2YbW_ahxR',
          'https://youtu.be/IY7PVEZVqtY?si=afRUm5K25IQJoymj',
          'https://youtu.be/dYi2FY3-XNY?si=6O3QdIhsgOU2lA1n',
          'https://youtu.be/pDOPL53tcwQ?si=KjO0lLT6o7Bhwf3p'
        ]
      }
    }
  ];

  const task = mockTasks.find(t => t.id === parseInt(taskId || '0'));

  const glassStyle: React.CSSProperties = {
    background: THEME.surface,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${THEME.glassBorder}`,
    borderRadius: '24px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (!task) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: THEME.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: THEME.textPrimary, fontSize: '24px', marginBottom: '20px' }}>Task Not Found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: THEME.accent,
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: THEME.background, 
      color: THEME.textPrimary,
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      paddingBottom: '100px'
    }}>
      {/* Top Progress Loader */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '3px', 
        width: `${scrollProgress}%`, background: THEME.accent,
        boxShadow: `0 0 10px ${THEME.accent}`, zIndex: 1000
      }} />

      {/* Ambient Background Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '60vw', height: '60vh', background: `radial-gradient(circle, ${THEME.accentMuted} 0%, transparent 70%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '95vw', margin: '0 auto', padding: '40px 48px', position: 'relative', zIndex: 1 }}>
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            color: THEME.accent,
            border: `1px solid ${THEME.accent}40`,
            padding: '8px 20px',
            borderRadius: '100px',
            cursor: 'pointer',
            marginBottom: '32px',
            fontSize: '14px',
            transition: 'all 0.3s'
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Header Section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{ color: THEME.accent, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', fontSize: '12px' }}>
              RESEARCH
            </span>
            <h1 style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-0.04em', marginTop: '12px' }}>
              {task.title.split(':')[1] ? (
                <>
                  {task.title.split(':')[0].replace('RSM Task 1:', '').trim()}{' '}
                  <span style={{ color: 'transparent', WebkitTextStroke: `1px ${THEME.accent}` }}>
                    {task.title.split(':')[1]}
                  </span>
                </>
              ) : task.title}
            </h1>
            <p style={{ color: THEME.textSecondary, fontSize: '18px', marginTop: '16px', lineHeight: '1.6' }}>
              {task.description}
            </p>
          </div>
          
          {/* Stats Bar */}
          <div style={{ ...glassStyle, padding: '16px 32px', display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '10px', color: THEME.textSecondary, marginBottom: '4px' }}>DIFFICULTY</div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{task.difficulty.toUpperCase()}</div>
            </div>
            <div style={{ width: '1px', background: THEME.glassBorder }} />
            <div>
              <div style={{ fontSize: '10px', color: THEME.textSecondary, marginBottom: '4px' }}>STATUS</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: THEME.accent }}>{task.status.toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* Three-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 4fr 1.2fr', gap: '48px', alignItems: 'start' }}>
          
          {/* Column 1: Tools & Concepts */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ ...glassStyle, padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', borderLeft: `3px solid ${THEME.accent}`, paddingLeft: '16px' }}>
                Toolbox
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {task.details.tools.map((tool, i) => (
                  <a
                    key={i}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      padding: '18px', borderRadius: '16px', border: `1px solid ${THEME.glassBorder}`,
                      background: 'rgba(255,255,255,0.02)', fontSize: '15px', cursor: 'pointer',
                      transition: '0.3s', textDecoration: 'none', color: THEME.textPrimary
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = THEME.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = THEME.glassBorder;
                    }}
                  >
                    {tool.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Key Concepts */}
            <div style={{ 
              ...glassStyle, 
              padding: '40px',
              border: `2px solid ${THEME.accent}`,
              boxShadow: `0 0 30px ${THEME.accentMuted}, inset 0 0 20px ${THEME.accentMuted}`,
              background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.accentMuted} 100%)`
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '28px', borderLeft: `3px solid ${THEME.accent}`, paddingLeft: '16px' }}>
                Concepts You Should Learn Through This Task
              </h3>
              <ul style={{ color: THEME.accent, lineHeight: '2.4', fontSize: '16px', paddingLeft: '24px', listStyleType: 'disc' }}>
                <li>How to read research papers efficiently</li>
                <li>Skimming vs detailed reading</li>
                <li>Identifying the problem, method, results, and limitations</li>
                <li>Evaluating the quality and relevance of research papers</li>
                <li>Organising research notes systematically</li>
                <li>Using AI tools to support research</li>
                <li>Comparing different research approaches</li>
                <li>Extracting useful insights from long and complex papers</li>
              </ul>
            </div>
          </aside>

          {/* Column 2: Task Sections (Main Flow) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Project Brief */}
            <div style={{ ...glassStyle, padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>📋</span> Project Brief
              </h2>
              <p style={{ color: THEME.textSecondary, lineHeight: '1.8', fontSize: '15px' }}>
                {task.details.overview}
              </p>
            </div>

            {/* Task Milestones */}
            {task.details.sections.map((section, i) => (
              <div 
                key={i} 
                style={{ ...glassStyle, padding: '32px', display: 'flex', gap: '32px', alignItems: 'center' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 30px ${THEME.accentMuted}`}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ 
                  fontSize: '48px', fontWeight: 900, color: 'rgba(255,255,255,0.05)',
                  minWidth: '80px'
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>{section.title}</h4>
                  <p style={{ color: THEME.textSecondary, lineHeight: '1.8', fontSize: '18px' }}>{section.content}</p>
                </div>
              </div>
            ))}

            {/* Learning Resources */}
            <div style={{ ...glassStyle, padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>🎥 Learning Resources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {task.details.videos.map((videoUrl, idx) => {
                  const getYouTubeId = (url: string) => {
                    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
                    const match = url.match(regex);
                    return match ? match[1] : null;
                  };
                  const videoId = getYouTubeId(videoUrl);
                  
                  return (
                    <div key={idx} style={{ 
                      borderRadius: '16px', 
                      overflow: 'hidden', 
                      border: `1px solid ${THEME.glassBorder}`,
                      width: '100%',
                      position: 'relative',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      height: 0
                    }}>
                      {videoId ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={`Video ${idx + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
                        />
                      ) : (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            padding: '40px',
                            color: THEME.accent,
                            textDecoration: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          📺 Video {idx + 1}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Column 3: Deadline & Actions */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '40px' }}>
            
            {/* Countdown Timer */}
            <div style={{ 
              ...glassStyle, padding: '40px', textAlign: 'center', 
              border: `1px solid ${THEME.accent}`, 
              background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.accentMuted} 100%)`
            }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: THEME.accent, marginBottom: '32px' }}>
                TIME REMAINING
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                {[
                  { v: timeLeft.days, l: 'D' },
                  { v: timeLeft.hours, l: 'H' },
                  { v: timeLeft.minutes, l: 'M' },
                  { v: timeLeft.seconds, l: 'S' }
                ].map((unit, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '32px', fontWeight: 900 }}>{String(unit.v).padStart(2, '0')}</div>
                    <div style={{ fontSize: '10px', color: THEME.textSecondary, marginTop: '4px' }}>{unit.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* More Resources */}
            <div style={{ ...glassStyle, padding: '24px', textAlign: 'center' }}>
              <button
                onClick={() => navigate('/dashboard', { state: { activeTab: 'resources' } })}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${THEME.glassBorder}`,
                  background: 'rgba(255,255,255,0.03)',
                  color: THEME.textPrimary,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${THEME.accent}20`;
                  e.currentTarget.style.borderColor = THEME.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = THEME.glassBorder;
                }}
              >
                📚 More Resources
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
