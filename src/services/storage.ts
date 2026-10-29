import { Task, Goal, Habit, FocusSession, UserSettings, AIMessage } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

const STORAGE_KEYS = {
  TASKS: 'lifepilot_tasks_v1',
  GOALS: 'lifepilot_goals_v1',
  HABITS: 'lifepilot_habits_v1',
  FOCUS_SESSIONS: 'lifepilot_focus_sessions_v1',
  SETTINGS: 'lifepilot_settings_v1',
  AI_CHAT: 'lifepilot_ai_chat_v1',
};

export const defaultSettings: UserSettings = {
  userName: 'مهدی',
  theme: 'dark',
  language: 'fa',
  pomodoroWorkDuration: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  workStartHour: 8,
  workEndHour: 18,
  soundEnabled: true,
};

// Generate past dates for realistic habit histories
function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = getTodayDateString();
const yesterday = getPastDate(1);
const twoDaysAgo = getPastDate(2);
const threeDaysAgo = getPastDate(3);
const fourDaysAgo = getPastDate(4);
const fiveDaysAgo = getPastDate(5);
const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

export const sampleGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'تسلط بر معماری نرم‌افزار توزیع‌شده و کلود',
    description: 'کسب دانش عمیق در زمینه طراحی سیستم‌های مقیاس‌پذیر و آزمون عملی الگوها',
    category: 'study',
    targetDate: getPastDate(-60), // 60 days ahead
    progress: 66,
    calculationType: 'milestone',
    milestones: [
      { id: 'm-1', title: 'مطالعه کتاب Designing Data-Intensive Applications', completed: true },
      { id: 'm-2', title: 'پیاده‌سازی یک الگوی Event-Driven با RabbitMQ یا Kafka', completed: true },
      { id: 'm-3', title: 'راه‌اندازی بنچمارک مقیاس‌پذیری و کشینگ Redis', completed: false },
    ],
    createdAt: getPastDate(20),
    isSample: true,
  },
  {
    id: 'goal-2',
    title: 'ارتقای آمادگی جسمانی و دویدن ۱۰ کیلومتر',
    description: 'ایجاد سبک زندگی پرانرژی و ثبت زمان دویدن استاندارد',
    category: 'health',
    targetDate: getPastDate(-45),
    progress: 50,
    calculationType: 'milestone',
    milestones: [
      { id: 'm-4', title: 'انجام منظم تمرینات اینتروال ۳ روز در هفته', completed: true },
      { id: 'm-5', title: 'رسیدن به مسافت ۵ کیلومتر پیوسته', completed: true },
      { id: 'm-6', title: 'دویدن آزمایشی ۸ کیلومتر با شیب ملایم', completed: false },
      { id: 'm-7', title: 'شرکت در دو ۱۰ کیلومتر رسمی', completed: false },
    ],
    createdAt: getPastDate(30),
    isSample: true,
  },
  {
    id: 'goal-3',
    title: 'توسعه و عرضه ابزار مدیریت مالی شخصی',
    description: 'طراحی یک محصول نرم‌افزاری کاربردی مستقل با تمرکز بر حفظ حریم خصوصی',
    category: 'work',
    targetDate: getPastDate(-30),
    progress: 75,
    calculationType: 'manual',
    milestones: [
      { id: 'm-8', title: 'طراحی پروتوتایپ و جریان کاربر در فیگما', completed: true },
      { id: 'm-9', title: 'پیاده‌سازی هسته محاسبات بودجه', completed: true },
      { id: 'm-10', title: 'تست‌های امنیت داده و رمزگذاری محلی', completed: false },
    ],
    createdAt: getPastDate(15),
    isSample: true,
  },
];

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'بررسی معماری کشینگ Redis برای پروژه توزیع‌شده',
    description: 'تحلیل الگوهای Cache-Aside و Write-Through برای کاهش تاخیر پایگاه داده',
    priority: 'high',
    status: 'todo',
    dueDate: today,
    estimatedDuration: 45,
    category: 'study',
    goalId: 'goal-1',
    timeSlot: '09:00 - 09:45',
    createdAt: getPastDate(1),
    isSample: true,
  },
  {
    id: 'task-2',
    title: 'جلسه بازبینی نیازمندی‌های محصول با تیم مهندسی',
    description: 'همگام‌سازی شاخص‌های کلیدی عملکرد و اولویت‌های اسپرینت جدید',
    priority: 'high',
    status: 'in_progress',
    dueDate: today,
    estimatedDuration: 60,
    category: 'work',
    goalId: 'goal-3',
    timeSlot: '10:30 - 11:30',
    createdAt: getPastDate(2),
    isSample: true,
  },
  {
    id: 'task-3',
    title: 'تمرین ورزشی هوازی و دویدن استقامتی',
    description: '۴۵ دقیقه دویدن در پارک با هدف حفظ ضربان قلب در فاز چربی‌سوزی',
    priority: 'medium',
    status: 'completed',
    dueDate: today,
    estimatedDuration: 45,
    category: 'health',
    goalId: 'goal-2',
    timeSlot: '07:30 - 08:15',
    completedAt: new Date().toISOString(),
    createdAt: getPastDate(1),
    isSample: true,
  },
  {
    id: 'task-4',
    title: 'طراحی ماژول اکسپورت پشتیبان آفلاین',
    description: 'افزودن امکان دانلود مستقیم فایل‌های JSON و CSV به تنظیمات',
    priority: 'medium',
    status: 'completed',
    dueDate: today,
    estimatedDuration: 30,
    category: 'work',
    goalId: 'goal-3',
    timeSlot: '13:00 - 13:30',
    completedAt: new Date().toISOString(),
    createdAt: getPastDate(1),
    isSample: true,
  },
  {
    id: 'task-5',
    title: 'مرور بودجه‌بندی ماهانه و تراز هزینه‌ها',
    description: 'بررسی اشتراک‌ها و کنترل هزینه‌های اداری',
    priority: 'low',
    status: 'todo',
    dueDate: tomorrow,
    estimatedDuration: 30,
    category: 'finance',
    goalId: null,
    timeSlot: null,
    createdAt: getPastDate(3),
    isSample: true,
  },
  {
    id: 'task-6',
    title: 'مطالعه مستندات وب‌سوکت برای آپدیت‌های آنی',
    description: 'تست کارایی هندلرهای اتصال در سناریوی قطعی موقت شبکه',
    priority: 'medium',
    status: 'todo',
    dueDate: tomorrow,
    estimatedDuration: 50,
    category: 'study',
    goalId: 'goal-1',
    timeSlot: null,
    createdAt: getPastDate(2),
    isSample: true,
  },
  {
    id: 'task-7',
    title: 'بازبینی چک‌لیست امنیت و لایسنس پکیج‌ها',
    description: 'بررسی آسیب‌پذیری‌های احتمالی در وابستگی‌های پروژه',
    priority: 'high',
    status: 'todo',
    dueDate: getPastDate(1), // overdue
    estimatedDuration: 40,
    category: 'work',
    goalId: null,
    timeSlot: null,
    createdAt: getPastDate(5),
    isSample: true,
  },
];

