import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useId
} from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleGenAI, Type } from '@google/genai'

// =================================================================================
// TYPES
// =================================================================================

interface StudyTopic {
  id: string
  title: string
  description: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  iconName: string
  officialDescription?: string
  subTopics?: StudyTopic[]
}

interface Source {
  uri: string
  title: string
}

interface StudyGuideResponse {
  content: string
  sources: Source[]
}

interface StudyGuideCache extends StudyGuideResponse {
  timestamp: number
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswerIndex: number
  explanation: string
}

interface SavedQuestion extends QuizQuestion {
  id: string
  topicId: string
  topicTitle: string
}

interface AnswerState {
  isCorrect: boolean | null
  selectedOption: number | null
}

interface QuizResult {
  id: string
  topicId: string
  topicTitle: string
  difficulty: Difficulty
  score: number
  totalQuestions: number
  timestamp: number
}

interface ToastMessage {
  id: number
  message: string
}

// =================================================================================
// ICONS
// =================================================================================

type IconProps = React.SVGProps<SVGSVGElement>

const UsersIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.683c.65-.935 1-2.06 1-3.255a4.5 4.5 0 00-9 0c0 1.195.35 2.32 1 3.255m1.375 0c-.397.562-.996 1.003-1.625 1.282M19.5 14.25c0-2.485-2.015-4.5-4.5-4.5s-4.5 2.015-4.5 4.5c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5zm-9-4.5h.008v.008H10.5v-.008z"
    />
  </svg>
)

const CogIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5"
    />
  </svg>
)

const ChartBarIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 21v-7.875zM12.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v12.375c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM21 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.875c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
)

const DocumentCheckIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const SitemapIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
    />
  </svg>
)

const DocumentTextIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
)

const BriefcaseIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 14.15v4.075a3.375 3.375 0 01-3.375 3.375H7.125a3.375 3.375 0 01-3.375-3.375v-4.075M16.125 12.75h-8.25M12 15V3.75m0 11.25a3 3 0 01-3-3m3 3a3 3 0 003-3m-3-3a3 3 0 013-3m-3 3a3 3 0 00-3-3"
    />
  </svg>
)

const ComputerDesktopIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.871A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
    />
  </svg>
)

const BuildingLibraryIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
    />
  </svg>
)

const TableCellsIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25m-17.25 0v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5m0 0v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5m17.25 0v-1.5"
    />
  </svg>
)

const BookmarkIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
)

const BookmarkSolidIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
      clipRule="evenodd"
    />
  </svg>
)

const SpinnerIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
    className={`animate-spin ${props.className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
)

const ErrorIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
)

const RestartIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.18-3.182l-3.182-3.182a8.25 8.25 0 00-11.664 0l-3.18 3.185"
    />
  </svg>
)

const ZoomInIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
    />
  </svg>
)

const SearchIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
    className={`w-5 h-5 ${props.className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
)

const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
    className={`w-6 h-6 ${props.className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const TrashIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
)

const HistoryIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ClockIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const XMarkIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
)

const HomeIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v.75a3 3 0 003 3h1.5v3.75a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-3.75H18a3 3 0 003-3v-.75m-15 0a3 3 0 013-3h9a3 3 0 013 3m-15 0H18"
    />
  </svg>
)

const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
)

const BookmarkSquareIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
    />
  </svg>
)

const GithubIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    {...props}
    className={`w-4 h-4 ${props.className}`}
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

const XCircleIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const AcademicCapIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l15.482 0m-15.482 0a50.57 50.57 0 01-2.658-.813m2.658.814a60.436 60.436 0 00.491 6.347"
    />
  </svg>
)

const ClipboardDocumentListIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5v.75h-1.5v-.75zm.75 1.5v-1.5m0 0H9m1.5 0H12m0 0h.008v.008H12v-.008z"
    />
  </svg>
)

const ArchiveBoxIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
)

const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
)

const ArrowUpOnSquareIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
)

const ArrowDownOnSquareIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
)

// =================================================================================
// SERVICES
// =================================================================================

// --- apiKeyService.ts ---
const API_KEY_STORAGE_KEY = 'gemini-api-key'

const saveApiKey = (key: string): void => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
  } catch (e) {
    console.error('Failed to save API key to localStorage', e)
  }
}

const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch (e) {
    console.error('Failed to get API key from localStorage', e)
    return null
  }
}

const clearApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear API key from localStorage', e)
  }
}

// =================================================================================
// CONSTANTS
// =================================================================================

const TOPICS: StudyTopic[] = [
  {
    id: 'administrative-supervision',
    title: 'Administrative Supervision',
    description:
      'Overseeing administrative staff and functions, including planning, performance evaluation, and team motivation.',
    icon: BriefcaseIcon,
    iconName: 'management people team supervision',
    officialDescription:
      'These questions test for knowledge of the principles and practices employed in planning, organizing, and controlling the activities of a work unit toward predetermined objectives. The concepts covered, usually in a situational question format, include such topics as assigning and reviewing work; evaluating performance; maintaining work standards; motivating and developing subordinates; implementing procedural change; increasing efficiency; and dealing with problems of absenteeism, morale, and discipline.',
    subTopics: [
      {
        id: 'planning-organizing',
        title: 'Planning & Organizing Work',
        description: 'Assigning tasks, setting standards, and reviewing work.',
        icon: ClipboardDocumentListIcon,
        iconName: 'planning tasks organization'
      },
      {
        id: 'performance-evaluation',
        title: 'Performance Evaluation',
        description:
          'Techniques for evaluating employee performance and providing feedback.',
        icon: ChartBarIcon,
        iconName: 'performance review feedback'
      },
      {
        id: 'motivation-development',
        title: 'Motivation & Development',
        description: 'Strategies for motivating and developing subordinates.',
        icon: AcademicCapIcon,
        iconName: 'motivation training development'
      },
      {
        id: 'workplace-issues',
        title: 'Handling Workplace Issues',
        description:
          'Addressing morale, absenteeism, and disciplinary problems.',
        icon: UsersIcon,
        iconName: 'morale discipline hr issues'
      }
    ]
  },
  {
    id: 'administrative-techniques',
    title: 'Administrative Techniques and Practices',
    description:
      'Master modern techniques for efficient and effective office and process management.',
    icon: CogIcon,
    iconName: 'process techniques practices management',
    subTopics: [
      {
        id: 'workflow-optimization',
        title: 'Workflow Optimization',
        description:
          'Analyzing and improving administrative workflows for efficiency.',
        icon: SitemapIcon,
        iconName: 'workflow process optimization'
      },
      {
        id: 'records-management',
        title: 'Records Management',
        description:
          'Best practices for managing digital and physical records.',
        icon: ArchiveBoxIcon,
        iconName: 'records archive document management'
      },
      {
        id: 'resource-scheduling',
        title: 'Resource Scheduling',
        description:
          'Techniques for scheduling staff, meetings, and other resources.',
        icon: BriefcaseIcon,
        iconName: 'scheduling resources planning'
      }
    ]
  },
  {
    id: 'analyzing-evaluating-information',
    title: 'Analyzing and Evaluating Information',
    description:
      'Develop skills to critically analyze data and technical information to support decision-making.',
    icon: ChartBarIcon,
    iconName: 'data analysis chart graph information',
    subTopics: [
      {
        id: 'data-sourcing',
        title: 'Data Sourcing & Validation',
        description:
          'Identifying reliable sources of information and validating data integrity.',
        icon: DocumentCheckIcon,
        iconName: 'data source validation'
      },
      {
        id: 'quantitative-analysis',
        title: 'Quantitative Analysis',
        description: 'Using numerical data to identify trends and patterns.',
        icon: TableCellsIcon,
        iconName: 'quantitative analysis numbers'
      },
      {
        id: 'qualitative-analysis',
        title: 'Qualitative Analysis',
        description:
          'Interpreting non-numerical data like reports and feedback.',
        icon: DocumentTextIcon,
        iconName: 'qualitative analysis text'
      }
    ]
  },
  {
    id: 'evaluating-conclusions',
    title: 'Evaluating Conclusions from Factual Information',
    description:
      'Techniques for validating conclusions and ensuring they are supported by evidence.',
    icon: DocumentCheckIcon,
    iconName: 'fact check conclusions report validation',
    officialDescription:
      'These questions test your ability to evaluate and draw conclusions from factual information presented. Each question consists of a set of factual statements and a conclusion. You will be asked to determine whether the conclusion can be proven to be true by the facts, proven to be false by the facts, or if the facts are inadequate to prove the conclusion.',
    subTopics: [
      {
        id: 'logical-fallacies',
        title: 'Identifying Logical Fallacies',
        description:
          'Recognizing common errors in reasoning to avoid flawed conclusions.',
        icon: XCircleIcon,
        iconName: 'logic fallacies reasoning'
      },
      {
        id: 'evidence-assessment',
        title: 'Assessing Evidence Sufficiency',
        description:
          'Determining if the available facts are adequate to support a conclusion.',
        icon: ZoomInIcon,
        iconName: 'evidence assessment facts'
      },
      {
        id: 'deductive-inductive',
        title: 'Deductive vs. Inductive Reasoning',
        description:
          'Understanding the difference between reasoning from general principles and specific observations.',
        icon: SitemapIcon,
        iconName: 'deductive inductive reasoning'
      }
    ]
  },
  {
    id: 'flowchart-reasoning',
    title: 'Logical Reasoning using Flowcharts',
    description:
      'Using flowcharts and diagrams to model processes and solve complex logical problems.',
    icon: SitemapIcon,
    iconName: 'flowchart logic reasoning diagram process',
    officialDescription:
      'These questions test for ability to reason logically by solving problems involving given variables expressed in flowcharts and accompanying information. All information needed to answer the questions is included within the flowcharts and the accompanying information. Prior knowledge of flowchart conventions is necessary to answer these questions.',
    subTopics: [
      {
        id: 'flowchart-symbols',
        title: 'Flowchart Symbols & Conventions',
        description:
          'Understanding standard symbols for processes, decisions, and terminators.',
        icon: CogIcon,
        iconName: 'flowchart symbols conventions'
      },
      {
        id: 'tracing-paths',
        title: 'Tracing Logic Paths',
        description:
          'Following the flow of a diagram based on given conditions and variables.',
        icon: ArrowLeftIcon,
        iconName: 'flowchart tracing logic path'
      },
      {
        id: 'complex-decisions',
        title: 'Complex Decision Structures',
        description:
          'Analyzing flowcharts with nested decisions and multiple conditions.',
        icon: ComputerDesktopIcon,
        iconName: 'flowchart decision logic complex'
      }
    ]
  },
  {
    id: 'report-preparation',
    title: 'Preparing Reports and Official Documents',
    description:
      'Best practices for creating clear, concise, and professional technical reports and documentation.',
    icon: DocumentTextIcon,
    iconName: 'reports documents writing preparation',
    subTopics: [
      {
        id: 'technical-writing',
        title: 'Technical Writing Standards',
        description:
          'Principles of clarity, conciseness, and accuracy in technical documents.',
        icon: AcademicCapIcon,
        iconName: 'technical writing standards'
      },
      {
        id: 'data-visualization',
        title: 'Data Visualization in Reports',
        description:
          'Effectively presenting data using charts, graphs, and tables.',
        icon: ChartBarIcon,
        iconName: 'data visualization charts reports'
      },
      {
        id: 'document-formatting',
        title: 'Document Formatting & Structure',
        description:
          'Organizing information logically with proper formatting for readability.',
        icon: DocumentCheckIcon,
        iconName: 'formatting document structure'
      }
    ]
  },
  {
    id: 'strategic-planning',
    title: 'Strategic Planning, Budgets, and Contracts',
    description:
      'Covers fiscal analysis, budget management, and contract administration in an IT context.',
    icon: ClipboardDocumentListIcon,
    iconName: 'planning budget contract finance strategy',
    subTopics: [
      {
        id: 'it-strategic-planning',
        title: 'IT Strategic Planning',
        description:
          'Aligning IT goals and projects with organizational objectives.',
        icon: BuildingLibraryIcon,
        iconName: 'strategy planning it'
      },
      {
        id: 'budget-management',
        title: 'Budget Management & Fiscal Analysis',
        description: 'Creating, managing, and analyzing IT budgets.',
        icon: ChartBarIcon,
        iconName: 'budget finance analysis'
      },
      {
        id: 'contract-administration',
        title: 'Contract Administration',
        description:
          'Overseeing the lifecycle of IT contracts and vendor agreements.',
        icon: DocumentTextIcon,
        iconName: 'contract vendor management'
      }
    ]
  },
  {
    id: 'supervision',
    title: 'Supervision',
    description:
      'Core principles of supervising technical teams, including motivation, delegation, and performance management.',
    icon: UsersIcon,
    iconName: 'management people team supervision',
    officialDescription:
      'These questions test for knowledge of the principles and practices employed in planning, organizing, and controlling the activities of a work unit toward predetermined objectives. The concepts covered, usually in a situational question format, include such topics as assigning and reviewing work; evaluating performance; maintaining work standards; motivating and developing subordinates; implementing procedural change; increasing efficiency; and dealing with problems of absenteeism, morale, and discipline.',
    subTopics: [
      {
        id: 'delegation-empowerment',
        title: 'Delegation & Empowerment',
        description: 'Effectively assigning tasks and empowering team members.',
        icon: CogIcon,
        iconName: 'delegation empowerment team'
      },
      {
        id: 'team-communication',
        title: 'Team Communication',
        description:
          'Fostering clear and effective communication within a technical team.',
        icon: UsersIcon,
        iconName: 'communication team soft skills'
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution',
        description: 'Managing and resolving disagreements within the team.',
        icon: XCircleIcon,
        iconName: 'conflict resolution team'
      },
      {
        id: 'change-management',
        title: 'Implementing Change',
        description:
          'Guiding a team through procedural or technological changes.',
        icon: RestartIcon,
        iconName: 'change management process'
      }
    ]
  },
  {
    id: 'system-analysis',
    title: 'System Analysis and Design',
    description:
      'Understand the lifecycle of IT systems, from requirements gathering to design and implementation.',
    icon: ComputerDesktopIcon,
    iconName: 'system analysis design technology computer',
    officialDescription:
      'These questions test for techniques and concepts of computer systems analysis and design. They cover such subjects as feasibility and applications studies, systems development tools and software, the systems life cycle, types of systems (e.g., client/server, Web-based), controls, and systems documentation, testing, and implementation.',
    subTopics: [
      {
        id: 'sdlc',
        title: 'Systems Development Life Cycle (SDLC)',
        description:
          'Understanding phases like planning, analysis, design, implementation, and maintenance.',
        icon: SitemapIcon,
        iconName: 'sdlc lifecycle development'
      },
      {
        id: 'requirements-gathering',
        title: 'Requirements Gathering',
        description:
          'Techniques for eliciting and documenting user and system requirements.',
        icon: DocumentTextIcon,
        iconName: 'requirements analysis gathering'
      },
      {
        id: 'system-modeling',
        title: 'System Modeling & Design',
        description:
          'Using tools to create models and design system architecture.',
        icon: CogIcon,
        iconName: 'system model design architecture'
      },
      {
        id: 'testing-implementation',
        title: 'System Testing & Implementation',
        description:
          'Strategies for testing, deployment, and post-implementation review.',
        icon: DocumentCheckIcon,
        iconName: 'testing deployment implementation'
      }
    ]
  },
  {
    id: 'admin-principles',
    title: 'Understanding and Applying Administrative Principles',
    description:
      'Applying fundamental administrative theories to real-world IT scenarios.',
    icon: BuildingLibraryIcon,
    iconName: 'principles administration theory structure',
    subTopics: [
      {
        id: 'org-structure',
        title: 'Organizational Structure & Design',
        description:
          'Understanding different organizational models and their impact.',
        icon: SitemapIcon,
        iconName: 'organization structure hierarchy'
      },
      {
        id: 'policy-procedure',
        title: 'Policy and Procedure Application',
        description:
          'Interpreting and applying official policies and procedures.',
        icon: DocumentTextIcon,
        iconName: 'policy procedure rules'
      },
      {
        id: 'public-administration',
        title: 'Principles of Public Administration',
        description:
          'Core concepts of administration within a government context.',
        icon: BuildingLibraryIcon,
        iconName: 'public administration government'
      }
    ]
  },
  {
    id: 'tabular-data',
    title: 'Understanding and Interpreting Tabular Data',
    description:
      'Skills for extracting insights and trends from spreadsheets, databases, and other tabular data formats.',
    icon: TableCellsIcon,
    iconName: 'data table spreadsheet database interpretation',
    officialDescription:
      'These questions test your ability to understand, analyze, and use the internal logic of data presented in tabular form. You may be asked to perform tasks such as completing tables, drawing conclusions from them, analyzing data trends or interrelationships, and revising or combining data sets. The concepts of rate, ratio, and proportion are tested. Mathematical operations are simple, and computational speed is not a major factor in the test. You should bring with you a hand-held battery- or solar-powered calculator for use on this test. You will not be permitted to use the calculator function of your cell phone.',
    subTopics: [
      {
        id: 'data-extraction',
        title: 'Data Extraction & Filtering',
        description:
          'Locating and isolating specific information within large datasets.',
        icon: SearchIcon,
        iconName: 'data extraction filter search'
      },
      {
        id: 'trend-analysis',
        title: 'Trend & Pattern Analysis',
        description:
          'Identifying trends, relationships, and anomalies in tabular data.',
        icon: ChartBarIcon,
        iconName: 'trend analysis pattern data'
      },
      {
        id: 'calculations',
        title: 'Rates, Ratios, and Proportions',
        description:
          'Performing calculations to derive meaningful metrics from data.',
        icon: CogIcon,
        iconName: 'calculations ratio rate proportion'
      }
    ]
  },
  {
    id: 'interacting-others',
    title: 'Working and Interacting with Others',
    description:
      'Essential soft skills for collaboration, communication, and stakeholder management in a technical environment.',
    icon: UsersIcon,
    iconName: 'collaboration communication team soft skills',
    subTopics: [
      {
        id: 'interpersonal-skills',
        title: 'Interpersonal Communication',
        description:
          'Effectively communicating with colleagues, stakeholders, and the public.',
        icon: UsersIcon,
        iconName: 'communication interpersonal skills'
      },
      {
        id: 'teamwork-collaboration',
        title: 'Teamwork and Collaboration',
        description:
          'Working effectively as part of a team to achieve common goals.',
        icon: UsersIcon,
        iconName: 'teamwork collaboration group'
      },
      {
        id: 'customer-service',
        title: 'Customer & Stakeholder Relations',
        description:
          'Providing excellent service to internal and external stakeholders.',
        icon: BriefcaseIcon,
        iconName: 'customer service stakeholder'
      }
    ]
  }
]

// --- geminiService.ts ---
const MODEL_NAME = 'gemini-2.5-flash'

const getAiClient = () => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('API Key not found. Please set it in the settings.')
  }
  return new GoogleGenAI({ apiKey })
}

const generateStudyGuide = async (
  topic: StudyTopic
): Promise<StudyGuideResponse> => {
  try {
    const ai = getAiClient()

    let basePrompt = `
      You are an expert in Information Technology and career development, tasked with creating a study guide.

      Generate a comprehensive study guide for an aspiring **New York State Information Technology Specialist 3 and 4** on the topic of: **"${topic.title}"**.
    `

    if (topic.officialDescription) {
      basePrompt += `
      
      The NYS examination board provides the following official description for this subject:
      _"${topic.officialDescription}"_

      Please ensure the study guide is strictly aligned with this official description.
      `
    }

    let detailedInstructions = `

      The guide must be detailed, well-structured, and easy to understand. Structure the output in Markdown format and include the following sections:

      - ## Core Concepts
        - Explain the fundamental principles and key terminology. Use bullet points for clarity.

      - ## Key Responsibilities & Skills
        - Detail what a specialist at this level in NYS is expected to do and know regarding this topic.

      - ## Best Practices & Methodologies
        - Provide actionable advice, standard procedures, and proven methodologies relevant to NYS government IT.

      - ## Practical Scenarios/Examples
        - Give at least two real-world examples or scenarios to illustrate the concepts in a practical NYS IT environment.

      - ## Potential Interview Questions
        - List 3-5 relevant interview questions. For each question, provide a brief explanation of what a strong answer should cover.

      Ensure the language is professional and tailored to someone preparing for a senior technical specialist role within New York State. Use bold text for emphasis on key terms.
    `

    if (topic.title === 'Logical Reasoning using Flowcharts') {
      detailedInstructions += `
        For the "Practical Scenarios/Examples" section, you MUST create flowchart diagrams for each example.
        Represent these diagrams using **Mermaid syntax** inside a markdown code block.
        **CRITICAL MERMAID RULES**:
        1. The graph definition (e.g., \`graph TD\`) MUST be on its own line.
        2. Use ONLY standard arrows \`-->\`.
        3. Enclose node text with special characters in double quotes (e.g., \`A["Node with > char"]\`).

        Example:
        \`\`\`mermaid
        graph TD
            A[Start] --> B{Is it a good idea?};
            B -->|Yes| C[Do it];
            B -->|No| D[Don't do it];
            C --> E[End];
            D --> E[End];
        \`\`\`
      `
    }

    const prompt = basePrompt + detailedInstructions

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    })

    const sources: Source[] =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk) => ({
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || 'Untitled Source'
        }))
        .filter((source) => source.uri) || []

    return {
      content: response.text,
      sources
    }
  } catch (error) {
    console.error('Error generating study guide:', error)
    if (error instanceof Error) {
      throw new Error(
        `An error occurred while generating the study guide: ${error.message}. Please check your API key and network connection.`
      )
    }
    throw new Error(
      'An unknown error occurred while generating the study guide.'
    )
  }
}

