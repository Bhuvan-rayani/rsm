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
    background: '#02040A',
    surface: 'rgba(13, 17, 23, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#3B82F6',
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
      const targetDate = new Date('2026-02-13T23:59:59').getTime();
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

  const mockTasks = [
    {
      id: 1,
      title: 'RSM Task 1: Basic Research Tools',
      category: 'Research',
      difficulty: 'Medium',
      dueDate: '2026-02-13',
      status: 'in-progress',
      description: 'Develop practical research skills by using modern tools, reading papers efficiently, and producing a concise report.',
      details: {
        overview: 'This task builds foundational research skills.',
        sections: [
          {
            title: 'Tools You Must Learn and Use',
            content: 'Explore and practically use each tool: Google Scholar, Semantic Scholar, SciSpace, Scopus, ResearchGate, NotebookLM, Zotero, Mendeley, Notion, and Obsidian. You do not need expert mastery, but you should understand what each tool is used for and how it supports research.'
          },
          {
            title: 'Concepts to Learn Through This Task',
            content: `1. How to Read Research Papers Efficiently
   → Understanding the structure of a research paper
   → Knowing which sections to prioritize first
   → Avoiding unnecessary deep reading initially

2. Skimming vs Detailed Reading
   → What skimming means in research
   → When to skim a paper and when to read it deeply
   → What information you should extract during skimming

3. Identifying Core Components of a Paper
   → Clearly identifying:
      • The problem being addressed
      • The method or approach used
      • Key results and findings
      • Limitations or assumptions of the work

4. Evaluating Quality and Relevance of Research Papers
   → How to judge whether a paper is reliable
   → Understanding citations, venue, and relevance to the problem
   → Avoiding low-quality or misleading papers

5. Organising Research Notes Systematically
   → How to store papers and notes properly
   → Structuring notes for easy revision
   → Linking ideas across multiple papers

6. Using AI Tools to Support Research
   → How AI tools help in summarising and understanding papers
   → Using AI for clarification, comparison, and simplification
   → Understanding the limitations of AI in research

7. Comparing Different Research Approaches
   → How different papers solve similar problems differently
   → Identifying trade-offs between methods

8. Extracting Useful Insights from Long and Complex Papers
   → Filtering important information from dense content
   → Ignoring unnecessary mathematical or theoretical depth when not required
   → Translating research ideas into practical understanding`
          },
          {
            title: 'What You Need to Submit',
            content: `📋 Task Requirements:

→ Select two research papers related to robotics based on your interest
→ Apply all tools and concepts learned throughout this task
→ Use research tools to find, read, organise, and understand the papers

📝 Analysis Process:

→ Practice both skimming and detailed reading techniques
→ Identify the problem, method, results, and limitations of each paper
→ Compare the two approaches and identify key differences
→ Utilize AI tools where they add value to your understanding

📄 Final Deliverable:

→ Submit a single comprehensive report
→ Focus on your research process and learning journey
→ Explain how you read, analysed, compared, and organised the papers
→ Write in clear, simple English using your own words
→ Demonstrate understanding rather than just summarizing content`
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
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    backdropFilter: 'blur(40px) saturate(200%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    border: `1px solid rgba(255, 255, 255, 0.18)`,
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
    position: 'relative' as 'relative',
    overflow: 'hidden',
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
      <style>{`
        .numbered-text {
          background: linear-gradient(135deg, ${THEME.accent}40 0%, ${THEME.accent}20 100%);
          border: 1px solid ${THEME.accent};
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-block;
          margin-right: 8px;
          font-weight: 700;
          color: ${THEME.accent};
          box-shadow: 0 0 20px ${THEME.accent}40;
        }
      `}</style>
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '3px', 
        width: `${scrollProgress}%`, background: THEME.accent,
        boxShadow: `0 0 10px ${THEME.accent}`, zIndex: 1000
      }} />

      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '60vw', height: '60vh', background: `radial-gradient(circle, ${THEME.accentMuted} 0%, transparent 70%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '95vw', margin: '0 auto', padding: 'clamp(20px, 5vw, 48px)', position: 'relative', zIndex: 1 }}>
        
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

        <header style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '600px' }}>
              <span style={{ color: THEME.accent, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', fontSize: '12px' }}>
                RESEARCH
              </span>
              <h1 style={{ fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', marginTop: '12px' }}>
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
            
            <div style={{ 
              padding: '12px 28px', 
              background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 100%)',
              border: '1px solid #9d8873',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(139, 115, 85, 0.3)'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#D4AF85', marginBottom: '2px', fontWeight: 600, letterSpacing: '1px' }}>STATUS</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#FDD87F', textTransform: 'uppercase', letterSpacing: '1px' }}>{task.status.toUpperCase().replace('-', ' ')}</div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(24px, 4vw, 48px)', 
          alignItems: 'start'
        }} className="task-grid">
          <style>{`
            @media (min-width: 1024px) {
              .task-grid { grid-template-columns: 4fr 1.5fr !important; }
            }
          `}</style>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {task.details.sections.map((section, i) => (
              <div 
                key={i} 
                style={{ ...glassStyle, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}
                className="task-milestone"
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 30px ${THEME.accentMuted}`}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 32px)', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, marginBottom: '12px', color: i === 2 ? '#3B82F6' : THEME.accent, letterSpacing: '-0.02em' }}>{section.title}</h4>
                    <div style={{ color: THEME.textPrimary, lineHeight: '1.75', fontSize: 'clamp(14px, 2vw, 16px)', marginBottom: '24px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 400, letterSpacing: '0.01em' }}>
                      {section.content.split('\n\n').map((paragraph, pIdx) => {
                        const numberedMatch = paragraph.match(/^(\d+)\.\s+(.+)/);
                        if (numberedMatch) {
                          const [, number, rest] = numberedMatch;
                          return (
                            <div key={pIdx} style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{ 
                                  background: `linear-gradient(135deg, ${THEME.accent}40 0%, ${THEME.accent}20 100%)`,
                                  border: `1px solid ${THEME.accent}`,
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  color: THEME.accent,
                                  boxShadow: `0 0 20px ${THEME.accent}40`,
                                  minWidth: '32px',
                                  textAlign: 'center'
                                }}>{number}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, marginBottom: '8px', color: THEME.accent }}>{rest}</div>
                                  {paragraph.split('\n').slice(1).map((line, lIdx) => (
                                    <div key={lIdx} style={{ paddingLeft: '8px', marginTop: '4px', opacity: 0.9 }}>{line}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        const sectionHeaderMatch = paragraph.match(/^([📋📝📄])\s+(.+):$/);
                        if (sectionHeaderMatch) {
                          const [, emoji, title] = sectionHeaderMatch;
                          return (
                            <div key={pIdx} style={{ 
                              marginTop: pIdx > 0 ? '24px' : '0',
                              marginBottom: '16px',
                              padding: '16px 20px',
                              background: `linear-gradient(135deg, ${THEME.accent}15 0%, ${THEME.accent}05 100%)`,
                              borderLeft: `4px solid ${THEME.accent}`,
                              borderRadius: '12px'
                            }}>
                              <div style={{ fontSize: '18px', fontWeight: 700, color: THEME.accent, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '24px' }}>{emoji}</span>
                                {title}
                              </div>
                            </div>
                          );
                        }
                        
                        if (paragraph.trim().startsWith('→')) {
                          return (
                            <div key={pIdx} style={{ 
                              marginBottom: '10px',
                              paddingLeft: '12px',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start'
                            }}>
                              <span style={{ color: THEME.accent, fontWeight: 700, fontSize: '18px' }}>→</span>
                              <span style={{ flex: 1, lineHeight: '1.7' }}>{paragraph.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        
                        return <div key={pIdx} style={{ marginBottom: '12px', whiteSpace: 'pre-line' }}>{paragraph}</div>;
                      })}
                    </div>
                    {i === 2 && (
                      <div style={{ 
                        marginTop: '32px', 
                        padding: '24px', 
                        background: `linear-gradient(135deg, ${THEME.accent}08 0%, ${THEME.accent}03 100%)`,
                        borderRadius: '16px',
                        border: `1px solid ${THEME.accent}30`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          {[
                            { num: '1', label: 'Select\nPapers', icon: '📄' },
                            { num: '2', label: 'Use\nTools', icon: '🔧' },
                            { num: '3', label: 'Read &\nAnalyze', icon: '📖' },
                            { num: '4', label: 'Compare\nApproaches', icon: '⚖️' },
                            { num: '5', label: 'Submit\nReport', icon: '✅' }
                          ].map((step, idx) => (
                            <React.Fragment key={idx}>
                              <div style={{ 
                                flex: '1 1 120px',
                                minWidth: '100px',
                                textAlign: 'center',
                                position: 'relative'
                              }}>
                                <div style={{ 
                                  background: `linear-gradient(135deg, ${THEME.accent}25 0%, ${THEME.accent}10 100%)`,
                                  border: `2px solid ${THEME.accent}`,
                                  borderRadius: '16px',
                                  padding: '20px 12px',
                                  boxShadow: `0 4px 20px ${THEME.accent}20`,
                                  transition: 'all 0.3s',
                                  cursor: 'default'
                                }}>
                                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{step.icon}</div>
                                  <div style={{ 
                                    fontSize: '12px', 
                                    lineHeight: '1.4',
                                    whiteSpace: 'pre-line',
                                    fontWeight: 600
                                  }}>{step.label}</div>
                                </div>
                              </div>
                              {idx < 4 && (
                                <div style={{ 
                                  color: THEME.accent, 
                                  fontSize: '24px', 
                                  fontWeight: 700,
                                  flex: '0 0 auto'
                                }}>→</div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                    {i === 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
                        {task.details.tools.map((tool, idx) => (
                          <a
                            key={idx}
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              padding: '18px', borderRadius: '16px', border: `1px solid ${THEME.accent}`,
                              background: `linear-gradient(135deg, ${THEME.accent}15 0%, ${THEME.accent}05 100%)`, fontSize: '15px', cursor: 'pointer',
                              transition: '0.3s', textDecoration: 'none', color: THEME.accent, textAlign: 'center', fontWeight: 600,
                              boxShadow: `0 0 20px ${THEME.accent}20`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${THEME.accent}25 0%, ${THEME.accent}10 100%)`;
                              e.currentTarget.style.boxShadow = `0 0 30px ${THEME.accent}40`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${THEME.accent}15 0%, ${THEME.accent}05 100%)`;
                              e.currentTarget.style.boxShadow = `0 0 20px ${THEME.accent}20`;
                            }}
                          >
                            {tool.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '40px' }}>
            
            <div style={{ 
              ...glassStyle, padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center', 
              border: `1px solid ${THEME.accent}`, 
              background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.accentMuted} 100%)`
            }}>
              <h3 style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 800, letterSpacing: '2px', color: THEME.accent, marginBottom: 'clamp(20px, 4vw, 32px)' }}>
                TIME REMAINING
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px, 2vw, 15px)', marginBottom: 'clamp(24px, 4vw, 40px)', flexWrap: 'wrap' }}>
                {[
                  { v: timeLeft.days, l: 'D' },
                  { v: timeLeft.hours, l: 'H' },
                  { v: timeLeft.minutes, l: 'M' },
                  { v: timeLeft.seconds, l: 'S' }
                ].map((unit, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900 }}>{String(unit.v).padStart(2, '0')}</div>
                    <div style={{ fontSize: 'clamp(8px, 1.5vw, 10px)', color: THEME.textSecondary, marginTop: '4px' }}>{unit.l}</div>
                  </div>
                ))}
              </div>
            </div>

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

        <div style={{ ...glassStyle, padding: '40px', marginTop: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px', color: THEME.accent }}>🎥 Learning Resources</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
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
                  paddingBottom: '56.25%',
                  height: 0,
                  maxWidth: '100%',
                  background: 'rgba(255,255,255,0.02)'
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
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 600
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
      </div>
    </div>
  );
};

export default TaskDetail;
