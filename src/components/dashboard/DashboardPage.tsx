import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Sparkles,
  Plus,
  AlertCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatDate, isPastDate } from '../../utils/dateUtils';
import { AIService } from '../../services/aiService';

export const DashboardPage: React.FC = () => {
  const {
    t,
    settings,
    tasks,
    goals,
    habits,
    todayFocusMinutes,
    toggleTaskComplete,
    openNewTaskModal,
    openNewGoalModal,
    setActivePage,
    theme,
    language,
  } = useApp();

  const todayStr = getTodayDateString();
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 18) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  }, [t]);

  // Real Calculated Metrics from stored data
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const completedTodayTasks = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'completed');
  }, [todayTasks]);

  const taskCompletionRate = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((completedTodayTasks.length / todayTasks.length) * 100);
  }, [todayTasks, completedTodayTasks]);

  const pendingHighPriority = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.priority === 'high').length;
  }, [tasks]);

  const habitsDoneToday = useMemo(() => {
    return habits.filter((h) => h.completions.includes(todayStr)).length;
  }, [habits, todayStr]);

  const habitsCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.round((habitsDoneToday / habits.length) * 100);
  }, [habits, habitsDoneToday]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate && isPastDate(t.dueDate));
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed' && t.dueDate >= todayStr)
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 5);
  }, [tasks, todayStr]);

  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.progress < 100).slice(0, 3);
  }, [goals]);

  const avgGoalProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + g.progress, 0);
    return Math.round(sum / goals.length);
  }, [goals]);

  // Weekly productivity trend calculated from real data for the past 7 days
  const weeklyData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayTasks = tasks.filter((t) => {
        if (t.completedAt) {
          return t.completedAt.startsWith(dateStr);
        }
        return t.status === 'completed' && t.dueDate === dateStr;
      }).length;

      const dayName = formatDate(dateStr, language, { weekday: 'short' });
      list.push({
        date: dayName,
        tasks: dayTasks,
      });
    }
    return list;
  }, [tasks, language]);

  // Fetch or refresh AI daily suggestion
  const fetchSuggestion = async () => {
    setIsAiLoading(true);
    try {
      const text = await AIService.getDailySuggestion(
        {
          totalTasksToday: todayTasks.length,
          completedTasksToday: completedTodayTasks.length,
          pendingHighPriority,
          focusMinutesToday: todayFocusMinutes,
          habitsDoneToday,
          totalHabits: habits.length,
        },
        language
      );
      setAiSuggestion(text);
    } catch {
      // Handled inside AIService
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, [language]);

  const hasSampleData = tasks.some((t) => t.isSample);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Sample data banner */}
      {hasSampleData && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{t.dashboard.sampleDataNotice}</span>
          </div>
          <button
            onClick={() => setActivePage('settings')}
            className="underline font-semibold hover:text-white shrink-0 cursor-pointer"
          >
            {t.nav.settings}
          </button>
        </div>
      )}

      {/* Greeting and Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}، {settings.userName} 👋
          </h1>
          <p className="text-sm opacity-70 mt-1">{t.dashboard.overview}</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openNewTaskModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.createNewTask}</span>
          </button>
          <button
            onClick={() => openNewGoalModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 hover:bg-slate-800 text-slate-200 transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 text-violet-400" />
            <span>{t.dashboard.createNewGoal}</span>
          </button>
          <button
            onClick={() => setActivePage('focus')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 hover:bg-slate-800 text-slate-200 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{t.dashboard.startPomodoro}</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Tasks */}
        <div
          onClick={() => setActivePage('tasks')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.dashboard.todayTasks}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{completedTodayTasks.length}</span>
            <span className="text-xs opacity-60">/ {todayTasks.length}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="opacity-70">{t.dashboard.completionRate}</span>
              <span className="text-indigo-400 font-bold">{taskCompletionRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Focus Time Today */}
        <div
          onClick={() => setActivePage('focus')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.dashboard.dailyFocusTime}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{todayFocusMinutes}</span>
            <span className="text-xs opacity-60">{t.dashboard.minutesUnit}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {Math.floor(todayFocusMinutes / 60)} {t.dashboard.hoursUnit} {todayFocusMinutes % 60}{' '}
              {t.dashboard.minutesUnit}
            </span>
          </div>
        </div>

        {/* Card 3: Habits Completed */}
        <div
          onClick={() => setActivePage('habits')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.dashboard.habitsCompleted}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{habitsDoneToday}</span>
            <span className="text-xs opacity-60">/ {habits.length}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="opacity-70">{t.dashboard.completionRate}</span>
              <span className="text-amber-400 font-bold">{habitsCompletionRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${habitsCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Goals Progress */}
        <div
          onClick={() => setActivePage('goals')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.dashboard.goalsProgress}
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{avgGoalProgress}%</span>
            <span className="text-xs opacity-60">{goals.length} هدف</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="opacity-70">میانگین پیشرفت</span>
              <span className="text-violet-400 font-bold">{avgGoalProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${avgGoalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Daily Suggestion Banner */}
      <div
        className={`p-5 rounded-2xl border relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/50 border-indigo-500/30'
            : 'bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-200'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  {t.dashboard.aiDailyInsight}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                {isAiLoading ? 'در حال دریافت توصیه هوشمند...' : aiSuggestion || 'برنامه‌ریزی دقیق روزانه، کلید بهره‌وری شماست.'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchSuggestion}
            disabled={isAiLoading}
            className="p-2 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh Suggestion"
          >
            <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Upcoming Tasks + Weekly Productivity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming & Overdue Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Alert Section if any */}
          {overdueTasks.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {t.dashboard.overdueTasks} ({overdueTasks.length})
                  </span>
                </div>
                <button
                  onClick={() => setActivePage('tasks')}
                  className="text-xs underline font-semibold hover:text-white cursor-pointer"
                >
                  {t.actions.viewAll}
                </button>
              </div>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-rose-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-4 h-4 rounded border border-rose-400/50 hover:bg-rose-500/20 flex items-center justify-center shrink-0 cursor-pointer"
                      />
                      <span className="font-medium truncate">{task.title}</span>
                    </div>
                    <span className="text-[11px] text-rose-400 shrink-0 font-bold">
                      {formatDate(task.dueDate, language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming & Priority Tasks */}
          <div
            className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">{t.dashboard.upcomingTasks}</h3>
              </div>
              <button
                onClick={() => setActivePage('tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{t.actions.viewAll}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs opacity-60 text-center py-8">{t.dashboard.noTasksToday}</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-5 h-5 rounded-lg border border-slate-600 hover:border-indigo-500 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      >
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </button>
                      <div className="truncate">
                        <span className="text-sm font-medium truncate block">{task.title}</span>
                        {task.description && (
                          <span className="text-xs opacity-60 truncate block">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-700/30 text-slate-400'
                        }`}
                      >
                        {t.tasks.priorities[task.priority]}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(task.dueDate, language, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Productivity Trend Chart */}
          <div
            className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">{t.dashboard.weeklyProductivity}</h3>
              <span className="text-xs text-slate-400">۷ روز اخیر</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    name={t.dashboard.todayTasks}
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#taskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Goal Progress Cards & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Active Goals Card */}
          <div
            className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-base">{t.goals.title}</h3>
              </div>
              <button
                onClick={() => setActivePage('goals')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                {t.actions.viewAll}
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <p className="text-xs opacity-60 text-center py-6">{t.goals.noGoals}</p>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold truncate max-w-[180px]">{goal.title}</span>
                      <span className="font-bold text-violet-400">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        {goal.milestones.filter((m) => m.completed).length} از {goal.milestones.length}{' '}
                        مایل‌استون
                      </span>
                      <span>موعد: {formatDate(goal.targetDate, language)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assistant Action Card */}
          <div
            className={`p-6 rounded-2xl border relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{t.ai.title}</h4>
                <p className="text-xs opacity-70">هم‌اکنون چه کمکی از دست من برمی‌آید؟</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => setActivePage('ai')}
                className="w-full text-start p-2.5 rounded-xl text-xs font-medium border border-slate-700/40 hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300"
              >
                ✨ برنامه‌ریزی کارهای امروز بر اساس اولویت
              </button>
              <button
                onClick={() => setActivePage('ai')}
                className="w-full text-start p-2.5 rounded-xl text-xs font-medium border border-slate-700/40 hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300"
              >
                🎯 خرد کردن یکی از اهداف به گام‌های اجرایی
              </button>
              <button
                onClick={() => setActivePage('ai')}
                className="w-full text-start p-2.5 rounded-xl text-xs font-medium border border-slate-700/40 hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300"
              >
                📊 تحلیل و گزارش بهره‌وری این هفته
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