const generateQuiz = async (
  topic: StudyTopic,
  difficulty: Difficulty
): Promise<QuizQuestion[]> => {
  try {
    const ai = getAiClient()

    let difficultyInstruction = ''
    switch (difficulty) {
      case 'easy':
        difficultyInstruction =
          'The questions should be **easy**, focusing on foundational concepts and definitions.'
        break
      case 'medium':
        difficultyInstruction =
          'The questions should be of **medium** difficulty, focusing on applying concepts to practical situations.'
        break
      case 'hard':
        difficultyInstruction =
          'The questions should be **hard**, presenting complex, multi-step scenarios that require deep analysis and synthesis of information.'
        break
    }

    let prompt = `
      Create a multiple-choice quiz with 5 questions for a **New York State Information Technology Specialist 3 and 4** on the topic: **"${
        topic.title
      }"**.
      
      **Difficulty Level: ${difficulty.toUpperCase()}**. ${difficultyInstruction}
      
      ${
        topic.officialDescription
          ? `The questions must be strictly based on the following official examination subject description: "${topic.officialDescription}"`
          : ''
      }
      The questions should reflect scenarios and terminology relevant to a government IT environment.
      For each question, provide 4 distinct options.
      Indicate the correct answer and provide a brief, clear explanation for why it's correct.
    `

    if (topic.title === 'Logical Reasoning using Flowcharts') {
      prompt += `
        \n**IMPORTANT INSTRUCTIONS FOR FLOWCHARTS**:
        1. For each question, you MUST generate a flowchart diagram to be analyzed.
        2. The diagram must be represented using valid **Mermaid syntax** for a Top-Down graph (\`graph TD\`).
        3. **CRITICAL STRUCTURE**: The graph definition (e.g., \`graph TD\`) MUST be on its own line. All node and link definitions must start on new lines following it.
        4. Embed the Mermaid syntax inside the 'question' field of the JSON output, enclosed in a markdown code block (\`\`\`mermaid ... \`\`\`).
        5. **CRITICAL SYNTAX - NODES**: Ensure all node text containing special characters (like \`>\`, \`<\`, \`=\`, \`(\`, \`)\`, \`-\`) is enclosed in double quotes. For example: \`A["Is X > 5?"] --> B\`.
        6. **CRITICAL SYNTAX - LINKS**: Use ONLY the standard arrow \`-->\` for links. Do NOT use elongated arrows like \`------>\`. Always use quotes for link text: \`C -->|"Valid"| E\`.
        7. The text of the question should precede the flowchart and ask the user to interpret it.
        
        Here is a good example of a question with a valid flowchart, pay close attention to the structure:
        "A process checks for software compatibility. Given the flowchart below, what happens if OS_Version is "Windows 11" and Required_Version is "Windows 10"?
        \`\`\`mermaid
        graph TD
            A[Start] --> B{"Check OS Version"};
            B -->|"OS_Version >= Required_Version"| C[Proceed with Installation];
            B -->|"OS_Version < Required_Version"| D[Show Compatibility Error];
            C --> E[End];
            D --> E[End];
        \`\`\`"
      `
    }

    const quizSchema = {
      type: Type.OBJECT,
      properties: {
        quiz: {
          type: Type.ARRAY,
          description: 'A list of quiz questions.',
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description:
                  'The quiz question, which may include Mermaid syntax for flowcharts.'
              },
              options: {
                type: Type.ARRAY,
                description: 'An array of 4 possible answers.',
                items: { type: Type.STRING }
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description:
                  "The 0-based index of the correct answer in the 'options' array."
              },
              explanation: {
                type: Type.STRING,
                description: 'A brief explanation for the correct answer.'
              }
            },
            required: [
              'question',
              'options',
              'correctAnswerIndex',
              'explanation'
            ]
          }
        }
      },
      required: ['quiz']
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema
      }
    })

    const jsonResponse = JSON.parse(response.text)
    return jsonResponse.quiz || []
  } catch (error) {
    console.error('Error generating quiz:', error)
    throw new Error(
      'Failed to generate the quiz. The AI model may be temporarily unavailable.'
    )
  }
}

