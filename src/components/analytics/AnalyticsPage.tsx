import React, { useMemo } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

const CATEGORY_COLORS: { [key: string]: string } = {
  work: '#6366f1', // Indigo
  study: '#8b5cf6', // Violet
  health: '#10b981', // Emerald
  personal: '#3b82f6', // Blue
  finance: '#f59e0b', // Amber
  general: '#64748b', // Slate
};

export const AnalyticsPage: React.FC = () => {
  const {
    t,
    tasks,
    goals,
    habits,
    focusSessions,
    theme,
    language,
  } = useApp();

  // Summary Metrics
  const totalCompletedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed').length;
  }, [tasks]);

  const totalFocusMinutes = useMemo(() => {
    return focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [focusSessions]);

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  const avgGoalProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length);
  }, [goals]);

  const activeStreaksCount = useMemo(() => {
    return habits.filter((h) => h.completions.length >= 2).length;
  }, [habits]);

  // 14-Day Task Completion Trend
  const taskTrendData = useMemo(() => {
    const list = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const completedCount = tasks.filter((t) => {
        if (t.completedAt) return t.completedAt.startsWith(dateStr);
        return t.status === 'completed' && t.dueDate === dateStr;
      }).length;

      const createdCount = tasks.filter((t) => t.createdAt.startsWith(dateStr)).length;

      list.push({
        date: formatDate(dateStr, language, { month: 'numeric', day: 'numeric' }),
        completed: completedCount,
        created: createdCount,
      });
    }
    return list;
  }, [tasks, language]);

  // Focus Minutes Trend over last 7 days
  const focusTrendData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const minutes = focusSessions
        .filter((s) => s.completedAt.startsWith(dateStr) && s.mode === 'work')
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      list.push({
        date: formatDate(dateStr, language, { weekday: 'short' }),
        minutes,
      });
    }
    return list;
  }, [focusSessions, language]);

  // Tasks by Category Distribution
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    tasks.forEach((t) => {
      const cat = t.category || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([cat, value]) => ({
      name: t.tasks.categories[cat as keyof typeof t.tasks.categories] || cat,
      key: cat,
      value,
    }));
  }, [tasks, t]);

  // Habit consistency calculation (% of last 14 days completed)
  const habitConsistency = useMemo(() => {
    return habits.map((h) => {
      let countInLast14 = 0;
      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (h.completions.includes(dateStr)) countInLast14++;
      }
      const rate = Math.round((countInLast14 / 14) * 100);
      return {
        id: h.id,
        title: h.title,
        color: h.color,
        rate,
        count: countInLast14,
      };
    });
  }, [habits]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.analytics.title}</h1>
        <p className="text-sm opacity-70 mt-1">{t.analytics.subtitle}</p>
      </div>

      {/* Accuracy Disclosure Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>{t.analytics.accuracyNotice}</span>
      </div>

      {/* Key Metric Highlights Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.analytics.totalTasksDone}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold">{totalCompletedTasks}</div>
          <div className="mt-2 text-xs text-slate-400">از کل {tasks.length} کار ثبت شده</div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.analytics.focusHoursTotal}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold">{totalFocusHours}</div>
          <div className="mt-2 text-xs text-emerald-400 font-medium">
            {focusSessions.length} جلسه تمرکز ثبت شده
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.analytics.activeStreaks}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold">{activeStreaksCount}</div>
          <div className="mt-2 text-xs text-slate-400">از کل {habits.length} عادت</div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.analytics.avgGoalProgress}
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold">{avgGoalProgress}%</div>
          <div className="mt-2 text-xs text-violet-400 font-medium">{goals.length} هدف فعال</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 14-Day Completion Trend */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-bold text-base mb-1">{t.analytics.tasksTrendTitle}</h3>
          <p className="text-xs text-slate-400 mb-4">مقایسه کارهای انجام شده و تعریف شده</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} allowDecimals={false} />
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
                  dataKey="completed"
                  name="کارهای تکمیل شده"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#compGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Focus Minutes by Day */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-bold text-base mb-1">{t.analytics.focusTrendTitle}</h3>
          <p className="text-xs text-slate-400 mb-4">دقایق پومودورو تکمیل شده در هر روز</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Bar
                  dataKey="minutes"
                  name="دقایق تمرکز"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Category Distribution + Habit Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-bold text-base mb-1">{t.analytics.categoryDistTitle}</h3>
          <p className="text-xs text-slate-400 mb-4">سهم هر حوزه از وظایف تعریف شده</p>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs opacity-50">داده‌ای برای نمایش وجود ندارد</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.key] || '#6366f1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Habit Consistency Table */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-bold text-base mb-1">{t.analytics.habitConsistencyTitle}</h3>
          <p className="text-xs text-slate-400 mb-4">درصد موفقیت عادات در ۱۴ روز اخیر</p>
          <div className="space-y-4">
            {habitConsistency.map((habit) => (
              <div key={habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: habit.color }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span className="font-semibold">{habit.title}</span>
                  </div>
                  <span className="font-bold text-indigo-400">
                    {habit.rate}% ({habit.count}/14 روز)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${habit.rate}%`, backgroundColor: habit.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
