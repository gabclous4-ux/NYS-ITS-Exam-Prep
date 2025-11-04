import type React from 'react';

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  iconName: string;
  officialDescription?: string;
  subTopics?: StudyTopic[];
}

export interface Source {
  uri: string;
  title:string;
}

export interface StudyGuideResponse {
  content: string;
  sources: Source[];
}

export interface StudyGuideCache extends StudyGuideResponse {
  timestamp: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SavedQuestion extends QuizQuestion {
    id: string; 
    topicId: string;
    topicTitle: string;
}

export interface AnswerState {
  isCorrect: boolean | null;
  selectedOption: number | null;
}

export interface QuizResult {
  id: string;
  topicId: string;
  topicTitle: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

export interface ToastMessage {
  id: number;
  message: string;
}
