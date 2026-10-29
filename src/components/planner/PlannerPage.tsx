import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';
import { Task } from '../../types';

interface ScheduledSlot {
  timeStr: string;
  hour: number;
  task: Task | null;
}

export const PlannerPage: React.FC = () => {
  const {
    t,
    tasks,
    updateTask,
    settings,
    updateSettings,
    openNewTaskModal,
    theme,
    language,
    setActivePage,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [proposedSchedule, setProposedSchedule] = useState<{ [taskId: string]: string } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const startHour = settings.workStartHour || 8;
  const endHour = settings.workEndHour || 18;

  // Filter tasks for the selected date
  const dayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDate);
  }, [tasks, selectedDate]);

  // Total estimated workload in minutes
  const totalWorkloadMinutes = useMemo(() => {
    return dayTasks.reduce((acc, t) => acc + (t.estimatedDuration || 30), 0);
  }, [dayTasks]);

  const availableWorkMinutes = (endHour - startHour) * 60;
  const isOverCapacity = totalWorkloadMinutes > availableWorkMinutes;

  // Generate hourly blocks from working hours
  const timeBlocks = useMemo(() => {
    const blocks: { hour: number; label: string; tasks: Task[] }[] = [];
    for (let h = startHour; h < endHour; h++) {
      const label = `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`;
      // Find tasks assigned to this timeSlot
      const slotTasks = dayTasks.filter((t) => {
        if (!t.timeSlot) return false;
        const taskStartHour = parseInt(t.timeSlot.split(':')[0], 10);
        return taskStartHour === h;
      });
      blocks.push({ hour: h, label, tasks: slotTasks });
    }
    return blocks;
  }, [dayTasks, startHour, endHour]);

  // Unscheduled tasks for today
  const unscheduledTasks = useMemo(() => {
    return dayTasks.filter((t) => !t.timeSlot && t.status !== 'completed');
  }, [dayTasks]);

  // Date navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setProposedSchedule(null);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setProposedSchedule(null);
  };

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
    setProposedSchedule(null);
  };

  // AI Schedule Suggestion algorithm
  const handleGenerateSchedule = () => {
    setIsSuggesting(true);
    setConflicts([]);

    setTimeout(() => {
      // Sort tasks by priority: high -> medium -> low
      const pendingDayTasks = [...dayTasks.filter((t) => t.status !== 'completed')].sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      });

      const proposed: { [taskId: string]: string } = {};
      let currentHour = startHour;
      let currentMinute = 0;
      const detectedConflicts: string[] = [];

      for (const task of pendingDayTasks) {
        const duration = task.estimatedDuration || 30;
        const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        
        let endHourCalc = currentHour + Math.floor((currentMinute + duration) / 60);
        let endMinCalc = (currentMinute + duration) % 60;

        if (endHourCalc >= endHour) {
          detectedConflicts.push(`کار "${task.title}" از سقف ساعات کاری تعریف شده (${endHour}:00) فراتر می‌رود.`);
        }

        const endStr = `${String(endHourCalc).padStart(2, '0')}:${String(endMinCalc).padStart(2, '0')}`;
        proposed[task.id] = `${startStr} - ${endStr}`;

        // Advance slot with small 10m buffer
        const nextTotalMinutes = currentHour * 60 + currentMinute + duration + 10;
        currentHour = Math.floor(nextTotalMinutes / 60);
        currentMinute = nextTotalMinutes % 60;
      }

      setProposedSchedule(proposed);
      setConflicts(detectedConflicts);
      setIsSuggesting(false);
    }, 600);
  };

  // User explicitly accepts proposals
  const handleApplyProposals = () => {
    if (!proposedSchedule) return;
    Object.entries(proposedSchedule).forEach(([taskId, slot]) => {
      updateTask(taskId, { timeSlot: slot });
    });
    setProposedSchedule(null);
  };

  const handleDiscardProposals = () => {
    setProposedSchedule(null);
    setConflicts([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.planner.title}</h1>
          <p className="text-sm opacity-70 mt-1">{t.planner.subtitle}</p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl border border-slate-700/60 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-700/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            امروز
          </button>
          <div className="text-sm font-bold px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            {formatDate(selectedDate, language, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl border border-slate-700/60 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Capacity & Working Hours Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{t.planner.workingHours}:</span>
            <span className="text-indigo-400 font-bold">
              {startHour}:00 الی {endHour}:00 ({availableWorkMinutes / 60} ساعت)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">حجم کاری تخمین‌زده امروز:</span>
            <span
              className={`font-bold ${
                isOverCapacity ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {Math.floor(totalWorkloadMinutes / 60)} ساعت و {totalWorkloadMinutes % 60} دقیقه
            </span>
          </div>
        </div>

        {/* Suggest Button */}
        <button
          onClick={handleGenerateSchedule}
          disabled={isSuggesting || dayTasks.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isSuggesting ? 'animate-spin' : ''}`} />
          <span>{isSuggesting ? t.planner.suggesting : t.planner.suggestScheduleBtn}</span>
        </button>
      </div>

      {/* Conflicts Banner */}
      {(isOverCapacity || conflicts.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.planner.conflictsWarning}</span>
          </div>
          {isOverCapacity && (
            <p>
              حجم کارهای امروز ({totalWorkloadMinutes} دقیقه) از کل ساعات کاری در دسترس ({availableWorkMinutes} دقیقه) بیشتر است. اولویت‌بندی مجدد یا واگذاری بخشی به روزهای آینده توصیه می‌شود.
            </p>
          )}
          {conflicts.map((c, i) => (
            <p key={i}>• {c}</p>
          ))}
        </div>
      )}

      {/* Review AI Proposed Schedule Card (Requires explicit user confirmation) */}
      {proposedSchedule && (
        <div className="p-5 rounded-2xl bg-violet-950/40 border border-violet-500/40 text-violet-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-sm">پیشنهاد زمان‌بندی هوشمند کارهای امروز</h3>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
              نیاز به تأیید شما دارد
            </span>
          </div>

          <p className="text-xs opacity-90 leading-relaxed">
            کارهای شما بر مبنای بالاترین اولویت و برآورد زمان به این شکل در ساعات کاری چیده شدند. لطفاً جدول زیر را بررسی کنید:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {Object.entries(proposedSchedule).map(([taskId, slot]) => {
              const task = tasks.find((t) => t.id === taskId);
              if (!task) return null;
              return (
                <div
                  key={taskId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-violet-500/30 text-xs"
                >
                  <span className="font-medium truncate max-w-[200px]">{task.title}</span>
                  <span className="font-bold text-violet-300 bg-violet-900/40 px-2 py-0.5 rounded">
                    {slot}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDiscardProposals}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.planner.discardSuggestions}</span>
            </button>
            <button
              onClick={handleApplyProposals}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.planner.applySuggestions}</span>
            </button>
          </div>
        </div>
      )}

      {/* Planner Grid: Left Timeline, Right Unscheduled Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Columns (2 cols) */}
        <div
          className={`lg:col-span-2 p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-inherit">
            <h3 className="font-bold text-base">{t.planner.todaySchedule}</h3>
            <span className="text-xs text-slate-400">
              {dayTasks.filter((t) => t.timeSlot).length} کار زمان‌بندی شده
            </span>
          </div>

          <div className="space-y-3">
            {timeBlocks.map((block) => (
              <div
                key={block.hour}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/60 bg-slate-800/20"
              >
                <div className="w-24 shrink-0 text-xs font-mono font-bold text-indigo-400 pt-1">
                  {block.label}
                </div>

                <div className="flex-1 space-y-2">
                  {block.tasks.length === 0 ? (
                    <span className="text-xs opacity-40 italic block py-1">
                      {t.planner.freeTimeAvailable}
                    </span>
                  ) : (
                    block.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              task.status === 'completed'
                                ? 'text-emerald-400'
                                : 'text-indigo-400'
                            }`}
                          />
                          <span
                            className={`font-semibold truncate ${
                              task.status === 'completed' ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.timeSlot}
                          </span>
                          <button
                            onClick={() => updateTask(task.id, { timeSlot: null })}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="حذف از این بازه"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Unscheduled Tasks waiting to be scheduled */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-inherit">
            <h3 className="font-bold text-base">کارهای در انتظار زمان‌بندی</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {unscheduledTasks.length}
            </span>
          </div>

          {unscheduledTasks.length === 0 ? (
            <p className="text-xs opacity-60 text-center py-8">
              تمام کارهای امروز زمان‌بندی شده‌اند یا کاری وجود ندارد.
            </p>
          ) : (
            <div className="space-y-3">
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{task.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        task.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {t.tasks.priorities[task.priority]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span>
                      {task.estimatedDuration} {t.dashboard.minutesUnit}
                    </span>

                    {/* Quick Assign Slot Select */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          updateTask(task.id, { timeSlot: e.target.value });
                        }
                      }}
                      className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="">اختصاص به بازه زمانی...</option>
                      {timeBlocks.map((b) => (
                        <option key={b.hour} value={b.label}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
