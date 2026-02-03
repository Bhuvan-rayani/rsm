
export enum TaskCategory {
  MACHINE_LEARNING = 'Machine Learning',
  BIOTECHNOLOGY = 'Biotechnology',
  ROBOTICS = 'Robotics',
  PHYSICS = 'Physics',
  GENERAL = 'General Research',
  ELECTRONICS = 'Electronics'
}

export enum TaskDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface EmbedLink {
  id: string;
  url: string;
  title: string;
  type?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  deadline: string;
  links: EmbedLink[];
  postedBy: string;
  createdAt: number;
  coverImage?: string;
  authorAvatar?: string;
}

export interface AIResearchInsight {
  summary: string;
  suggestedResources: string[];
  keyTerms: string[];
  methodologyHints: string[];
}

// Quiz & Leaderboard Types
import { Timestamp } from 'firebase/firestore';

export type QuestionType = 'single' | 'multiple' | 'coding';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // Total quiz time limit in seconds (optional)
  createdAt?: Timestamp;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswers: string[] | string;
  points: number;
  timeLimit?: number;
  testCases?: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string | string[]>;
  score: number;
  totalPoints: number;
  timeSpent: number;
  completedAt: Timestamp;
}

export interface UserStats {
  userId: string;
  forumPoints: number;
  quizPoints: number;
  totalPoints: number;
}

export interface ForumVote {
  userId: string;
  type: 'up' | 'down';
  createdAt: Timestamp;
}