export const sampleHabits: Habit[] = [
  {
    id: 'habit-1',
    title: 'مطالعه ۳۰ دقیقه کتاب تخصصی',
    description: 'کتاب‌های مهندسی نرم‌افزار، مدیریت زمان یا روانشناسی رفتار',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    category: 'study',
    color: '#8b5cf6', // Violet
    completions: [today, yesterday, twoDaysAgo, threeDaysAgo, fourDaysAgo, fiveDaysAgo],
    createdAt: getPastDate(30),
    isSample: true,
  },
  {
    id: 'habit-2',
    title: 'ورزش و تحرک روزانه (حداقل ۳۰ دقیقه)',
    description: 'دویدن، تمرین قدرتی یا حرکات کششی انعطاف‌پذیری',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    category: 'health',
    color: '#10b981', // Emerald
    completions: [today, yesterday, twoDaysAgo, fourDaysAgo],
    createdAt: getPastDate(25),
    isSample: true,
  },
  {
    id: 'habit-3',
    title: 'برنامه‌ریزی شبانه برای ۳ اولویت فردا',
    description: 'یادداشت مهم‌ترین اقدامات قبل از خاموشی برای شروع پرانرژی صبح',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    category: 'personal',
    color: '#3b82f6', // Blue
    completions: [yesterday, twoDaysAgo, threeDaysAgo, fourDaysAgo],
    createdAt: getPastDate(20),
    isSample: true,
  },
  {
    id: 'habit-4',
    title: 'نوشیدن ۲ لیتر آب سالم',
    description: 'هیدراته ماندن برای حفظ شادابی ذهن و توان تمرکز پایدار',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    category: 'health',
    color: '#06b6d4', // Cyan
    completions: [today, yesterday, threeDaysAgo, fourDaysAgo, fiveDaysAgo],
    createdAt: getPastDate(15),
    isSample: true,
  },
];

