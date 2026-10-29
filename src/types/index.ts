export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory = 'work' | 'study' | 'health' | 'personal' | 'finance' | 'general';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  estimatedDuration: number; // minutes
  category: TaskCategory;
  goalId?: string | null;
  timeSlot?: string | null; // e.g. "09:00 - 10:00"
  completedAt?: string | null;
  createdAt: string;
  isSample?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetDate: string; // YYYY-MM-DD
  progress: number; // 0 - 100
  calculationType: 'milestone' | 'manual';
  milestones: Milestone[];
  createdAt: string;
  isSample?: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  targetDaysPerWeek: number; // 1 to 7
  category: string;
  color: string;
  completions: string[]; // ['YYYY-MM-DD', ...]
  createdAt: string;
  isSample?: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string | null;
  taskTitle?: string | null;
  durationMinutes: number;
  completedAt: string; // ISO string
  mode: 'work' | 'short_break' | 'long_break';
}

export interface UserSettings {
  userName: string;
  theme: 'dark' | 'light';
  language: 'fa' | 'en';
  pomodoroWorkDuration: number; // minutes, default 25
  pomodoroShortBreak: number; // minutes, default 5
  pomodoroLongBreak: number; // minutes, default 15
  workStartHour: number; // default 8
  workEndHour: number; // default 18
  soundEnabled: boolean;
}

export interface AIProposal {
  suggestedTasks?: Array<{
    title: string;
    description?: string;
    priority: Priority;
    estimatedDuration: number;
    category: TaskCategory;
    suggestedTimeSlot?: string;
  }>;
  suggestedMilestones?: Array<{
    goalId?: string;
    title: string;
  }>;
  scheduleAdvice?: string;
  applied?: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
  proposals?: AIProposal;
}

export type ActivePage = 
  | 'dashboard'
  | 'tasks'
  | 'goals'
  | 'planner'
  | 'habits'
  | 'focus'
  | 'ai'
  | 'analytics'
  | 'settings';
