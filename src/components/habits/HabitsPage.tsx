import React, { useState, useMemo } from 'react';
import {
  Plus,
  Flame,
  Check,
  Calendar,
  Trash2,
  Edit3,
  Award,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { getTodayDateString, getDaysOfWeek, formatDate } from '../../utils/dateUtils';
import { HabitModal } from './HabitModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const HabitsPage: React.FC = () => {
  const {
    t,
    habits,
    toggleHabitDate,
    deleteHabit,
    theme,
    language,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const todayStr = getTodayDateString();
  const past7Days = useMemo(() => getDaysOfWeek(language), [language]);

  // Streak calculation helper
  const calculateStreak = (completions: string[]): { current: number; best: number } => {
    if (!completions || completions.length === 0) return { current: 0, best: 0 };
    const sorted = Array.from(new Set(completions)).sort().reverse();
    
    let current = 0;
    let checkDate = new Date();
    const today = getTodayDateString();

    // Check if done today or yesterday
    if (completions.includes(today)) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (completions.includes(yesterdayStr)) {
        checkDate = yesterday;
      } else {
        return { current: 0, best: calculateBestStreak(completions) };
      }
    }

    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completions.includes(dateStr)) {
        current++;
      } else {
        break;
      }
    }

    return {
      current,
      best: Math.max(current, calculateBestStreak(completions)),
    };
  };

  const calculateBestStreak = (completions: string[]): number => {
    if (completions.length === 0) return 0;
    const sorted = Array.from(new Set(completions)).sort();
    let best = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        current++;
        if (current > best) best = current;
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    return best;
  };

  const handleEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.habits.title}</h1>
          <p className="text-sm opacity-70 mt-1">{t.habits.subtitle}</p>
        </div>

        <button
          onClick={() => {
            setHabitToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.habits.addHabit}</span>
        </button>
      </div>

      {/* Helpful Correction Tip Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>{t.habits.pastDaysNotice}</span>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800">
          <Flame className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm opacity-70 mb-4">{t.habits.noHabits}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
          >
            {t.habits.addHabit}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {habits.map((habit) => {
            const streak = calculateStreak(habit.completions);
            const isCompletedToday = habit.completions.includes(todayStr);

            return (
              <div
                key={habit.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left Side Info */}
                <div className="flex items-start gap-4">
                  <div
                    style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    className="p-3 rounded-2xl shrink-0"
                  >
                    <Flame className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base">{habit.title}</h3>
                      {habit.isSample && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                          نمونه
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/60 text-slate-400 font-medium">
                        {habit.frequency === 'daily'
                          ? t.habits.daily
                          : `${habit.targetDaysPerWeek} ${t.habits.days} در هفته`}
                      </span>
                    </div>

                    {habit.description && (
                      <p className="text-xs opacity-70 leading-relaxed max-w-xl">
                        {habit.description}
                      </p>
                    )}

                    {/* Streak stats */}
                    <div className="flex items-center gap-4 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>
                          {t.habits.streak}: {streak.current} {t.habits.days}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-violet-400 font-medium">
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          {t.habits.bestStreak}: {streak.best} {t.habits.days}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: 7-Day Interactive Tracker & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  {/* Past 7 days check dots */}
                  <div className="flex items-center gap-2">
                    {past7Days.map((day) => {
                      const isDone = habit.completions.includes(day.dateStr);

                      return (
                        <div key={day.dateStr} className="flex flex-col items-center gap-1">
                          <span
                            className={`text-[10px] ${
                              day.isToday ? 'font-bold text-indigo-400' : 'opacity-60'
                            }`}
                          >
                            {day.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                            style={{
                              backgroundColor: isDone ? habit.color : undefined,
                              borderColor: isDone ? habit.color : undefined,
                            }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'text-white shadow-sm scale-105'
                                : 'border-slate-700/60 hover:border-slate-500 bg-slate-800/30'
                            }`}
                            title={`ثبت / اصلاح برای تاریخ ${formatDate(day.dateStr, language)}`}
                          >
                            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 border-s border-slate-800 ps-4">
                    <button
                      onClick={() => handleEdit(habit)}
                      className="p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title={t.actions.edit}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHabitToDelete(habit)}
                      className="p-2 rounded-xl border border-slate-700/50 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title={t.actions.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(habitToDelete)}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="حذف عادت"
        message={t.habits.deleteConfirm}
        confirmText={t.actions.delete}
      />
    </div>
  );
};