// =================================================================================
// COMPONENTS
// =================================================================================

declare global {
  interface Window {
    mermaid?: {
      render: (
        id: string,
        source: string
      ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>
      run: (config: { nodes: Element[] }) => Promise<void>
    }
  }
}

// --- ApiKeyModal.tsx ---
const ApiKeyModal: React.FC<{ onKeySaved: () => void }> = ({ onKeySaved }) => {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (apiKey.trim().length < 10) {
      setError('Please enter a valid API key.')
      return
    }
    setError('')
    saveApiKey(apiKey.trim())
    onKeySaved()
  }

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
            <CogIcon className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Enter Your API Key
            </h2>
            <p className="text-gray-400">
              A Google Gemini API key is required to use this app.
            </p>
          </div>
        </div>

        <p className="text-gray-300 mb-4 text-sm">
          Your API key is stored securely in your browser's local storage and is
          never shared. You can generate a free key from Google AI Studio.
        </p>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value)
            if (error) setError('')
          }}
          placeholder="Enter your Gemini API key here"
          className={`w-full bg-gray-900 text-gray-200 border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-600 focus:ring-purple-500 focus:border-transparent'
          }`}
          aria-label="Gemini API Key"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex justify-between items-center mt-6">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Get an API Key
          </a>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
            disabled={!apiKey.trim()}
          >
            Save and Continue
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// --- ImageModal.tsx ---
const ImageModal: React.FC<{ svgContent: string; onClose: () => void }> = ({
  svgContent,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const styledSvg = svgContent.replace(
    /<svg(.*?)>/,
    `<svg$1 style="max-width: none; background-color: #2d3748;" class="h-auto">`
  )

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl relative w-full max-w-5xl h-full max-h-[90vh] overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors z-10"
          aria-label="Close diagram viewer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div
          className="w-full h-full flex items-center justify-center min-w-[800px] min-h-[600px]"
          dangerouslySetInnerHTML={{ __html: styledSvg }}
        />
      </div>
    </div>
  )
}
;(() => {
  const style = document.createElement('style')
  style.textContent = `
  @keyframes fade-in-fast {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out forwards;
  }
`
  document.head.append(style)
})()

