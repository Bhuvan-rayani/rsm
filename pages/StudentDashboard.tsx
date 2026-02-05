import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, Timestamp, limit, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { auth } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import logo from '../assets/Screenshot 2026-01-24 011404.png';
import BookShelf from '../components/BookShelf';
import QuizTaker from '../components/QuizTaker';
import QuizAttempt from '../pages/QuizAttempt';
import Leaderboard from '../components/Leaderboard';
import { preloadedBook } from '../preloadedBook';
import { researchBooks } from '../researchBooksData';
import { quizzes } from '../data/quizzes';

type TabType = 'tasks' | 'quizzes' | 'leaderboard' | 'submit' | 'resources' | 'forum';

type ForumPost = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  createdAt?: Timestamp | null;
  points?: number;
  upvotes?: string[]; // userIds
  downvotes?: string[];
};

type ForumReply = {
  id: string;
  postId: string;
  author: string;
  text: string;
  createdAt?: Timestamp | null;
  points?: number;
  upvotes?: string[];
  downvotes?: string[];
};

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [submitTaskForm, setSubmitTaskForm] = useState({ title: '', description: '', file: null as File | null });
  const [newUsername, setNewUsername] = useState(() => {
    if (user?.uid) {
      const stored = localStorage.getItem(`username-${user.uid}`);
      if (stored) return stored;
    }
    return user?.displayName || user?.email?.split('@')[0] || 'Student';
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    if (user?.uid) {
      const stored = localStorage.getItem(`avatar-${user.uid}`);
      return stored || 'bluey_1';
    }
    return 'bluey_1';
  });
  const [avatarSaved, setAvatarSaved] = useState(true);

  // Sync username on user change - restore from localStorage or Firebase
  useEffect(() => {
    if (user?.uid) {
      const stored = localStorage.getItem(`username-${user.uid}`);
      if (stored) {
        setNewUsername(stored);
      } else if (user?.displayName && !user.displayName.includes('@')) {
        setNewUsername(user.displayName);
        localStorage.setItem(`username-${user.uid}`, user.displayName);
      }
    }
  }, [user?.uid]);

  // Handle navigation state for activeTab
  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location]);

  const [resourceSubTab, setResourceSubTab] = useState<'videos' | 'books' | 'papers'>('videos');
  const [tasksFilter, setTasksFilter] = useState<'all' | 'in-progress'>('all');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [books, setBooks] = useState<Array<{id: string; title: string; author: string; year: number; coverImage: string; pdfPath: string; pdfFile?: File}>>(researchBooks);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumReplies, setForumReplies] = useState<Record<string, ForumReply[]>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [forumError, setForumError] = useState<string | null>(null);
  const [forumLoaded, setForumLoaded] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newTag, setNewTag] = useState('general');
  const [seeding, setSeeding] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<typeof quizzes[0] | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Set<string>>(new Set()); // Local tracking for immediate feedback

  const submittedKey = user?.uid ? `submitted-quizzes-${user.uid}` : null;
  const avatarKey = user?.uid ? `avatar-${user.uid}` : 'avatar-guest';

  const rememberSubmitted = (quizId: string) => {
    setSubmittedQuizzes(prev => {
      const next = new Set(prev);
      next.add(quizId);
      if (submittedKey) {
        localStorage.setItem(submittedKey, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Refs for Netflix-style scrolling
  const videosRowRef = useRef<HTMLDivElement>(null);
  const booksRowRef = useRef<HTMLDivElement>(null);
  const papersRowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected video in carousel
  useEffect(() => {
    if (videosRowRef.current && showVideoDetail) {
      const container = videosRowRef.current;
      const videoWidth = 260; // Width of each video card
      const gap = 24; // Gap between cards (6 * 4px = 24px)
      const scrollPosition = selectedVideoIndex * (videoWidth + gap) - (container.offsetWidth / 2) + (videoWidth / 2);
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedVideoIndex, showVideoDetail]);

  // Sync books to localStorage on change
  useEffect(() => {
    localStorage.setItem('rsm-books', JSON.stringify(books));
    console.log('Books saved to localStorage:', books.length, 'books');
  }, [books]);

  // Restore submitted quizzes when user changes
  useEffect(() => {
    if (!submittedKey) {
      setSubmittedQuizzes(new Set());
      return;
    }
    const stored = localStorage.getItem(submittedKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setSubmittedQuizzes(new Set(parsed));
      } catch (err) {
        console.error('Failed to load submitted quizzes from storage', err);
      }
    }
  }, [submittedKey]);

  // Only persist avatar changes to localStorage
  useEffect(() => {
    if (selectedAvatar && avatarKey) {
      localStorage.setItem(avatarKey, selectedAvatar);
      setAvatarSaved(true);
    }
  }, [selectedAvatar, avatarKey]);

  // Save books to localStorage whenever they change
  useEffect(() => {
    console.log('Books state changed:', books.length, 'books', books);
    localStorage.setItem('rsm-books', JSON.stringify(books));
  }, [books]);

  const formatTimeAgo = (date?: Date | null) => {
    if (!date) return 'just now';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Live forum posts
  useEffect(() => {
    const postsRef = collection(db, 'forumPosts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        console.log('📝 Posts snapshot received, docs:', snapshot.size);
        const next: ForumPost[] = snapshot.docs.map(doc => {
          const data = doc.data() as Partial<ForumPost> & { upvotes?: string[]; downvotes?: string[]; points?: number };
          return {
            id: doc.id,
            title: data.title ?? '',
            author: data.author ?? 'Anonymous',
            tags: data.tags ?? [],
            createdAt: data.createdAt ?? null,
            upvotes: data.upvotes ?? [],
            downvotes: data.downvotes ?? [],
            points: data.points ?? 0,
          };
        });
        console.log('Posts loaded:', next.map(p => ({ id: p.id, title: p.title })));
        setForumPosts(next);
        setForumLoaded(true);
        setForumError(null);
      },
      error: (err) => {
        console.error('❌ Posts error:', err);
        setForumError(err.message);
        setForumLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Live replies - subscribe to each post's replies subcollection
  useEffect(() => {
    if (forumPosts.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    forumPosts.forEach(post => {
      const repliesRef = collection(db, 'forumPosts', post.id, 'replies');
      const q = query(repliesRef, orderBy('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(q, {
        next: (snapshot) => {
          console.log(`📥 Replies for post ${post.id}:`, snapshot.size);
          const replies: ForumReply[] = snapshot.docs.map(doc => {
            const data = doc.data() as Partial<ForumReply> & { upvotes?: string[]; downvotes?: string[]; points?: number };
            return {
              id: doc.id,
              postId: post.id,
              author: data.author ?? 'Anonymous',
              text: data.text ?? '',
              createdAt: data.createdAt ?? null,
              upvotes: data.upvotes ?? [],
              downvotes: data.downvotes ?? [],
              points: data.points ?? 0,
            };
          });
          
          setForumReplies(prev => ({
            ...prev,
            [post.id]: replies
          }));
        },
        error: (err) => {
          console.error(`❌ Replies error for post ${post.id}:`, err);
          setForumError(err.message);
        }
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [forumPosts]);

  const scrollRow = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    ref.current?.scrollBy({
      left: direction === 'left' ? -600 : 600,
      behavior: 'smooth',
    });
  };

  // Premium gold/navy theme
  const THEME = {
    background: '#02040A',        // Ultra-dark from TaskDetail
    sidebar: '#0D1117',           // Dark surface
    card: 'rgba(13, 17, 23, 0.7)',// Glass surface
    cardHover: 'rgba(59, 130, 246, 0.1)',  // Blue accent muted
    textPrimary: '#FFFFFF',       // White
    textSecondary: '#8B949E',     // Muted text
    textMuted: '#6E7681',         // Darker muted
    accentPrimary: '#3B82F6',     // Blue accent
    accentSecondary: '#60A5FA',   // Light blue
    success: '#10B981',           // Emerald
    warning: '#F59E0B',           // Amber
    error: '#EF4444',             // Red
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  };

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
        overview: 'This task builds foundational research skills. You will explore essential research tools, practice skimming and deep reading, evaluate paper quality, organize notes systematically, and reflect on how AI tools support understanding. Submit a short, original report that demonstrates your process and key learnings.',
        sections: [
          {
            title: 'Tools You Must Learn and Use',
            content: 'Explore and practically use each tool: Google Scholar, Semantic Scholar, SciSpace, Scopus, ResearchGate, NotebookLM, Zotero, Mendeley, Notion, and Obsidian. You do not need expert mastery, but you should understand what each tool is used for and how it supports research.'
          },
          {
            title: 'Concepts to Learn Through This Task',
            content: 'Reading papers efficiently; skimming vs detailed reading; identifying the problem, method, results, and limitations; evaluating quality and relevance (citations, venue, reliability); organizing notes and linking ideas; using AI tools for summarization, clarification, and comparison; comparing research approaches and trade-offs; extracting actionable insights from dense content.'
          },
          {
            title: 'What You Need to Submit (Final Report)',
            content: 'Write a short, clear report in your own words covering: how you read research papers, how you skim vs do detailed reading, how you identify problem/method/results/limitations, how you judge paper quality, how you organized notes and papers, how AI tools helped, how you compared approaches, and your key learnings. Copy‑pasted definitions or AI‑generated text without understanding will not be accepted.'
          }
        ],
        tools: ['Google Scholar', 'Semantic Scholar', 'SciSpace', 'Scopus', 'ResearchGate', 'NotebookLM', 'Zotero', 'Mendeley', 'Notion', 'Obsidian'],
        videos: [
          'https://youtu.be/6gjzCrOFETE?si=N67GkVk2YbW_ahxR',
          'https://youtu.be/IY7PVEZVqtY?si=afRUm5K25IQJoymj',
          'https://youtu.be/dYi2FY3-XNY?si=6O3QdIhsgOU2lA1n',
          'https://youtu.be/pDOPL53tcwQ?si=KjO0lLT6o7Bhwf3p'
        ]
      }
    }
  ];

  const mockVideos = [
    {
      id: 1,
      title: 'The Triple Pass Method: How to Read Research Papers Like a Pro',
      channel: 'Prof. David Stuckler',
      duration: '09:43',
      thumbnail: 'https://img.youtube.com/vi/WVv2jWXW0K4/maxresdefault.jpg',
      embedId: 'WVv2jWXW0K4',
      description: 'Stop wasting hours on a single paper. Professor David Stuckler reveals the "Triple Pass" strategy—Bird\'s Eye, Swoop, and Street Level—to help you digest 5 papers in the time it used to take for one.'
    },
    {
      id: 2,
      title: 'Smart Reading: Why Research Papers Are Easier Than You Think',
      channel: 'Dario Tringali',
      duration: '11:07',
      thumbnail: 'https://img.youtube.com/vi/IY7PVEZVqtY/maxresdefault.jpg',
      embedId: 'IY7PVEZVqtY',
      description: 'PhD student Dario Tringali breaks down the anatomy of a paper and shares a crucial secret: you don\'t have to read every word. Learn how to skim effectively and use AI as a tool, not a crutch.'
    },
    {
      id: 3,
      title: 'NotebookLM Mastery: The Best AI Research Tool in 2025',
      channel: 'Enovair',
      duration: '20:17',
      thumbnail: 'https://img.youtube.com/vi/dYi2FY3-XNY/maxresdefault.jpg',
      embedId: 'dYi2FY3-XNY',
      description: 'Master your research chaos with Google\'s NotebookLM. This deep dive shows you how to turn scattered PDFs and videos into interactive podcasts, mind maps, and automated reports in record time.'
    },
    {
      id: 4,
      title: 'The 2026 Researcher\'s AI Toolkit: Beyond ChatGPT',
      channel: 'Andy Stapleton',
      duration: '17:13',
      thumbnail: 'https://img.youtube.com/vi/pDOPL53tcwQ/maxresdefault.jpg',
      embedId: 'pDOPL53tcwQ',
      description: 'Dr. Andy Stapleton reviews the powerhouse tools every modern academic needs, from literature mapping with Litmaps to AI-assisted writing with Jenni AI and SciSpace.'
    },
    {
      id: 5,
      title: 'Gemini Deep Research: Using AI for PhD-Level Topics',
      channel: 'Google',
      duration: '02:01',
      thumbnail: 'https://img.youtube.com/vi/buwMJxvW7wI/maxresdefault.jpg',
      embedId: 'buwMJxvW7wI',
      description: 'See the power of Gemini\'s new Deep Research feature. Watch as the AI builds a research plan, crawls the web for high-quality sources, and synthesizes complex data into one comprehensive report.'
    },
    {
      id: 6,
      title: 'The Art of Research: A Guide to Sources and Context',
      channel: 'Overly Sarcastic Productions',
      duration: '07:19',
      thumbnail: 'https://img.youtube.com/vi/sigJwoeU6OI/maxresdefault.jpg',
      embedId: 'sigJwoeU6OI',
      description: 'A brilliant breakdown of the research process. Learn how to use Wikipedia as a jumping-off point, distinguish between primary and secondary sources, and connect the dots to form a unique thesis.'
    },
    {
      id: 7,
      title: 'Insider Tips for Fast and Effective Research',
      channel: 'Andy Stapleton',
      duration: '14:12',
      thumbnail: 'https://img.youtube.com/vi/iW2DaL-g1CU/maxresdefault.jpg',
      embedId: 'iW2DaL-g1CU',
      description: 'Whether for a PhD or a hobby, learn how to lay a solid foundation. Dr. Andy Stapleton shares tips on defining your research boundaries, sorting "murky" data, and knowing exactly when to stop.'
    },
    {
      id: 8,
      title: 'NotebookLM in 30 Minutes: Learn Anything Faster',
      channel: 'Tina Huang',
      duration: '30:51',
      thumbnail: 'https://img.youtube.com/vi/qbt-MFVvQQY/maxresdefault.jpg',
      embedId: 'qbt-MFVvQQY',
      description: 'Tina Huang shows you how to turn NotebookLM into a personalized study partner. Learn to automate workflows, build AI products, and use "audio overviews" to retain information during your commute.'
    },
    {
      id: 9,
      title: 'Prompt Engineering Secrets: How to Actually Talk to AI',
      channel: 'Varun Mayya',
      duration: '23:14',
      thumbnail: 'https://img.youtube.com/vi/VnEoS2eQXsw/maxresdefault.jpg',
      embedId: 'VnEoS2eQXsw',
      description: '99% of people prompt AI wrong. Varun Mayya explains "World Building" and "Meta-Prompting," teaching you how to stitch together unique puzzle pieces of data to get the exact output you envision.'
    },
    {
      id: 10,
      title: 'Google\'s Prompt Engineering Course: 9 Hours in 20 Minutes',
      channel: 'Tina Huang',
      duration: '20:17',
      thumbnail: 'https://img.youtube.com/vi/p09yRj47kNM/maxresdefault.jpg',
      embedId: 'p09yRj47kNM',
      description: 'Save yourself 9 hours of training. Tina Huang summarizes Google\'s essential course, covering advanced techniques like Chain of Thought, Tree of Thought, and the "Tiny Crabs" framework for perfect prompts.'
    },
    {
      id: 11,
      title: '10x Faster Paper Discovery with Google Scholar AI',
      channel: 'Andy Stapleton',
      duration: '06:28',
      thumbnail: 'https://img.youtube.com/vi/UgsIZD_oheE/maxresdefault.jpg',
      embedId: 'UgsIZD_oheE',
      description: 'Google Scholar just got a massive AI upgrade. Explore the new "Labs" features that allow you to ask detailed research questions and get instant AI-summarized answers directly from scholarly articles.'
    },
    {
      id: 12,
      title: 'How to Research Any Topic: Deep-Dive Like a PhD Student',
      channel: 'Charlotte Fraza',
      duration: '17:21',
      thumbnail: 'https://img.youtube.com/vi/6gjzCrOFETE/maxresdefault.jpg',
      embedId: '6gjzCrOFETE',
      description: 'Post-doc researcher Charlotte Fraza lifts the veil on the academic process. Learn to narrow down general topics into specific questions and build a knowledge web using tools like Research Rabbit.'
    }
  ];

  const mockReadingResources = [];

  const mockResearchPapers = [
    {
      id: 1,
      title: 'FastSLAM: An Efficient Solution to the Simultaneous Localization and Mapping Problem',
      authors: 'Thrun et al.',
      category: 'SLAM & Localization',
      year: 2003,
      url: 'https://robots.stanford.edu/papers/Thrun03g.pdf',
      description: 'Foundational SLAM algorithm using particle filters for efficient localization and mapping.'
    },
    {
      id: 2,
      title: 'FastSLAM: A Factored Solution to SLAM',
      authors: 'Montemerlo et al.',
      category: 'SLAM & Localization',
      year: 2002,
      url: 'https://www.cs.cmu.edu/~mmde/mmdeaaai2002.pdf',
      description: 'Alternative formulation of FastSLAM with factored particle filter approach.'
    },
    {
      id: 3,
      title: 'ORB-SLAM: A Versatile and Accurate Monocular SLAM System',
      authors: 'Raúl Mur-Artal et al.',
      category: 'SLAM & Localization',
      year: 2015,
      url: 'https://www.researchgate.net/publication/271823237_ORB-SLAM_a_versatile_and_accurate_monocular_SLAM_system',
      description: 'Visual SLAM system using ORB features for real-time monocular camera localization.'
    },
    {
      id: 4,
      title: 'A Survey on Active Simultaneous Localization and Mapping',
      authors: 'Various',
      category: 'SLAM & Localization',
      year: 2022,
      url: 'https://arxiv.org/abs/2207.00254',
      description: 'Comprehensive survey on active SLAM techniques combining perception and active planning.'
    },
    {
      id: 5,
      title: 'A Review of Visual SLAM for Robotics: Evolution, Properties, and Methods',
      authors: 'Various',
      category: 'SLAM & Localization',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/37872668/',
      description: 'Detailed review of visual SLAM methods evolution in robotics applications.'
    },
    {
      id: 6,
      title: 'Augmented Reality and Robotics: A Survey and Taxonomy',
      authors: 'Various',
      category: 'General Robotics',
      year: 2022,
      url: 'https://arxiv.org/abs/2203.03254',
      description: 'Survey on integration of AR with robotics for human-robot interaction.'
    },
    {
      id: 7,
      title: 'Foundation Models in Robotics: Applications, Challenges, and the Future',
      authors: 'Various',
      category: 'General Robotics',
      year: 2023,
      url: 'https://arxiv.org/abs/2312.07843',
      description: 'Modern perspective on large foundation models applied to robotics tasks.'
    },
    {
      id: 8,
      title: 'Multi-Goal Reinforcement Learning: Challenging Robotics Environments',
      authors: 'Various',
      category: 'General Robotics',
      year: 2018,
      url: 'https://arxiv.org/abs/1802.09464',
      description: 'RL techniques for multi-goal robotics environments with complex constraints.'
    },
    {
      id: 9,
      title: 'The Basics of Robotics',
      authors: 'Various',
      category: 'General Robotics',
      year: 2020,
      url: 'https://www.theseus.fi/bitstream/handle/10024/37806/Shakhatreh_Fareed.pdf',
      description: 'Comprehensive introduction to fundamental robotics concepts and methods.'
    },
    {
      id: 10,
      title: 'Robotics Research Paper: General Overview',
      authors: 'Various',
      category: 'General Robotics',
      year: 2021,
      url: 'https://www.scribd.com/document/511999731/Robotics-Research-Paper',
      description: 'General overview of current robotics research landscape and trends.'
    },
    {
      id: 11,
      title: 'Reinforcement Learning-based Robot Navigation and Tracking',
      authors: 'Various',
      category: 'Machine Learning',
      year: 2023,
      url: 'https://orca.cardiff.ac.uk/id/eprint/168812/7/Reinforcement_Learning_based_Robot_Navigation_and_Tracking%20%281%29.pdf',
      description: 'RL applications for autonomous robot navigation and real-time tracking.'
    },
    {
      id: 12,
      title: 'Research on Robot Path Planning Based on Visual SLAM',
      authors: 'Various',
      category: 'Path Planning',
      year: 2024,
      url: 'https://arxiv.org/pdf/2404.14077',
      description: 'Integration of visual SLAM with path planning algorithms for autonomous robots.'
    },
    {
      id: 13,
      title: 'Present and Future of SLAM in Extreme Environments',
      authors: 'NASA JPL',
      category: 'SLAM & Localization',
      year: 2022,
      url: 'https://www-robotics.jpl.nasa.gov/media/documents/2208.01787.pdf',
      description: 'SLAM techniques for planetary rovers and extreme environment exploration.'
    },
    {
      id: 14,
      title: 'Recent Advances in Robotics and Intelligent Robots Applications',
      authors: 'Various',
      category: 'General Robotics',
      year: 2024,
      url: 'https://www.researchgate.net/publication/380668049_Recent_Advances_in_Robotics_and_Intelligent_Robots_Applications',
      description: 'Collection of recent advances in intelligent robotic systems and applications.'
    },
    {
      id: 15,
      title: 'Robotics Journal: Special Issue on Modern Robotics',
      authors: 'MDPI Robotics',
      category: 'General Robotics',
      year: 2023,
      url: 'https://www.mdpi.com/2218-6581/11/1',
      description: 'Open access collection of robotics research articles from MDPI Robotics journal.'
    },
    {
      id: 16,
      title: 'The International Journal of Robotics Research Archives',
      authors: 'IJRR',
      category: 'General Robotics',
      year: 2023,
      url: 'http://ijr.sagepub.com/content/by/year',
      description: 'Peer-reviewed robotics research from the leading IJRR publication.'
    },
    {
      id: 17,
      title: 'Robotics & Autonomous Systems: Recent Publications',
      authors: 'ScienceDirect',
      category: 'General Robotics',
      year: 2024,
      url: 'https://www.sciencedirect.com/journal/robotics-and-autonomous-systems',
      description: 'Curated robotics and autonomous systems research articles from leading journal.'
    },
    {
      id: 18,
      title: 'List of SLAM Methods and Algorithms',
      authors: 'Wikipedia Robotics Community',
      category: 'SLAM & Localization',
      year: 2024,
      url: 'https://en.wikipedia.org/wiki/List_of_SLAM_methods',
      description: 'Comprehensive list of SLAM methods, algorithms, and research references.'
    },
    {
      id: 19,
      title: '20 Most Cited Papers in Robotics: Comprehensive List',
      authors: 'Doradolist',
      category: 'General Robotics',
      year: 2024,
      url: 'https://www.doradolist.com/papers/20-most-cited-papers-in-robotics',
      description: 'Curated list of the most influential and cited robotics research papers.'
    },
    {
      id: 20,
      title: 'Robotics Research Database & Resource Hub',
      authors: 'Academic Community',
      category: 'General Robotics',
      year: 2024,
      url: 'https://www.doradolist.com/papers/20-most-cited-papers-in-robotics',
      description: 'Centralized resource for finding high-impact robotics research papers and links.'
    }
  ];

  // Load user's quiz attempts
  useEffect(() => {
    if (!user?.uid) return;
    const attemptsRef = collection(db, 'quizAttempts');
    const q = query(attemptsRef, orderBy('completedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Quiz attempts snapshot:', snapshot.size, 'docs');
      const attempts = snapshot.docs
        .map(doc => doc.data())
        .filter((attempt: any) => {
          console.log('Checking attempt:', attempt.userId, 'vs', user?.uid);
          return attempt.userId === user?.uid;
        });
      console.log('Filtered attempts for user:', attempts.length);
      setQuizAttempts(attempts);
      
      // Track completed quizzes
      const completed = new Set(attempts.map((a: any) => a.quizId));
      setCompletedQuizzes(completed);
      attempts.forEach((a: any) => rememberSubmitted(a.quizId));
    }, (err) => {
      console.error('Error loading quiz attempts:', err);
    });
    return () => unsubscribe();
  }, [user?.uid, rememberSubmitted]);

  const currentAuthor = () => newUsername?.trim() || user?.displayName || user?.email?.split('@')[0] || 'You';

  const handlePostQuestion = async () => {
    const question = newQuestion.trim();
    if (!question) return;
    const postData = {
      title: question,
      author: currentAuthor(),
      tags: [newTag],
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'forumPosts'), postData);
      setNewQuestion('');
      setForumError(null);
    } catch (err: any) {
      setForumError(err?.message || 'Failed to post question');
    }
  };

  const handleAddReply = async (postId: string, text: string) => {
    if (!text.trim()) return;
    const replyData = {
      postId,
      author: currentAuthor(),
      text: text.trim(),
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'forumPosts', postId, 'replies'), replyData);
      setForumError(null);
    } catch (err: any) {
      setForumError(err?.message || 'Failed to add reply');
    }
  };

  const seedForumData = async () => {
    setSeeding(true);
    setForumError(null);
    try {
      const posts = [
        { title: 'How to choose sensors for a line-following bot?', author: 'Aisha', tags: ['robotics', 'hardware'], reply: { author: 'Sam', text: 'Use IR array sensors; keep them close to the floor.' } },
        { title: 'Best datasets for fine-tuning small vision models?', author: 'Ravi', tags: ['ml', 'vision'], reply: { author: 'Chen', text: 'Try CIFAR-10/100 for quick experiments.' } },
        { title: 'Trouble with Firebase auth redirect in Vite app', author: 'Sofia', tags: ['web', 'firebase'], reply: { author: 'Priya', text: 'Ensure auth domain matches in Firebase console.' } },
        { title: 'PID tuning tips for balancing bots', author: 'Leo', tags: ['control', 'robotics'], reply: { author: 'Vikram', text: 'Start with Kp only, then add Ki and Kd gradually.' } },
      ];

      for (const post of posts) {
        const postRef = await addDoc(collection(db, 'forumPosts'), {
          title: post.title,
          author: post.author,
          tags: post.tags,
          createdAt: serverTimestamp(),
          points: 0,
          upvotes: [],
          downvotes: [],
        });
        await addDoc(collection(db, 'forumPosts', postRef.id, 'replies'), {
          postId: postRef.id,
          author: post.reply.author,
          text: post.reply.text,
          createdAt: serverTimestamp(),
          points: 0,
          upvotes: [],
          downvotes: [],
        });
      }
      alert('✅ Forum seeded successfully! 4 posts with replies added.');
    } catch (err: any) {
      setForumError(err?.message || 'Failed to seed forum');
    } finally {
      setSeeding(false);
    }
  };

  const handleVote = async (postId: string, replyId: string | null, voteType: 'up' | 'down') => {
    const userId = user?.uid || 'anonymous';
    if (!userId || userId === 'anonymous') {
      alert('Please log in to vote');
      return;
    }

    try {
      const docRef = replyId
        ? doc(db, 'forumPosts', postId, 'replies', replyId)
        : doc(db, 'forumPosts', postId);

      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        console.warn('Target doc missing for vote');
        return;
      }
      const data = snap.data() as any;
      const currentUps: string[] = data.upvotes ?? [];
      const currentDowns: string[] = data.downvotes ?? [];

      const isUp = voteType === 'up';
      let nextUps = currentUps;
      let nextDowns = currentDowns;

      if (isUp) {
        const alreadyUp = currentUps.includes(userId);
        nextUps = alreadyUp ? currentUps.filter(id => id !== userId) : [...currentUps, userId];
        nextDowns = currentDowns.filter(id => id !== userId);
      } else {
        const alreadyDown = currentDowns.includes(userId);
        nextDowns = alreadyDown ? currentDowns.filter(id => id !== userId) : [...currentDowns, userId];
        nextUps = currentUps.filter(id => id !== userId);
      }

      const points = nextUps.length - nextDowns.length;

      console.log('Vote update:', { postId, replyId, voteType, userId, nextUps, nextDowns, points });
      await updateDoc(docRef, {
        upvotes: nextUps,
        downvotes: nextDowns,
        points,
      });
      console.log('Vote saved successfully');
    } catch (err: any) {
      console.error('Vote error:', err);
      if (err.code === 'permission-denied') {
        alert('❌ Permission denied. Check your Firestore rules.');
      } else {
        alert('Could not register vote. Please try again.');
      }
    }
  };

  const filteredTasks = tasksFilter === 'in-progress'
    ? mockTasks.filter(task => task.status === 'in-progress')
    : mockTasks;

  // Avatar options sourced from public/assets/avatars
  const avatarOptions = React.useMemo(() => {
    const build = (prefix: string, count: number) => Array.from({ length: count }, (_, i) => `${prefix}_${i + 1}`);
    return [
      ...build('3d', 5),
      ...build('bluey', 10),
      ...build('memo', 35),
      ...build('notion', 15),
      ...build('teams', 9),
      ...build('toon', 10),
      ...build('upstream', 22),
      ...build('vibrent', 27),
    ];
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  return (
    <>
      <style>{`
        .netflix-scroll-row {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .netflix-scroll-row::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative min-h-screen" style={{ backgroundColor: THEME.background }}>
        {/* Subtle looping background video with higher opacity */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          src="/rsm/assets/video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,17,23,0.75) 0%, rgba(13,17,23,0.88) 45%, rgba(17,24,39,0.95) 100%)' }} />

        <div className="relative z-10 min-h-screen flex">
      {/* SIDEBAR - Hidden on mobile */}
      <aside className="hidden lg:flex w-72 flex-col py-6 px-6 border-r" style={{ backgroundColor: THEME.sidebar, borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Logo/Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h2 className="font-bold text-lg leading-tight" style={{ color: THEME.textPrimary }}>Research Society</h2>
              <p className="text-xs" style={{ color: THEME.textSecondary }}>MIT</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
            style={{ color: THEME.textSecondary }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </button>

          <div className="text-xs font-semibold uppercase px-4 py-3 tracking-wide" style={{ color: THEME.textSecondary }}>Dashboard</div>

          <button 
            onClick={() => { setActiveTab('tasks'); setTasksFilter('all'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium"
            style={{ 
              backgroundColor: activeTab === 'tasks' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'tasks' ? THEME.accentPrimary : THEME.textSecondary,
              borderLeft: activeTab === 'tasks' ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium">Tasks</span>
          </button>

          <button 
            onClick={() => setActiveTab('quizzes')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium"
            style={{ 
              backgroundColor: activeTab === 'quizzes' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'quizzes' ? THEME.accentPrimary : THEME.textSecondary,
              borderLeft: activeTab === 'quizzes' ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Quizzes</span>
          </button>

          <button 
            onClick={() => setActiveTab('submit')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium"
            style={{ 
              backgroundColor: activeTab === 'submit' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'submit' ? THEME.accentPrimary : THEME.textSecondary,
              borderLeft: activeTab === 'submit' ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Submit Task</span>
          </button>

          <button 
            onClick={() => setActiveTab('leaderboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium"
            style={{ 
              backgroundColor: activeTab === 'leaderboard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'leaderboard' ? THEME.accentPrimary : THEME.textSecondary,
              borderLeft: activeTab === 'leaderboard' ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v4H3zM3 9h18v4H3zM3 15h18v4H3z" />
            </svg>
            <span className="font-medium">Leaderboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('resources')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium"
            style={{ 
              backgroundColor: activeTab === 'resources' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'resources' ? THEME.accentPrimary : THEME.textSecondary,
              borderLeft: activeTab === 'resources' ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium">Resources</span>
          </button>

          <button 
            onClick={() => setActiveTab('forum')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium"
            style={{ 
              backgroundColor: activeTab === 'forum' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: activeTab === 'forum' ? THEME.accentPrimary : THEME.textSecondary,
              borderLeft: activeTab === 'forum' ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-8 6l-2 2V6a2 2 0 012-2h12a2 2 0 012 2v12l-2-2H5z" />
            </svg>
            <span className="font-medium">Forum</span>
          </button>
        </nav>

        {/* Bottom Navigation */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <button 
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
            style={{ color: THEME.textSecondary }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Settings</span>
          </button>

          <button 
            onClick={async () => {
              await logout();
              navigate('/landing');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 rounded-lg transition-all text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="border-b px-4 md:px-8 py-4 md:py-6 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: THEME.background }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: THEME.textPrimary }}>Dashboard</h1>
            <p className="text-xs md:text-sm mt-1 truncate max-w-[200px] sm:max-w-none" style={{ color: THEME.textSecondary }}>Welcome back, {newUsername || user?.displayName || user?.email?.split('@')[0]}!</p>
          </div>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all"
            style={{ backgroundColor: THEME.accentPrimary, color: THEME.background }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#60A5FA'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.accentPrimary}
          >
            <img
              key={selectedAvatar}
              src={`/rsm/assets/avatars/${selectedAvatar}.png`}
              alt="avatar"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/rsm/assets/avatars/bluey_1.png';
              }}
            />
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-8" style={{ backgroundColor: THEME.background }}>
          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="max-w-6xl">
              <h2 className="text-2xl font-bold mb-6" style={{ color: THEME.textPrimary }}>Your Tasks</h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: THEME.textSecondary }}>
                  Showing {tasksFilter === 'in-progress' ? 'in-progress tasks' : 'all tasks'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTasksFilter('in-progress')}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: tasksFilter === 'in-progress' ? THEME.accentPrimary : 'transparent',
                      color: tasksFilter === 'in-progress' ? THEME.background : THEME.textSecondary,
                      border: `1px solid ${tasksFilter === 'in-progress' ? THEME.accentPrimary : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setTasksFilter('all')}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: tasksFilter === 'all' ? THEME.accentPrimary : 'transparent',
                      color: tasksFilter === 'all' ? THEME.background : THEME.textSecondary,
                      border: `1px solid ${tasksFilter === 'all' ? THEME.accentPrimary : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    All
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredTasks.length === 0 && (
                  <div className="backdrop-blur-md border rounded-xl p-6" style={{ backgroundColor: `${THEME.card}99`, borderColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-sm" style={{ color: THEME.textSecondary }}>No tasks in progress right now.</p>
                  </div>
                )}

                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => navigate(`/task/${task.id}`)}
                    className="backdrop-blur-md border rounded-xl p-6 hover:border-white/20 hover:shadow-lg transition-all cursor-pointer" 
                    style={{ backgroundColor: `${THEME.card}99`, borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg" style={{ color: THEME.textPrimary }}>{task.title}</h3>
                        <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>{task.category} • {task.difficulty}</p>
                        <p className="text-xs mt-2" style={{ color: THEME.textMuted }}>Due: {task.dueDate}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="max-w-2xl mx-auto">
              <div className="backdrop-blur-md border rounded-xl p-16 text-center" style={{ backgroundColor: `${THEME.card}99`, borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                <div className="flex items-center justify-center mb-6">
                  <div className="text-7xl">🚀</div>
                </div>
                <h2 className="text-4xl font-bold" style={{ color: THEME.textPrimary }}>Coming Soon!</h2>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="max-w-5xl">
              <h2 className="text-2xl font-bold mb-6" style={{ color: THEME.textPrimary }}>🏆 Leaderboard</h2>
              <Leaderboard key={selectedAvatar} THEME={THEME} currentUserName={currentAuthor()} currentAvatar={`/rsm/assets/avatars/${selectedAvatar}.png`} quizzes={quizzes} />
            </div>
          )}

          {/* SUBMIT TASK TAB */}
          {activeTab === 'submit' && (
            <div className="max-w-2xl">
              <div className="backdrop-blur-md border rounded-xl p-12" style={{ backgroundColor: `${THEME.card}99`, borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                <div className="flex items-center justify-center mb-6">
                  <div className="text-6xl">📋</div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-6" style={{ color: THEME.textPrimary }}>Task Submission Portal</h2>
                <div className="space-y-6 text-center">
                  <p className="text-lg" style={{ color: THEME.textSecondary }}>
                    The submission link will be provided <span className="font-bold" style={{ color: THEME.accentPrimary }}>before the deadline</span>
                  </p>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: `4px solid ${THEME.accentPrimary}` }}>
                    <p style={{ color: THEME.textSecondary }}>
                      Please check back here closer to the submission deadline. Your submission link will appear here with full instructions.
                    </p>
                  </div>
                  <p className="text-sm" style={{ color: THEME.textMuted }}>
                    📅 Keep an eye on the task deadlines and check back for the submission link
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="max-w-full">
              {/* Sub-tab Navigation */}
              <div className="flex gap-4 mb-8 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setResourceSubTab('videos')}
                  className="px-6 py-3 font-semibold rounded-lg transition-all"
                  style={{
                    backgroundColor: resourceSubTab === 'videos' ? THEME.accentPrimary : 'transparent',
                    color: resourceSubTab === 'videos' ? THEME.background : THEME.textSecondary,
                    border: resourceSubTab === 'videos' ? 'none' : '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  🎬 Video Resources
                </button>
                <button
                  onClick={() => setResourceSubTab('books')}
                  className="px-6 py-3 font-semibold rounded-lg transition-all"
                  style={{
                    backgroundColor: resourceSubTab === 'books' ? THEME.accentPrimary : 'transparent',
                    color: resourceSubTab === 'books' ? THEME.background : THEME.textSecondary,
                    border: resourceSubTab === 'books' ? 'none' : '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  📖 Reading Resources
                </button>
                <button
                  onClick={() => setResourceSubTab('papers')}
                  className="px-6 py-3 font-semibold rounded-lg transition-all"
                  style={{
                    backgroundColor: resourceSubTab === 'papers' ? THEME.accentPrimary : 'transparent',
                    color: resourceSubTab === 'papers' ? THEME.background : THEME.textSecondary,
                    border: resourceSubTab === 'papers' ? 'none' : '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  📄 Research Papers
                </button>
              </div>

              {/* VIDEOS SECTION */}
              {resourceSubTab === 'videos' && (
              <div className="mb-12">
                <h2 className="text-3xl font-black mb-6" style={{ color: THEME.textPrimary }}>🎬 Featured Videos</h2>

                {/* Video Library (page 1) */}
                {!showVideoDetail && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ maxWidth: '100%' }}>
                    {mockVideos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => { setSelectedVideoIndex(index); setShowVideoDetail(true); }}
                        className="group rounded-2xl overflow-hidden text-left transition-all hover:-translate-y-1 hover:shadow-2xl"
                        style={{ backgroundColor: `${THEME.card}E6`, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
                      >
                        <div className="relative" style={{ aspectRatio: '16/9' }}>
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${THEME.accentPrimary}DD`, boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
                              <svg className="w-10 h-10 ml-1" fill="white" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: THEME.textPrimary }}>
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-5 space-y-2">
                          <h3 className="font-bold text-lg leading-tight line-clamp-2" style={{ color: THEME.textPrimary }}>
                            {video.title}
                          </h3>
                          <p className="text-sm" style={{ color: THEME.textSecondary }}>
                            {video.channel}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Video Detail (page 2) */}
                {showVideoDetail && (
                  <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
                    {/* Sticky Back Button */}
                    <div className="sticky top-0 z-50 px-4 py-4 border-b border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}>
                      <button
                        onClick={() => setShowVideoDetail(false)}
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm md:text-base"
                        style={{ backgroundColor: THEME.accentPrimary, color: THEME.background }}
                      >
                        ← Back to Library
                      </button>
                    </div>

                    <div
                      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden"
                      style={{
                        minHeight: '80vh',
                        backgroundColor: THEME.card,
                        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
                      }}
                    >
                      {/* Blurred Background from selected thumbnail */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${mockVideos[selectedVideoIndex].thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(24px) brightness(0.5)',
                          transform: 'scale(1.1)'
                        }}
                      />

                      {/* Overlay tint */}
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)' }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-10">

                        {/* Main video card */}
                        <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 70px rgba(0,0,0,0.55)' }}>
                          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                            <iframe
                              key={mockVideos[selectedVideoIndex].embedId}
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${mockVideos[selectedVideoIndex].embedId}?autoplay=1&modestbranding=1&rel=0&color=white`}
                              title={mockVideos[selectedVideoIndex].title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </div>

                        {/* Title + meta */}
                        <div className="text-center">
                          <h3
                            className="font-black text-4xl tracking-tight uppercase"
                            style={{ color: '#FFFFFF', textShadow: '0 3px 14px rgba(59, 130, 246, 0.4)' }}
                          >
                            {mockVideos[selectedVideoIndex].title}
                          </h3>
                          <p className="mt-3 text-base font-medium" style={{ color: THEME.textSecondary }}>
                            {mockVideos[selectedVideoIndex].channel} · {mockVideos[selectedVideoIndex].duration}
                          </p>
                        </div>

                        {/* Floating thumbnail strip */}
                        <div className="relative w-full max-w-5xl mt-2">
                          {/* Left control */}
                          <button
                            onClick={() => scrollRow(videosRowRef, 'left')}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold"
                            style={{ backgroundColor: THEME.accentPrimary, color: THEME.background, boxShadow: '0 10px 30px rgba(59,130,246,0.5)' }}
                          >
                            ‹
                          </button>

                          <div
                            ref={videosRowRef}
                            className="overflow-x-auto scrollbar-hide px-2"
                            style={{ scrollBehavior: 'smooth' }}
                          >
                            <style>{`
                              .scrollbar-hide::-webkit-scrollbar { display: none; }
                              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                            `}</style>

                            <div className="flex gap-6 py-2" style={{ width: 'max-content', minWidth: '100%', justifyContent: 'center' }}>
                              {mockVideos.map((video, index) => (
                                <button
                                  key={video.id}
                                  onClick={() => setSelectedVideoIndex(index)}
                                  className="relative flex-shrink-0 rounded-2xl overflow-hidden transition-all"
                                  style={{
                                    width: '260px',
                                    transform: selectedVideoIndex === index ? 'translateY(-10px) scale(1.06)' : 'translateY(0) scale(1)',
                                    border: selectedVideoIndex === index ? `4px solid ${THEME.accentPrimary}` : '4px solid transparent',
                                    boxShadow: selectedVideoIndex === index
                                      ? `0 16px 40px rgba(0,0,0,0.55), 0 0 28px ${THEME.accentPrimary}55`
                                      : '0 10px 26px rgba(0,0,0,0.45)',
                                    backgroundColor: THEME.card
                                  }}
                                >
                                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                      style={{ opacity: selectedVideoIndex === index ? 1 : 0.85 }}
                                    />

                                    {/* Play badge */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div
                                        className="rounded-full flex items-center justify-center"
                                        style={{
                                          width: selectedVideoIndex === index ? 60 : 52,
                                          height: selectedVideoIndex === index ? 60 : 52,
                                          backgroundColor: `${THEME.accentPrimary}${selectedVideoIndex === index ? 'FF' : 'CC'}`,
                                          boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                                        }}
                                      >
                                        <svg className="w-7 h-7 ml-1" fill="white" viewBox="0 0 20 20">
                                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                      </div>
                                    </div>

                                    {/* Glow corners when active */}
                                    {selectedVideoIndex === index && (
                                      <>
                                        <div className="absolute top-2 left-2 text-xl" style={{ color: THEME.accentPrimary }}>✦</div>
                                        <div className="absolute top-2 right-2 text-xl" style={{ color: THEME.accentPrimary }}>✦</div>
                                        <div className="absolute bottom-2 left-2 text-xl" style={{ color: THEME.accentPrimary }}>✦</div>
                                        <div className="absolute bottom-2 right-2 text-xl" style={{ color: THEME.accentPrimary }}>✦</div>
                                      </>
                                    )}
                                  </div>

                                  <div className="px-4 py-3 text-center" style={{ backgroundColor: selectedVideoIndex === index ? `${THEME.accentPrimary}20` : `${THEME.card}DD` }}>
                                    <h4
                                      className="font-bold text-sm line-clamp-2"
                                      style={{ color: selectedVideoIndex === index ? THEME.accentPrimary : THEME.textPrimary }}
                                    >
                                      {video.title}
                                    </h4>
                                    <p className="text-xs mt-1" style={{ color: THEME.textSecondary }}>
                                      {video.channel}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Right control */}
                          <button
                            onClick={() => scrollRow(videosRowRef, 'right')}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold"
                            style={{ backgroundColor: THEME.accentPrimary, color: THEME.background, boxShadow: '0 10px 30px rgba(59,130,246,0.5)' }}
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* READING RESOURCES SECTION - BOOKSHELF */}
              {resourceSubTab === 'books' && (
              <div className="mb-12">
                <h2 className="text-3xl font-black mb-8" style={{ color: THEME.textPrimary }}>📖 Reading Resources</h2>
                
                {books.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(59, 130, 246, 0.03)' }}>
                    <div style={{ fontSize: '48px' }} className="mb-4">📚</div>
                    <p style={{ color: THEME.textSecondary }} className="text-lg font-semibold mb-2">Your library is empty</p>
                    <p style={{ color: THEME.textMuted }} className="text-sm">Upload book covers and PDFs to build your collection!</p>
                  </div>
                ) : null}
                
                <BookShelf 
                  books={books}
                  onAddBook={(book) => setBooks([...books, book])}
                  onRemoveBook={(bookId) => setBooks(books.filter(b => b.id !== bookId))}
                  THEME={THEME}
                />
              </div>
              )}

              {/* RESEARCH PAPERS SECTION - VERTICAL LAYOUT */}
              {resourceSubTab === 'papers' && (
              <div className="mb-12">
                <h2 className="text-3xl font-black mb-6" style={{ color: THEME.textPrimary }}>📄 Research Papers</h2>
                <div className="grid grid-cols-1 gap-6">
                    {mockResearchPapers.map(paper => (
                      <a
                        key={paper.id}
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-102 hover:shadow-2xl"
                      >
                        {/* Paper Card */}
                        <div
                          className="p-8 flex flex-col justify-between group-hover:brightness-110 transition-all backdrop-blur-md border"
                          style={{ backgroundColor: `${THEME.card}99`, borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                        >
                          <div>
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center text-white text-5xl mb-5">
                              📃
                            </div>
                            <h3 className="font-bold text-xl transition-colors" style={{ color: THEME.textPrimary }} onMouseEnter={(e) => e.currentTarget.style.color = THEME.accentPrimary} onMouseLeave={(e) => e.currentTarget.style.color = THEME.textPrimary}>
                              {paper.title}
                            </h3>
                          </div>

                          <div className="mt-5">
                            <p className="text-base font-semibold" style={{ color: THEME.textSecondary }}>
                              {paper.authors}
                            </p>
                            <p className="text-sm opacity-60 mt-2" style={{ color: THEME.textMuted }}>
                              🏆 {paper.venue}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              </div>
              )}

              </div>
            )}

              {/* FORUM TAB */}
              {activeTab === 'forum' && (
                <div className="max-w-6xl space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black" style={{ color: THEME.textPrimary }}>💬 Discussion Forum</h2>
                      <p className="text-sm mt-1" style={{ color: THEME.textSecondary }}>Ask doubts, share answers, and collaborate.</p>
                      <p className="text-xs mt-1" style={{ color: THEME.textMuted }}>Showing latest 50 posts for faster load.</p>
                    </div>
                  </div>

                  {forumError && (
                    <div className="p-3 rounded-lg border text-sm" style={{ borderColor: 'rgba(239,68,68,0.25)', color: '#FCA5A5', backgroundColor: 'rgba(239,68,68,0.06)' }}>
                      {forumError}
                    </div>
                  )}

                  {!forumLoaded && (
                    <p className="text-sm" style={{ color: THEME.textSecondary }}>Loading forum…</p>
                  )}

                  {/* Debug info */}
                  {forumLoaded && (
                    <div className="text-xs p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: THEME.textMuted }}>
                      <strong>Debug:</strong> {forumPosts.length} posts loaded, {Object.keys(forumReplies).length} posts with replies (Total replies: {Object.values(forumReplies).flat().length})
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      {forumPosts.map(post => {
                        const replies = forumReplies[post.id] ?? [];
                        const latestStamp = replies[replies.length - 1]?.createdAt ?? post.createdAt;
                        const lastReplyLabel = formatTimeAgo(latestStamp instanceof Timestamp ? latestStamp.toDate() : null);
                        return (
                        <div key={post.id} className="p-6 rounded-xl border-2 space-y-4 transition-all hover:shadow-lg" style={{ backgroundColor: `${THEME.card}F0`, borderColor: `${THEME.accentPrimary}40`, boxShadow: `0 4px 12px ${THEME.accentPrimary}15` }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2" style={{ color: THEME.textPrimary }}>{post.title}</h3>
                              <div className="flex items-center gap-2 text-xs mb-3" style={{ color: THEME.textSecondary }}>
                                <span className="font-semibold" style={{ color: THEME.accentPrimary }}>@{post.author}</span>
                                <span>•</span>
                                <span>{lastReplyLabel}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                  <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${THEME.accentPrimary}25`, color: THEME.accentPrimary, border: `1px solid ${THEME.accentPrimary}50` }}>
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex gap-2">
                                <button onClick={() => handleVote(post.id, null, 'up')} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: `${THEME.accentPrimary}30`, color: THEME.accentPrimary, border: `1px solid ${THEME.accentPrimary}60` }}>
                                  👍 {(post.upvotes ?? []).length}
                                </button>
                                <button onClick={() => handleVote(post.id, null, 'down')} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: 'rgba(239,68,68,0.25)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.5)' }}>
                                  👎 {(post.downvotes ?? []).length}
                                </button>
                              </div>
                              <div className="px-3 py-1.5 text-xs font-bold rounded-full" style={{ backgroundColor: `${THEME.accentPrimary}20`, color: THEME.accentPrimary, border: `1px solid ${THEME.accentPrimary}40` }}>
                                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                              </div>
                            </div>
                          </div>

                          {/* Replies Section */}
                          {replies.length > 0 && (
                            <div className="space-y-3 pl-4 border-l-2 py-2" style={{ borderColor: `${THEME.accentPrimary}30` }}>
                              {replies.map((r) => (
                                <div key={r.id} className="rounded-lg p-4 transition-all hover:shadow-md" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.accentPrimary}20` }}>
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span style={{ color: THEME.accentPrimary }} className="font-bold">@{r.author}</span>
                                      <span style={{ color: THEME.textSecondary }}>•</span>
                                      <span style={{ color: THEME.textSecondary }}>{formatTimeAgo(r.createdAt instanceof Timestamp ? r.createdAt.toDate() : null)}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <button onClick={() => handleVote(post.id, r.id, 'up')} className="text-xs px-2 py-1 rounded font-semibold transition-all hover:scale-105" style={{ backgroundColor: `${THEME.accentPrimary}25`, color: THEME.accentPrimary }}>
                                        👍 {(r.upvotes ?? []).length}
                                      </button>
                                      <button onClick={() => handleVote(post.id, r.id, 'down')} className="text-xs px-2 py-1 rounded font-semibold transition-all hover:scale-105" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                                        👎 {(r.downvotes ?? []).length}
                                      </button>
                                    </div>
                                  </div>
                                  <p style={{ color: THEME.textPrimary }} className="text-sm leading-relaxed">{r.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {replies.length === 0 && (
                            <div className="p-4 rounded-lg text-center text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: THEME.textSecondary, border: `1px dashed ${THEME.accentPrimary}30` }}>
                              💭 No replies yet. Be the first to help!
                            </div>
                          )}

                          {/* Quick reply */}
                          <div className="flex gap-3 pt-2">
                            <input
                              value={replyDrafts[post.id] ?? ''}
                              onChange={(e) => setReplyDrafts({ ...replyDrafts, [post.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const text = replyDrafts[post.id] ?? '';
                                  handleAddReply(post.id, text);
                                  setReplyDrafts({ ...replyDrafts, [post.id]: '' });
                                }
                              }}
                              placeholder="Reply with an answer..."
                              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2"
                              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${THEME.accentPrimary}30`, color: THEME.textPrimary, '--tw-ring-color': THEME.accentPrimary } as any}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const text = replyDrafts[post.id] ?? '';
                                handleAddReply(post.id, text);
                                setReplyDrafts({ ...replyDrafts, [post.id]: '' });
                              }}
                              className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
                              style={{ background: `linear-gradient(135deg, ${THEME.accentPrimary} 0%, ${THEME.accentSecondary} 100%)`, color: THEME.background }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    <div className="p-6 rounded-xl border-2 sticky top-4 h-fit" style={{ backgroundColor: `${THEME.card}F0`, borderColor: `${THEME.accentPrimary}40`, boxShadow: `0 4px 12px ${THEME.accentPrimary}15` }}>
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: THEME.textPrimary }}>
                        ✨ Ask a question
                      </h4>
                      <div className="space-y-4">
                        <textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Describe your doubt..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg text-sm font-medium resize-none transition-all focus:outline-none focus:ring-2"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${THEME.accentPrimary}30`, color: THEME.textPrimary, '--tw-ring-color': THEME.accentPrimary } as any}
                        />
                        <button
                          type="button"
                          onClick={handlePostQuestion}
                          className="w-full py-2 rounded-lg font-semibold"
                          style={{ backgroundColor: THEME.accentPrimary, color: THEME.background }}
                        >
                          Post question
                        </button>
                        <p className="text-xs" style={{ color: THEME.textSecondary }}>Tip: Be concise and share what you’ve tried.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
        </main>
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(26, 22, 83, 0.95)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: THEME.textPrimary }}>My Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-2xl font-bold hover:opacity-70 transition-all"
                style={{ color: THEME.textSecondary }}
              >
                ×
              </button>
            </div>

            {/* USERNAME SECTION */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3" style={{ color: THEME.textPrimary }}>Username</label>
              <div className="flex items-center p-4 border rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <span style={{ color: THEME.textPrimary }}>{newUsername}</span>
              </div>
            </div>

            {/* AVATAR SELECTOR */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: THEME.textPrimary }}>Select Avatar</label>
              <div className="max-h-80 overflow-y-auto">
                <div className="grid grid-cols-6 gap-3">
                  {avatarOptions.map(av => (
                    <button
                      key={av}
                      onClick={() => {
                        console.log('Changing avatar to:', av);
                        setSelectedAvatar(av);
                        setAvatarSaved(false);
                        // Save immediately and show confirmation
                        if (avatarKey) {
                          localStorage.setItem(avatarKey, av);
                          console.log('Avatar saved to localStorage:', { key: avatarKey, value: av });
                        }
                        setTimeout(() => setAvatarSaved(true), 1500);
                      }}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        selectedAvatar === av
                          ? `ring-2`
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{
                        borderColor: selectedAvatar === av ? THEME.accentPrimary : 'rgba(255,255,255,0.2)',
                        '--tw-ring-color': THEME.accentPrimary
                      } as React.CSSProperties}
                      title={av}
                    >
                      <div className="w-full aspect-square rounded overflow-hidden bg-black/20 flex items-center justify-center text-sm font-semibold" style={{ color: THEME.textPrimary }}>
                        <img
                          src={`/rsm/assets/avatars/${av}.png`}
                          alt={av}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/rsm/assets/avatars/bluey_1.png';
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <p className="text-xs" style={{ color: THEME.textSecondary }}>Current: <span style={{ color: THEME.accentPrimary }}>{selectedAvatar}</span></p>
                {!avatarSaved && <p className="text-xs mt-1" style={{ color: THEME.accentPrimary }}>⏳ Saving...</p>}
                {avatarSaved && <p className="text-xs mt-1" style={{ color: '#22C55E' }}>✅ Avatar saved to profile</p>}
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3 font-semibold rounded-lg transition-all mt-6"
              style={{ backgroundColor: THEME.accentPrimary, color: THEME.background }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34C6AE'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME.accentPrimary}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* QUIZ ATTEMPT MODAL */}
      {selectedQuiz && user?.uid && (
        <QuizAttempt
          quiz={selectedQuiz}
          onComplete={async (result) => {
            console.log(`Quiz completed: ${result.score}/${result.totalPoints} in ${result.timeInSeconds}s`);
            // Mark as submitted
            rememberSubmitted(selectedQuiz.id);
            // Save result to state
            setQuizAttempts(prev => {
              const exists = prev.some(a => a.quizId === result.quizId && a.userId === user?.uid);
              if (exists) return prev;
              return [
                ...prev,
                {
                  quizId: result.quizId,
                  quizTitle: result.quizTitle,
                  score: result.score,
                  totalPoints: result.totalPoints,
                  timeInSeconds: result.timeInSeconds,
                  completedAt: new Date(),
                  userId: user?.uid,
                  answers: result.answers
                }
              ];
            });
            // Save to Firestore
            try {
              await addDoc(collection(db, 'quizAttempts'), {
                userId: user?.uid,
                userName: newUsername || user?.displayName || 'Student',
                quizId: result.quizId,
                quizTitle: result.quizTitle,
                score: result.score,
                totalPoints: result.totalPoints,
                timeInSeconds: result.timeInSeconds,
                completedAt: serverTimestamp(),
                answers: result.answers
              });
            } catch (error) {
              console.error('Error saving quiz result:', error);
            }
          }}
          onCancel={() => setSelectedQuiz(null)}
        />
      )}
      </div>
    </div>
    </>
  );
};

export default StudentDashboard;
