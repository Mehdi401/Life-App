import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  Goal,
  Habit,
  FocusSession,
  UserSettings,
  ActivePage,
} from '../types';
import { StorageService, defaultSettings } from '../services/storage';
import { translations, TranslationKey, Language } from '../i18n/translations';
import { getTodayDateString } from '../utils/dateUtils';

interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  t: TranslationKey;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestoneToGoal: (goalId: string, title: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => string;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (habitId: string, dateStr: string) => void;

  // Focus
  focusSessions: FocusSession[];
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  todayFocusMinutes: number;

  // Data management
  resetSampleData: () => void;
  clearAllData: () => void;
  importBackup: (json: string) => boolean;

  // Quick action state
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  taskModalGoalId?: string;
  openNewTaskModal: (goalId?: string) => void;

  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (open: boolean) => void;
  openNewGoalModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [habits, setHabits] = useState<Habit[]>(() => StorageService.getHabits());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => StorageService.getFocusSessions());

  // Quick modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalGoalId, setTaskModalGoalId] = useState<string | undefined>(undefined);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white min-h-screen';
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white min-h-screen';
    }
  }, [settings.theme]);

  // Sync language and dir attribute
  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.language;
    root.dir = settings.language === 'fa' ? 'rtl' : 'ltr';
  }, [settings.language]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      StorageService.saveSettings(updated);
      return updated;
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    updateSettings({ language: lang });
  }, [updateSettings]);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    updateSettings({ theme });
  }, [updateSettings]);

  const t = useMemo(() => {
    return translations[settings.language] || translations.fa;
  }, [settings.language]);

  // Tasks actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>): string => {
    const newId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      StorageService.saveTasks(updated);
      return updated;
    });
    return newId;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const isCompleting = updates.status === 'completed' && t.status !== 'completed';
          return {
            ...t,
            ...updates,
            completedAt: isCompleting ? new Date().toISOString() : updates.status && updates.status !== 'completed' ? null : t.completedAt,
          };
        }
        return t;
      });
      StorageService.saveTasks(updated);
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      StorageService.saveTasks(updated);
      return updated;
    });
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const isCompleted = t.status === 'completed';
          return {
            ...t,
            status: isCompleted ? ('todo' as const) : ('completed' as const),
            completedAt: isCompleted ? null : new Date().toISOString(),
          };
        }
        return t;
      });
      StorageService.saveTasks(updated);
      return updated;
    });
  }, []);

  // Goals actions
  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt'>): string => {
    const newId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newGoal: Goal = {
      ...goalData,
      id: newId,
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    setGoals((prev) => {
      const updated = [newGoal, ...prev];
      StorageService.saveGoals(updated);
      return updated;
    });
    return newId;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id === id) {
          const updatedGoal = { ...g, ...updates };
          // If calculationType is milestone, recalculate progress automatically
          if (updatedGoal.calculationType === 'milestone' && updatedGoal.milestones?.length > 0) {
            const completed = updatedGoal.milestones.filter((m) => m.completed).length;
            updatedGoal.progress = Math.round((completed / updatedGoal.milestones.length) * 100);
          }
          return updatedGoal;
        }
        return g;
      });
      StorageService.saveGoals(updated);
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      StorageService.saveGoals(updated);
      return updated;
    });
    // Remove goalId links from associated tasks
    setTasks((prev) => {
      const updated = prev.map((t) => (t.goalId === id ? { ...t, goalId: null } : t));
      StorageService.saveTasks(updated);
      return updated;
    });
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id === goalId) {
          const milestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          let progress = g.progress;
          if (g.calculationType === 'milestone' && milestones.length > 0) {
            const completedCount = milestones.filter((m) => m.completed).length;
            progress = Math.round((completedCount / milestones.length) * 100);
          }
          return { ...g, milestones, progress };
        }
        return g;
      });
      StorageService.saveGoals(updated);
      return updated;
    });
  }, []);

  const addMilestoneToGoal = useCallback((goalId: string, title: string) => {
    if (!title.trim()) return;
    setGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id === goalId) {
          const newMilestone = {
            id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: title.trim(),
            completed: false,
          };
          const milestones = [...g.milestones, newMilestone];
          let progress = g.progress;
          if (g.calculationType === 'milestone') {
            const completedCount = milestones.filter((m) => m.completed).length;
            progress = Math.round((completedCount / milestones.length) * 100);
          }
          return { ...g, milestones, progress };
        }
        return g;
      });
      StorageService.saveGoals(updated);
      return updated;
    });
  }, []);

  // Habits actions
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'completions'>): string => {
    const newId = `habit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newHabit: Habit = {
      ...habitData,
      id: newId,
      completions: [],
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    setHabits((prev) => {
      const updated = [newHabit, ...prev];
      StorageService.saveHabits(updated);
      return updated;
    });
    return newId;
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, ...updates } : h));
      StorageService.saveHabits(updated);
      return updated;
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      StorageService.saveHabits(updated);
      return updated;
    });
  }, []);

  const toggleHabitDate = useCallback((habitId: string, dateStr: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === habitId) {
          const exists = h.completions.includes(dateStr);
          const completions = exists
            ? h.completions.filter((d) => d !== dateStr)
            : [...h.completions, dateStr];
          return { ...h, completions };
        }
        return h;
      });
      StorageService.saveHabits(updated);
      return updated;
    });
  }, []);

  // Focus actions
  const addFocusSession = useCallback((sessionData: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setFocusSessions((prev) => {
      const updated = [newSession, ...prev];
      StorageService.saveFocusSessions(updated);
      return updated;
    });
  }, []);

  const todayFocusMinutes = useMemo(() => {
    const todayStr = getTodayDateString();
    return focusSessions
      .filter((s) => s.completedAt.startsWith(todayStr) && s.mode === 'work')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [focusSessions]);

  // Reset & import
  const resetSampleData = useCallback(() => {
    StorageService.resetToSampleData();
    setTasks(StorageService.getTasks());
    setGoals(StorageService.getGoals());
    setHabits(StorageService.getHabits());
    setFocusSessions(StorageService.getFocusSessions());
    setSettings(StorageService.getSettings());
  }, []);

  const clearAllData = useCallback(() => {
    StorageService.clearAllData();
    setTasks([]);
    setGoals([]);
    setHabits([]);
    setFocusSessions([]);
  }, []);

  const importBackup = useCallback((jsonString: string): boolean => {
    const success = StorageService.importFullBackupJSON(jsonString);
    if (success) {
      setTasks(StorageService.getTasks());
      setGoals(StorageService.getGoals());
      setHabits(StorageService.getHabits());
      setFocusSessions(StorageService.getFocusSessions());
      setSettings(StorageService.getSettings());
    }
    return success;
  }, []);

  const openNewTaskModal = useCallback((goalId?: string) => {
    setTaskModalGoalId(goalId);
    setIsTaskModalOpen(true);
  }, []);

  const openNewGoalModal = useCallback(() => {
    setIsGoalModalOpen(true);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        language: settings.language,
        setLanguage,
        theme: settings.theme,
        setTheme,
        t,
        settings,
        updateSettings,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        addMilestoneToGoal,
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDate,
        focusSessions,
        addFocusSession,
        todayFocusMinutes,
        resetSampleData,
        clearAllData,
        importBackup,
        isTaskModalOpen,
        setIsTaskModalOpen,
        taskModalGoalId,
        openNewTaskModal,
        isGoalModalOpen,
        setIsGoalModalOpen,
        openNewGoalModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