// --- MarkdownRenderer.tsx ---
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [renderedSvg, setRenderedSvg] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const processedCode = useMemo(() => {
    return code.trim().replace(/(graph\s+(?:TD|LR|TB|BT))\s+(.+)/, '$1\n$2')
  }, [code])

  useEffect(() => {
    const renderDiagram = async () => {
      if (!window.mermaid) {
        setError('Mermaid library not loaded.')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError('')
      try {
        const uniqueId = `mermaid-${id.replace(/:/g, '')}`
        const { svg, bindFunctions } = await window.mermaid.render(
          uniqueId,
          processedCode
        )
        setRenderedSvg(svg)

        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          if (bindFunctions) {
            bindFunctions(containerRef.current)
          }
        }
      } catch (e: any) {
        console.error('Mermaid render error:', e?.str || e?.message)
        setError(e?.str || e?.message || 'Failed to render diagram.')
      } finally {
        setIsLoading(false)
      }
    }
    renderDiagram()
  }, [processedCode, id, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <>
      <div className="relative group my-6 bg-[#1a202c] rounded-lg p-4 flex justify-center overflow-x-auto max-w-5xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center p-4 min-h-[150px] text-gray-400">
            <SpinnerIcon className="w-8 h-8" />
            <span className="ml-3">Rendering Diagram...</span>
          </div>
        )}
        {error && (
          <div className="p-4 text-red-300 bg-red-900/50 rounded-md w-full">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold">Diagram Rendering Error</p>
              <button
                onClick={handleRetry}
                className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RestartIcon className="mr-1.5 h-3 w-3" />
                Retry
              </button>
            </div>
            <p className="text-sm font-mono p-2 bg-black/20 rounded break-all">
              {error}
            </p>
            <p className="text-xs text-gray-400 mt-3">Raw Code:</p>
            <pre className="text-xs bg-gray-900 p-2 rounded mt-1 whitespace-pre-wrap">
              {processedCode}
            </pre>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
          style={{ display: isLoading || error ? 'none' : 'flex' }}
        />
        {!isLoading && !error && renderedSvg && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-zoom-in"
            role="button"
            aria-label="Zoom in on diagram"
          >
            <ZoomInIcon className="w-16 h-16 text-white" />
          </div>
        )}
      </div>
      {isModalOpen && renderedSvg && (
        <ImageModal
          svgContent={renderedSvg}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
const MarkdownPart: React.FC<{ markdown: string }> = ({ markdown }) => {
  const html = useMemo(() => processMarkdown(markdown), [markdown])
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parts = useMemo(() => {
    return content.split(/(```mermaid[\s\S]*?```)/g).map((part, index) => {
      if (part.startsWith('```mermaid')) {
        const mermaidCode = part.replace(/```mermaid|```/g, '').trim()
        return {
          type: 'mermaid' as const,
          value: mermaidCode,
          key: `part-${index}`
        }
      }
      return { type: 'markdown' as const, value: part, key: `part-${index}` }
    })
  }, [content])

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {parts.map((part) => {
        if (!part.value.trim()) return null
        if (part.type === 'mermaid') {
          return <MermaidDiagram key={part.key} code={part.value} />
        }
        return <MarkdownPart key={part.key} markdown={part.value} />
      })}
    </div>
  )
}
function processMarkdown(text: string): string {
  const lines = text.split('\n')
  let html = ''
  let listOpen = false

  lines.forEach((line) => {
    if (line.trim() === '') {
      if (listOpen) {
        html += '</ul>'
        listOpen = false
      }
      return
    }

    if (line.startsWith('## ')) {
      if (listOpen) {
        html += '</ul>'
        listOpen = false
      }
      html += `<h2 class="text-2xl font-bold mt-8 mb-4 border-b border-gray-600 pb-2">${line.substring(
        3
      )}</h2>`
    } else if (line.startsWith('### ')) {
      if (listOpen) {
        html += '</ul>'
        listOpen = false
      }
      html += `<h3 class="text-xl font-semibold mt-6 mb-3">${line.substring(
        4
      )}</h3>`
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!listOpen) {
        html += '<ul class="list-disc pl-8 my-4 space-y-2">'
        listOpen = true
      }
      html += `<li>${parseInlineFormatting(line.substring(2))}</li>`
    } else {
      if (listOpen) {
        html += '</ul>'
        listOpen = false
      }
      html += `<p class="my-4">${parseInlineFormatting(line)}</p>`
    }
  })

  if (listOpen) {
    html += '</ul>'
  }
  return html
}
function parseInlineFormatting(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

// --- Toast.tsx ---
const Toast: React.FC<{
  id: number
  message: string
  onDismiss: (id: number) => void
}> = ({ id, message, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsExiting(true)
      const removeTimer = setTimeout(() => {
        onDismiss(id)
      }, 500)
      return () => clearTimeout(removeTimer)
    }, 3000)

    return () => clearTimeout(dismissTimer)
  }, [id, onDismiss])

  return (
    <div
      className={`flex items-center bg-green-600 text-white text-sm font-semibold px-4 py-3 rounded-md shadow-lg transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{ transformOrigin: 'right center' }}
    >
      <CheckCircleIcon className="w-5 h-5 mr-3" />
      <p>{message}</p>
    </div>
  )
}

// --- ToastContainer.tsx ---
const ToastContainer: React.FC<{
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// --- ImportExportControls.tsx ---
const ImportExportControls: React.FC<{
  dataToExport: any
  exportFileName: string
  onImport: (importedData: any) => void
  importLabel: string
  addToast: (message: string) => void
}> = ({ dataToExport, exportFileName, onImport, importLabel, addToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    if (
      !dataToExport ||
      (Array.isArray(dataToExport) && dataToExport.length === 0)
    ) {
      addToast('There is no data to export.')
      return
    }
    try {
      const jsonString = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = exportFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addToast('Data exported successfully!')
    } catch (error) {
      console.error('Failed to export data', error)
      addToast('Error: Could not export data.')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result
        if (typeof text !== 'string') {
          throw new Error('File content is not readable.')
        }
        const jsonData = JSON.parse(text)
        onImport(jsonData)
      } catch (error) {
        console.error('Failed to import file', error)
        addToast('Error: Invalid JSON file or file is corrupted.')
      }
    }
    reader.onerror = () => {
      addToast('Error: Failed to read the file.')
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
      />
      <button
        onClick={handleImportClick}
        className="flex items-center px-3 py-2 bg-blue-800/60 text-blue-300 text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-800/90 transition-colors duration-300"
        aria-label={importLabel}
      >
        <ArrowDownOnSquareIcon className="mr-2 h-4 w-4" />
        Import
      </button>
      <button
        onClick={handleExport}
        className="flex items-center px-3 py-2 bg-gray-600/60 text-gray-300 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-600/90 transition-colors duration-300"
        aria-label="Export data"
      >
        <ArrowUpOnSquareIcon className="mr-2 h-4 w-4" />
        Export
      </button>
    </div>
  )
}

// --- HistoryView.tsx ---
const HISTORY_KEY = 'nysit-quiz-history'
const HistoryView: React.FC<{ addToast: (message: string) => void }> = ({
  addToast
}) => {
  const [history, setHistory] = useState<QuizResult[]>([])

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY)
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e)
    }
  }, [])

  const topicIconMap = useMemo(() => {
    return new Map(
      TOPICS.flatMap((topic) =>
        topic.subTopics
          ? [
              { id: topic.id, icon: topic.icon },
              ...topic.subTopics.map((sub) => ({ id: sub.id, icon: sub.icon }))
            ]
          : [{ id: topic.id, icon: topic.icon }]
      ).map((item) => [item.id, item.icon])
    )
  }, [])

  const handleClearHistory = () => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete your quiz history?'
      )
    ) {
      try {
        localStorage.removeItem(HISTORY_KEY)
        setHistory([])
      } catch (e) {
        console.error('Failed to clear history from localStorage', e)
        alert('There was an error clearing your history.')
      }
    }
  }

  const handleImportHistory = (importedData: any) => {
    if (!Array.isArray(importedData)) {
      addToast('Error: Imported file is not a valid history format.')
      return
    }

    const newHistory = importedData.filter(
      (item) =>
        typeof item === 'object' &&
        item.id &&
        item.topicId &&
        typeof item.score === 'number'
    )

    if (newHistory.length === 0 && importedData.length > 0) {
      addToast('Warning: No valid quiz results found in the imported file.')
      return
    }

    setHistory((prevHistory) => {
      const combined = [...newHistory, ...prevHistory]
      const uniqueHistoryMap = new Map<string, QuizResult>()
      combined.forEach((item) => {
        if (!uniqueHistoryMap.has(item.id)) {
          uniqueHistoryMap.set(item.id, item)
        }
      })

      const updatedHistory = Array.from(uniqueHistoryMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100)

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
        addToast(`Successfully imported ${newHistory.length} quiz results.`)
      } catch (e) {
        console.error('Failed to save imported history', e)
        addToast('Error: Could not save the imported history.')
      }

      return updatedHistory
    })
  }

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'hard':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Quiz History</h2>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <ImportExportControls
              dataToExport={history}
              exportFileName="quiz_history.json"
              onImport={handleImportHistory}
              importLabel="Import quiz history"
              addToast={addToast}
            />
            <button
              onClick={handleClearHistory}
              className="flex items-center px-4 py-2 bg-red-800/50 text-red-300 text-sm font-semibold rounded-lg shadow-md hover:bg-red-800/80 transition-colors duration-300"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Clear History
            </button>
          </div>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((result) => {
            const Icon = topicIconMap.get(result.topicId)
            const scorePercentage = (result.score / result.totalQuestions) * 100
            return (
              <div
                key={result.id}
                className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4"
              >
                {Icon && (
                  <Icon className="w-8 h-8 text-purple-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-white">{result.topicTitle}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${getDifficultyClass(
                    result.difficulty
                  )}`}
                >
                  {result.difficulty}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    {result.score} / {result.totalQuestions}
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color:
                        scorePercentage > 75
                          ? '#4ade80'
                          : scorePercentage > 50
                          ? '#facc15'
                          : '#f87171'
                    }}
                  >
                    {scorePercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg">
          <HistoryIcon className="w-12 h-12 mx-auto text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-300 mt-4">
            No History Yet
          </h3>
          <p className="text-gray-400 mt-2">
            Your completed quiz results will appear here. You can also import a
            history file.
          </p>
          <div className="mt-6 flex justify-center">
            <ImportExportControls
              dataToExport={[]}
              exportFileName="quiz_history.json"
              onImport={handleImportHistory}
              importLabel="Import quiz history"
              addToast={addToast}
            />
          </div>
        </div>
      )}
    </div>
  )
}
;(() => {
  const style = document.createElement('style')
  style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
`
  document.head.append(style)
})()

// --- SavedQuestionsView.tsx ---
const SAVED_QUESTIONS_KEY = 'nysit-saved-questions'
const SavedQuestionsView: React.FC<{ addToast: (message: string) => void }> = ({
  addToast
}) => {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_QUESTIONS_KEY)
      if (stored) {
        setSavedQuestions(Object.values(JSON.parse(stored)))
      }
    } catch (e) {
      console.error('Failed to load saved questions from localStorage', e)
    }
  }, [])

  const topicIconMap = useMemo(() => {
    return new Map(
      TOPICS.flatMap((topic) =>
        topic.subTopics
          ? [
              { id: topic.id, icon: topic.icon },
              ...topic.subTopics.map((sub) => ({ id: sub.id, icon: sub.icon }))
            ]
          : [{ id: topic.id, icon: topic.icon }]
      ).map((item) => [item.id, item.icon])
    )
  }, [])

  const handleRemoveQuestion = (questionId: string) => {
    try {
      const stored = localStorage.getItem(SAVED_QUESTIONS_KEY)
      if (stored) {
        const questionsObj = JSON.parse(stored)
        delete questionsObj[questionId]
        localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(questionsObj))
        setSavedQuestions(Object.values(questionsObj))
        addToast('Question removed.')
      }
    } catch (e) {
      console.error('Failed to remove question', e)
    }
  }

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to remove all saved questions? This cannot be undone.'
      )
    ) {
      try {
        localStorage.removeItem(SAVED_QUESTIONS_KEY)
        setSavedQuestions([])
        addToast('All saved questions have been removed.')
      } catch (e) {
        console.error('Failed to clear saved questions', e)
      }
    }
  }

  const handleImportQuestions = (importedData: any) => {
    if (!Array.isArray(importedData)) {
      addToast('Error: Imported file is not a valid saved questions format.')
      return
    }

    const newQuestions = importedData.filter(
      (item) =>
        typeof item === 'object' &&
        item.id &&
        item.question &&
        Array.isArray(item.options)
    )

    if (newQuestions.length === 0 && importedData.length > 0) {
      addToast('Warning: No valid questions found in the imported file.')
      return
    }

    try {
      const stored = localStorage.getItem(SAVED_QUESTIONS_KEY)
      const questionsObj: Record<string, SavedQuestion> = stored
        ? JSON.parse(stored)
        : {}

      let importedCount = 0
      newQuestions.forEach((q) => {
        if (!questionsObj[q.id]) {
          questionsObj[q.id] = q
          importedCount++
        }
      })

      localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(questionsObj))
      setSavedQuestions(Object.values(questionsObj))
      addToast(`Successfully imported ${importedCount} new questions.`)
    } catch (e) {
      console.error('Failed to save imported questions', e)
      addToast('Error: Could not save the imported questions.')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Saved Questions</h2>
        {savedQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <ImportExportControls
              dataToExport={savedQuestions}
              exportFileName="saved_questions.json"
              onImport={handleImportQuestions}
              importLabel="Import saved questions"
              addToast={addToast}
            />
            <button
              onClick={handleClearAll}
              className="flex items-center px-4 py-2 bg-red-800/50 text-red-300 text-sm font-semibold rounded-lg shadow-md hover:bg-red-800/80 transition-colors duration-300"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {savedQuestions.length > 0 ? (
        <div className="space-y-6">
          {savedQuestions.map((q) => {
            const Icon = topicIconMap.get(q.topicId)
            return (
              <div key={q.id} className="bg-gray-800/50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {Icon && (
                      <Icon className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0" />
                    )}
                    <p className="font-semibold text-gray-300">
                      {q.topicTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    aria-label="Remove question"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <MarkdownRenderer content={q.question} />
                </div>

                <div className="space-y-2">
                  {q.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md text-sm ${
                        index === q.correctAnswerIndex
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      <strong>{String.fromCharCode(65 + index)}.</strong>{' '}
                      {option}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="font-bold text-white mb-1">Explanation</h4>
                  <p className="text-gray-300 text-sm">{q.explanation}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg">
          <BookmarkSquareIcon className="w-12 h-12 mx-auto text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-300 mt-4">
            No Saved Questions
          </h3>
          <p className="text-gray-400 mt-2">
            You can save questions during a quiz to review them here later. You
            can also import questions.
          </p>
          <div className="mt-6 flex justify-center">
            <ImportExportControls
              dataToExport={[]}
              exportFileName="saved_questions.json"
              onImport={handleImportQuestions}
              importLabel="Import saved questions"
              addToast={addToast}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// --- Sidebar.tsx ---
const Sidebar: React.FC<{
  currentView: string
  onNav: (view: 'topics' | 'history' | 'saved-questions') => void
  onBack: () => void
  showBack: boolean
  onChangeApiKey: () => void
  children?: React.ReactNode
}> = ({ currentView, onNav, onBack, showBack, onChangeApiKey, children }) => {
  const NavItem: React.FC<{
    label: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
    onClick: () => void
    isActive: boolean
  }> = ({ label, icon: Icon, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6 mr-4" />
      <span className="font-semibold">{label}</span>
    </button>
  )

  return (
    <aside className="w-80 bg-gray-800/50 p-6 flex-shrink-0 flex flex-col h-screen overflow-y-auto">
      <div className="flex items-center mb-8">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors mr-3"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-4" />
        )}
        <h1 className="text-xl font-bold text-white tracking-tight">
          NYS IT Prep
        </h1>
      </div>

      <nav className="space-y-3">
        <NavItem
          label="All Topics"
          icon={HomeIcon}
          onClick={() => onNav('topics')}
          isActive={currentView === 'topics'}
        />
        <NavItem
          label="Quiz History"
          icon={HistoryIcon}
          onClick={() => onNav('history')}
          isActive={currentView === 'history'}
        />
        <NavItem
          label="Saved Questions"
          icon={BookmarkSquareIcon}
          onClick={() => onNav('saved-questions')}
          isActive={currentView === 'saved-questions'}
        />
      </nav>

      {children && (
        <div className="mt-8 border-t border-gray-700 pt-6">{children}</div>
      )}

      <div className="mt-auto pt-6 border-t border-gray-700 space-y-3">
        <NavItem
          label="Change API Key"
          icon={CogIcon}
          onClick={onChangeApiKey}
          isActive={false}
        />
      </div>
    </aside>
  )
}

// --- TopicCard.tsx ---
const TopicCard: React.FC<{
  topic: StudyTopic
  onSelectTopic: () => void
  mode: 'study' | 'quiz'
  isBookmarked: boolean
  onToggleBookmark: (topicId: string) => void
}> = ({ topic, onSelectTopic, mode, isBookmarked, onToggleBookmark }) => {
  const isQuizMode = mode === 'quiz'

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleBookmark(topic.id)
  }

  return (
    <div
      onClick={onSelectTopic}
      className={`relative bg-gray-800 rounded-xl p-6 cursor-pointer border transition-all duration-300 transform hover:-translate-y-1 group ${
        isQuizMode
          ? 'border-transparent hover:border-purple-500 hover:bg-gray-700/50'
          : 'border-transparent hover:border-blue-500 hover:bg-gray-700/50'
      }`}
    >
      <button
        onClick={handleBookmarkClick}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        className="absolute top-3 right-3 z-10 p-2 rounded-full text-gray-500 hover:bg-gray-900/50 transition-all duration-200 active:scale-125"
      >
        {isBookmarked ? (
          <BookmarkSolidIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <BookmarkIcon className="w-6 h-6 group-hover:text-yellow-300" />
        )}
      </button>

      {topic.icon && (
        <topic.icon
          className={`w-10 h-10 mb-4 transition-colors duration-300 ${
            isQuizMode ? 'text-purple-400' : 'text-blue-400'
          }`}
        />
      )}

      <h3 className="text-lg font-bold text-white mb-2">{topic.title}</h3>
      <p className="text-gray-400 text-sm">{topic.description}</p>
    </div>
  )
}

// --- StudyTopicView.tsx ---
const StudyTopicView: React.FC<{ topic: StudyTopic }> = ({ topic }) => {
  const [studyNotes, setStudyNotes] = useState<string>('')
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isCached, setIsCached] = useState<boolean>(false)

  const cacheKey = `studyGuideCache_${topic.id}`

  const handleGenerate = useCallback(
    async (forceRegenerate = false) => {
      setIsLoading(true)
      setError('')

      if (!forceRegenerate) {
        setStudyNotes('')
        setSources([])
      }

      try {
        const notesResponse = await generateStudyGuide(topic)
        setStudyNotes(notesResponse.content)
        setSources(notesResponse.sources)

        const cacheEntry: StudyGuideCache = {
          ...notesResponse,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry))
        setIsCached(true)
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.')
      } finally {
        setIsLoading(false)
      }
    },
    [topic, cacheKey]
  )

  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        const parsedData: StudyGuideCache = JSON.parse(cachedData)
        setStudyNotes(parsedData.content)
        setSources(parsedData.sources)
        setIsCached(true)
      } else {
        setIsCached(false)
        setStudyNotes('')
        setSources([])
      }
    } catch (e) {
      console.error('Failed to read from cache', e)
      setIsCached(false)
    }

    setError('')
    setIsLoading(false)
  }, [topic.id, cacheKey])

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{topic.title}</h2>
          <p className="text-gray-400 mb-6">{topic.description}</p>
        </div>
        {isCached && !isLoading && (
          <button
            onClick={() => handleGenerate(true)}
            className="flex items-center justify-center px-4 py-2 mb-4 sm:mb-0 sm:ml-4 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            disabled={isLoading}
          >
            <RestartIcon className="mr-2 h-4 w-4" />
            Regenerate
          </button>
        )}
      </div>

      {!studyNotes && !isLoading && (
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-800 disabled:cursor-not-allowed"
        >
          Generate Study Guide
        </button>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg mt-6">
          <SpinnerIcon className="h-10 w-10 text-blue-400" />
          <p className="mt-4 text-lg font-semibold text-gray-300">
            Generating your study guide...
          </p>
          <p className="text-gray-400">This may take a moment.</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center space-x-3">
          <ErrorIcon />
          <div>
            <h4 className="font-bold">Generation Failed</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {studyNotes && (
        <div className="mt-6">
          <MarkdownRenderer content={studyNotes} />
          {sources.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Sources</h3>
              <ul className="space-y-3 list-disc pl-5">
                {sources.map((source, index) => (
                  <li
                    key={index}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {source.title || new URL(source.uri).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- ModeSwitcher.tsx ---
const ModeSwitcher: React.FC<{
  mode: 'study' | 'quiz'
  onModeChange: (mode: 'study' | 'quiz') => void
}> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-full mt-4 sm:mt-0">
      <button
        onClick={() => onModeChange('study')}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
          mode === 'study'
            ? 'bg-blue-600 text-white shadow'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        Study
      </button>
      <button
        onClick={() => onModeChange('quiz')}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
          mode === 'quiz'
            ? 'bg-purple-600 text-white shadow'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        Quiz
      </button>
    </div>
  )
}

// --- SearchBar.tsx ---
const SearchBar: React.FC<{
  query: string
  onQueryChange: (query: string) => void
}> = ({ query, onQueryChange }) => {
  return (
    <div className="relative mb-4">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="text-gray-500" />
      </span>
      <input
        type="text"
        placeholder="Filter topics..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-label="Filter topics"
      />
    </div>
  )
}

// --- FilterControl.tsx ---
const FilterControl: React.FC<{
  filterMode: 'all' | 'bookmarked'
  onFilterChange: (mode: 'all' | 'bookmarked') => void
}> = ({ filterMode, onFilterChange }) => {
  return (
    <div className="flex bg-gray-900/50 p-1 rounded-lg mb-4">
      <button
        onClick={() => onFilterChange('all')}
        className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
          filterMode === 'all'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:bg-gray-700/50'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('bookmarked')}
        className={`flex-1 flex items-center justify-center space-x-1.5 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
          filterMode === 'bookmarked'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:bg-gray-700/50'
        }`}
      >
        <BookmarkIcon className="w-4 h-4" />
        <span>Bookmarked</span>
      </button>
    </div>
  )
}

// --- QuizView.tsx ---
const TimerDisplay: React.FC<{ timeLeft: number; duration: number }> = ({
  timeLeft,
  duration
}) => {
  const percentage = duration > 0 ? (timeLeft / duration) * 100 : 0
  const circumference = 2 * Math.PI * 20 // radius is 20
  const offset = circumference - (percentage / 100) * circumference

  let color = 'stroke-green-400'
  if (percentage < 50) color = 'stroke-yellow-400'
  if (percentage < 25) color = 'stroke-red-500'

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 50 50">
        <circle
          className="text-gray-600"
          strokeWidth="5"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="25"
          cy="25"
        />
        <circle
          className={`transition-stroke-dashoffset duration-1000 linear ${color}`}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="25"
          cy="25"
          transform="rotate(-90 25 25)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
        {timeLeft}
      </div>
    </div>
  )
}
const QuizView: React.FC<{
  topic: StudyTopic
  addToast: (message: string) => void
}> = ({ topic, addToast }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerState[]>([])
  const [isFinished, setIsFinished] = useState(false)

  const [selectedTimer, setSelectedTimer] = useState<number>(0)
  const [timerDuration, setTimerDuration] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)

  const useSavedQuestions = () => {
    const [savedQuestions, setSavedQuestions] = useState<
      Record<string, SavedQuestion>
    >(() => {
      try {
        const stored = localStorage.getItem(SAVED_QUESTIONS_KEY)
        return stored ? JSON.parse(stored) : {}
      } catch (e) {
        console.error('Failed to load saved questions', e)
        return {}
      }
    })

    const saveQuestion = useCallback((question: SavedQuestion) => {
      setSavedQuestions((prev) => {
        const newSaved = { ...prev, [question.id]: question }
        localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(newSaved))
        return newSaved
      })
    }, [])

    const unsaveQuestion = useCallback((questionId: string) => {
      setSavedQuestions((prev) => {
        const newSaved = { ...prev }
        delete newSaved[questionId]
        localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(newSaved))
        return newSaved
      })
    }, [])

    const isQuestionSaved = useCallback(
      (questionId: string) => {
        return !!savedQuestions[questionId]
      },
      [savedQuestions]
    )

    return { saveQuestion, unsaveQuestion, isQuestionSaved }
  }

  const { saveQuestion, unsaveQuestion, isQuestionSaved } = useSavedQuestions()

  const handleTimeUp = useCallback(() => {
    setAnswers((prevAnswers) => {
      if (prevAnswers[currentQuestionIndex]?.selectedOption !== null) {
        return prevAnswers
      }
      const newAnswers = [...prevAnswers]
      newAnswers[currentQuestionIndex] = {
        isCorrect: false,
        selectedOption: -1
      }
      return newAnswers
    })
  }, [currentQuestionIndex])

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (
      isFinished ||
      !timerDuration ||
      answers[currentQuestionIndex]?.selectedOption !== null
    ) {
      return
    }

    setTimeLeft(timerDuration)

    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) {
          clearInterval(timerIntervalRef.current!)
          return null
        }
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [currentQuestionIndex, timerDuration, isFinished, answers, handleTimeUp])

  const handleStartQuiz = useCallback(
    async (selectedDifficulty: Difficulty, timer: number) => {
      setDifficulty(selectedDifficulty)
      setTimerDuration(timer > 0 ? timer : null)
      setIsLoading(true)
      setError('')
      setQuestions([])
      setAnswers([])
      setCurrentQuestionIndex(0)
      setIsFinished(false)

      try {
        const quizQuestions = await generateQuiz(topic, selectedDifficulty)
        if (quizQuestions.length === 0) {
          throw new Error(
            'The AI model returned no questions. Please try again.'
          )
        }
        setQuestions(quizQuestions)
        setAnswers(
          new Array(quizQuestions.length).fill({
            isCorrect: null,
            selectedOption: null
          })
        )
      } catch (err: any) {
        setError(
          err.message ||
            'An unexpected error occurred while generating the quiz.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [topic]
  )

  const handleAnswerSelect = (optionIndex: number) => {
    if (answers[currentQuestionIndex]?.selectedOption !== null) return

    const isCorrect =
      questions[currentQuestionIndex].correctAnswerIndex === optionIndex
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = {
      isCorrect,
      selectedOption: optionIndex
    }
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      finishQuiz()
    }
  }

  const handleToggleSaveQuestion = () => {
    const question = questions[currentQuestionIndex]
    const questionId = `${
      topic.id
    }-${currentQuestionIndex}-${question.question.slice(0, 20)}`
    if (isQuestionSaved(questionId)) {
      unsaveQuestion(questionId)
      addToast('Question removed from saved items.')
    } else {
      saveQuestion({
        ...question,
        id: questionId,
        topicId: topic.id,
        topicTitle: topic.title
      })
      addToast('Question saved!')
    }
  }

  const score = useMemo(
    () => answers.filter((a) => a.isCorrect).length,
    [answers]
  )

  const finishQuiz = () => {
    setIsFinished(true)
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY)
      const history: QuizResult[] = storedHistory
        ? JSON.parse(storedHistory)
        : []
      const newResult: QuizResult = {
        id: new Date().toISOString(),
        topicId: topic.id,
        topicTitle: topic.title,
        difficulty: difficulty!,
        score: score,
        totalQuestions: questions.length,
        timestamp: Date.now()
      }
      history.unshift(newResult)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
    } catch (e) {
      console.error('Failed to save quiz history', e)
    }
  }

  if (!difficulty) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 animate-fade-in text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Quiz: {topic.title}
        </h2>
        <p className="text-gray-400 mb-8">
          Choose your difficulty level to begin.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleStartQuiz(d, selectedTimer)}
              className={`px-8 py-4 text-lg font-bold rounded-lg transition-all transform hover:-translate-y-1 duration-300 shadow-lg capitalize disabled:opacity-50 ${
                d === 'easy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : d === 'medium'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-red-600 hover:bg-red-600'
              }`}
              disabled={isLoading}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-10 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Timer per Question (Optional)
          </h3>
          <div className="flex justify-center gap-3 bg-gray-900/50 p-2 rounded-full">
            {[0, 30, 60, 90].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTimer(time)}
                className={`w-full px-4 py-2 rounded-full font-semibold transition-colors text-sm ${
                  selectedTimer === time
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {time === 0 ? 'None' : `${time}s`}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg mt-6">
        <SpinnerIcon className="h-10 w-10 text-purple-400" />
        <p className="mt-4 text-lg font-semibold text-gray-300">
          Generating your quiz...
        </p>
        <p className="text-gray-400">This may take a moment.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex flex-col items-center space-y-4">
        <ErrorIcon className="w-8 h-8" />
        <h4 className="font-bold">Quiz Generation Failed</h4>
        <p className="text-center">{error}</p>
        <button
          onClick={() => setDifficulty(null)}
          className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700"
        >
          <RestartIcon className="mr-2 h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  if (isFinished) {
    const scorePercentage = (score / questions.length) * 100
    const scoreColor =
      scorePercentage >= 80
        ? '#4ade80'
        : scorePercentage >= 50
        ? '#facc15'
        : '#f87171'
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 animate-fade-in text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
        <p className="text-lg text-gray-400 mb-6">
          You scored {score} out of {questions.length}.
        </p>
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center text-4xl font-bold"
          style={{
            background: `conic-gradient(${scoreColor} ${scorePercentage}%, #374151 0)`
          }}
        >
          <div
            className="w-40 h-40 bg-gray-800 rounded-full flex items-center justify-center"
            style={{ color: scoreColor }}
          >
            <span>{scorePercentage.toFixed(0)}%</span>
          </div>
        </div>
        <button
          onClick={() => setDifficulty(null)}
          className="mt-8 flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700"
        >
          Take Another Quiz
        </button>
      </div>
    )
  }

  if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const currentAnswer = answers[currentQuestionIndex]
    const questionId = `${
      topic.id
    }-${currentQuestionIndex}-${currentQuestion.question.slice(0, 20)}`
    const isSaved = isQuestionSaved(questionId)

    return (
      <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-semibold text-purple-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <div className="mt-4">
              <MarkdownRenderer content={currentQuestion.question} />
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0 ml-4 space-y-4">
            <button
              onClick={handleToggleSaveQuestion}
              aria-label={isSaved ? 'Unsave question' : 'Save question'}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
            >
              {isSaved ? (
                <BookmarkSolidIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <BookmarkIcon className="w-6 h-6" />
              )}
            </button>
            {timerDuration && timeLeft !== null && (
              <TimerDisplay timeLeft={timeLeft} duration={timerDuration} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer?.selectedOption === index
            const isCorrect = currentQuestion.correctAnswerIndex === index
            let buttonClass = 'bg-gray-700 hover:bg-gray-600'
            if (currentAnswer?.selectedOption !== null) {
              if (isCorrect) buttonClass = 'bg-green-700 border-green-500'
              else if (isSelected && !isCorrect)
                buttonClass = 'bg-red-700 border-red-500'
              else buttonClass = 'bg-gray-700 opacity-60'
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={currentAnswer?.selectedOption !== null}
                className={`text-left p-4 rounded-lg border-2 border-transparent transition-all duration-300 w-full disabled:cursor-not-allowed ${buttonClass}`}
              >
                <span className="font-semibold text-white">{option}</span>
              </button>
            )
          })}
        </div>

        {currentAnswer?.selectedOption !== null && (
          <div className="mt-6 p-4 rounded-lg bg-gray-900/70 animate-fade-in">
            <div className="flex items-center mb-2">
              {currentAnswer.selectedOption === -1 ? (
                <>
                  <ClockIcon className="text-yellow-400 mr-2 w-6 h-6" />
                  <h4 className="font-bold text-lg text-yellow-300">
                    Time's Up!
                  </h4>
                </>
              ) : currentAnswer.isCorrect ? (
                <>
                  <CheckCircleIcon className="text-green-400 mr-2 w-6 h-6" />
                  <h4 className="font-bold text-lg text-green-300">Correct!</h4>
                </>
              ) : (
                <>
                  <XCircleIcon className="text-red-400 mr-2 w-6 h-6" />
                  <h4 className="font-bold text-lg text-red-300">Incorrect</h4>
                </>
              )}
            </div>
            <p className="text-gray-300">{currentQuestion.explanation}</p>
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700"
            >
              {currentQuestionIndex < questions.length - 1
                ? 'Next Question'
                : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
;(() => {
  const style = document.createElement('style')
  style.textContent = `
  .transition-stroke-dashoffset {
    transition: stroke-dashoffset 1s linear;
  }
`
  document.head.append(style)
})()

// =================================================================================
// MAIN APP COMPONENT
// =================================================================================

type View = 'topics' | 'study' | 'quiz' | 'history' | 'saved-questions'

const BOOKMARKS_KEY = 'nysit-bookmarked-topics'

const useBookmarks = () => {
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY)
      return storedBookmarks ? JSON.parse(storedBookmarks) : []
    } catch (e) {
      console.error('Failed to load bookmarks from localStorage', e)
      return []
    }
  })

  const toggleBookmark = useCallback((topicId: string) => {
    setBookmarkedTopics((prev) => {
      const newBookmarks = prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]

      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks))
      } catch (e) {
        console.error('Failed to save bookmarks to localStorage', e)
      }
      return newBookmarks
    })
  }, [])

  const isTopicBookmarked = useCallback(
    (topicId: string) => {
      return bookmarkedTopics.includes(topicId)
    },
    [bookmarkedTopics]
  )

  return { bookmarkedTopics, toggleBookmark, isTopicBookmarked }
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('topics')
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null)
  const [path, setPath] = useState<StudyTopic[]>([])
  const [mode, setMode] = useState<'study' | 'quiz'>('study')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked'>('all')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isApiKeySet, setIsApiKeySet] = useState(false)

  const { bookmarkedTopics, toggleBookmark, isTopicBookmarked } = useBookmarks()

  useEffect(() => {
    setIsApiKeySet(!!getApiKey())
  }, [])

  const handleApiKeySaved = () => {
    setIsApiKeySet(true)
  }

  const handleChangeApiKey = () => {
    clearApiKey()
    setIsApiKeySet(false)
  }

  const handleSelectTopic = (topic: StudyTopic) => {
    if (topic.subTopics && topic.subTopics.length > 0) {
      setPath((prev) => [...prev, topic])
      setSearchQuery('')
    } else {
      setSelectedTopic(topic)
      setCurrentView(mode === 'study' ? 'study' : 'quiz')
    }
  }

  const handleBack = () => {
    if (selectedTopic) {
      setCurrentView('topics')
      setSelectedTopic(null)
    } else if (path.length > 0) {
      setPath((prev) => prev.slice(0, -1))
    }
  }

  const handleNav = (view: View) => {
    setCurrentView(view)
    setSelectedTopic(null)
    setPath([])
  }

  const handleModeChange = (newMode: 'study' | 'quiz') => {
    setMode(newMode)
    if (selectedTopic) {
      setCurrentView(newMode === 'study' ? 'study' : 'quiz')
    }
  }

  const addToast = (message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
  }

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const currentTopicLevel = useMemo(() => {
    if (path.length === 0) return TOPICS
    const lastTopic = path[path.length - 1]
    return lastTopic.subTopics || []
  }, [path])

  const filteredTopics = useMemo(
    () =>
      currentTopicLevel.filter((topic) => {
        const matchesSearch =
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.iconName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter =
          filterMode === 'all' || bookmarkedTopics.includes(topic.id)
        return matchesSearch && matchesFilter
      }),
    [searchQuery, filterMode, bookmarkedTopics, currentTopicLevel]
  )

  const renderContent = () => {
    switch (currentView) {
      case 'study':
        return selectedTopic && <StudyTopicView topic={selectedTopic} />
      case 'quiz':
        return (
          selectedTopic && (
            <QuizView topic={selectedTopic} addToast={addToast} />
          )
        )
      case 'history':
        return <HistoryView addToast={addToast} />
      case 'saved-questions':
        return <SavedQuestionsView addToast={addToast} />
      case 'topics':
      default:
        const currentCategory = path.length > 0 ? path[path.length - 1] : null
        return (
          <div className="animate-fade-in">
            {path.length > 0 && (
              <nav className="mb-4 text-sm text-gray-400 flex items-center flex-wrap">
                <button
                  onClick={() => setPath([])}
                  className="hover:text-white transition-colors"
                >
                  All Topics
                </button>
                {path.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <span className="mx-2">/</span>
                    {i < path.length - 1 ? (
                      <button
                        onClick={() => setPath(path.slice(0, i + 1))}
                        className="hover:text-white transition-colors"
                      >
                        {p.title}
                      </button>
                    ) : (
                      <span className="text-white font-semibold">
                        {p.title}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {currentCategory
                    ? currentCategory.title
                    : 'NYS IT Specialist Prep'}
                </h1>
                <p className="text-gray-400 mt-1 max-w-2xl">
                  {currentCategory
                    ? currentCategory.description
                    : 'Select a topic to start studying or take a quiz.'}
                </p>
              </div>
              <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onSelectTopic={() => handleSelectTopic(topic)}
                  mode={mode}
                  isBookmarked={isTopicBookmarked(topic.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
            {filteredTopics.length === 0 && (
              <div className="text-center py-16 bg-gray-800/50 rounded-lg col-span-full">
                <h3 className="text-xl font-semibold text-gray-300">
                  No Topics Found
                </h3>
                <p className="text-gray-400 mt-2">
                  Try adjusting your search or filter.
                </p>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {!isApiKeySet && <ApiKeyModal onKeySaved={handleApiKeySaved} />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div
        className={`flex ${!isApiKeySet ? 'blur-sm pointer-events-none' : ''}`}
      >
        <Sidebar
          currentView={currentView}
          onNav={handleNav}
          onBack={handleBack}
          showBack={!!selectedTopic || path.length > 0}
          onChangeApiKey={handleChangeApiKey}
        >
          {currentView === 'topics' && (
            <>
              <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
              <FilterControl
                filterMode={filterMode}
                onFilterChange={setFilterMode}
              />
            </>
          )}
        </Sidebar>

        <main className="flex-1 p-8 overflow-y-auto h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// =================================================================================
// RENDER THE APP
// =================================================================================

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Could not find root element to mount to')
}

const root = ReactDOM.createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