export const sampleFocusSessions: FocusSession[] = [
  {
    id: 'f-1',
    taskId: 'task-3',
    taskTitle: 'تمرین ورزشی هوازی و دویدن استقامتی',
    durationMinutes: 25,
    completedAt: `${today}T08:15:00Z`,
    mode: 'work',
  },
  {
    id: 'f-2',
    taskId: 'task-4',
    taskTitle: 'طراحی ماژول اکسپورت پشتیبان آفلاین',
    durationMinutes: 25,
    completedAt: `${today}T13:30:00Z`,
    mode: 'work',
  },
  {
    id: 'f-3',
    taskId: 'task-2',
    taskTitle: 'جلسه بازبینی نیازمندی‌های محصول با تیم مهندسی',
    durationMinutes: 25,
    completedAt: `${yesterday}T11:00:00Z`,
    mode: 'work',
  },
  {
    id: 'f-4',
    taskId: 'task-1',
    taskTitle: 'بررسی معماری کشینگ Redis برای پروژه توزیع‌شده',
    durationMinutes: 25,
    completedAt: `${yesterday}T15:30:00Z`,
    mode: 'work',
  },
];

export class StorageService {
  // TASKS
  static getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        this.saveTasks(sampleTasks);
        return sampleTasks;
      }
      return JSON.parse(data);
    } catch {
      return sampleTasks;
    }
  }

  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  // GOALS
  static getGoals(): Goal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) {
        this.saveGoals(sampleGoals);
        return sampleGoals;
      }
      return JSON.parse(data);
    } catch {
      return sampleGoals;
    }
  }

  static saveGoals(goals: Goal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }

  // HABITS
  static getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (!data) {
        this.saveHabits(sampleHabits);
        return sampleHabits;
      }
      return JSON.parse(data);
    } catch {
      return sampleHabits;
    }
  }

  static saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  }

  // FOCUS SESSIONS
  static getFocusSessions(): FocusSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      if (!data) {
        this.saveFocusSessions(sampleFocusSessions);
        return sampleFocusSessions;
      }
      return JSON.parse(data);
    } catch {
      return sampleFocusSessions;
    }
  }

  static saveFocusSessions(sessions: FocusSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save focus sessions', e);
    }
  }

  // SETTINGS
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return { ...defaultSettings, ...JSON.parse(data) };
    } catch {
      return defaultSettings;
    }
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // AI CHAT
  static getAIChatHistory(): AIMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CHAT);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveAIChatHistory(messages: AIMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save AI chat', e);
    }
  }

  static clearAIChatHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.AI_CHAT);
  }

  // EXPORT & IMPORT
  static exportFullBackupJSON(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      goals: this.getGoals(),
      habits: this.getHabits(),
      focusSessions: this.getFocusSessions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static exportTasksAsCSV(): string {
    const tasks = this.getTasks();
    const headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'DueDate', 'EstimatedMinutes', 'Category', 'CompletedAt'];
    const rows = tasks.map(t => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dueDate}"`,
      t.estimatedDuration,
      `"${t.category}"`,
      `"${t.completedAt || ''}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static importFullBackupJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.tasks)) {
        this.saveTasks(parsed.tasks);
      }
      if (Array.isArray(parsed.goals)) {
        this.saveGoals(parsed.goals);
      }
      if (Array.isArray(parsed.habits)) {
        this.saveHabits(parsed.habits);
      }
      if (Array.isArray(parsed.focusSessions)) {
        this.saveFocusSessions(parsed.focusSessions);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings({ ...defaultSettings, ...parsed.settings });
      }
      return true;
    } catch (err) {
      console.error('Import validation failed:', err);
      return false;
    }
  }

  static resetToSampleData(): void {
    this.saveTasks(sampleTasks);
    this.saveGoals(sampleGoals);
    this.saveHabits(sampleHabits);
    this.saveFocusSessions(sampleFocusSessions);
    this.saveSettings(defaultSettings);
    this.clearAIChatHistory();
  }

  static clearAllData(): void {
    this.saveTasks([]);
    this.saveGoals([]);
    this.saveHabits([]);
    this.saveFocusSessions([]);
    this.clearAIChatHistory();
  }
}
