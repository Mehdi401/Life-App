import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Calendar,
  List,
  Columns,
  CalendarDays,
  Target,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus, TaskCategory } from '../../types';
import { formatDate, isPastDate } from '../../utils/dateUtils';
import { TaskModal } from './TaskModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ViewMode = 'list' | 'board' | 'agenda';

export const TasksPage: React.FC = () => {
  const {
    t,
    tasks,
    goals,
    toggleTaskComplete,
    deleteTask,
    updateTask,
    theme,
    language,
    openNewTaskModal,
    isTaskModalOpen,
    setIsTaskModalOpen,
    taskModalGoalId,
  } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  // Modals state
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = (task.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Status
        if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;

        // Priority
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

        // Category
        if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const score = { high: 3, medium: 2, low: 1 };
          return score[b.priority] - score[a.priority];
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedCategory, sortBy]);

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.tasks.title}</h1>
          <p className="text-sm opacity-70 mt-1">{t.tasks.subtitle}</p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            openNewTaskModal();
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.tasks.addTask}</span>
        </button>
      </div>

      {/* Control Bar: Search, Filters, View Modes */}
      <div
        className={`p-4 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.actions.search}
            className={`w-full ps-10 pe-4 py-2 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-indigo-500/40 ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Filters and Sorters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer outline-none ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="todo">{t.tasks.statuses.todo}</option>
            <option value="in_progress">{t.tasks.statuses.in_progress}</option>
            <option value="completed">{t.tasks.statuses.completed}</option>
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer outline-none ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">همه اولویت‌ها</option>
            <option value="high">{t.tasks.priorities.high}</option>
            <option value="medium">{t.tasks.priorities.medium}</option>
            <option value="low">{t.tasks.priorities.low}</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer outline-none ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">{t.tasks.categories.all}</option>
            <option value="work">{t.tasks.categories.work}</option>
            <option value="study">{t.tasks.categories.study}</option>
            <option value="health">{t.tasks.categories.health}</option>
            <option value="personal">{t.tasks.categories.personal}</option>
            <option value="finance">{t.tasks.categories.finance}</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer outline-none ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="dueDate">مرتب‌سازی بر اساس موعد</option>
            <option value="priority">مرتب‌سازی بر اساس اولویت</option>
            <option value="createdAt">جدیدترین کارها</option>
          </select>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={t.tasks.views.list}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={t.tasks.views.board}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'agenda' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={t.tasks.views.agenda}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Render */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800">
          <p className="text-sm opacity-60 mb-3">{t.tasks.noTasksFound}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSelectedCategory('all');
            }}
            className="text-xs text-indigo-400 underline font-semibold cursor-pointer"
          >
            پاک کردن فیلترها
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate && isPastDate(task.dueDate);
            const linkedGoal = goals.find((g) => g.id === task.goalId);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'opacity-60 bg-slate-900/40 border-slate-800/60'
                    : theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-sm sm:text-base ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.isSample && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                          نمونه
                        </span>
                      )}

                      {linkedGoal && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Target className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{linkedGoal.title}</span>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs opacity-70 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 flex-wrap">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          task.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-700/30 text-slate-400'
                        }`}
                      >
                        {t.tasks.priorities[task.priority]}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {task.estimatedDuration} {t.dashboard.minutesUnit}
                        </span>
                      </span>

                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue ? 'text-rose-400 font-bold' : ''
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatDate(task.dueDate, language)} {isOverdue ? '(معوقه)' : ''}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={t.actions.edit}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-2 rounded-xl border border-slate-700/50 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title={t.actions.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'board' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                className={`p-4 rounded-2xl border flex flex-col ${
                  theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        colStatus === 'completed'
                          ? 'bg-emerald-500'
                          : colStatus === 'in_progress'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <h3 className="font-bold text-sm">{t.tasks.statuses[colStatus]}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] p-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all hover:scale-[1.01] ${
                        theme === 'dark'
                          ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-xs font-semibold ${
                            colStatus === 'completed' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-[11px] opacity-70 line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                        <span className="text-indigo-400 font-medium">
                          {formatDate(task.dueDate, language, { month: 'short', day: 'numeric' })}
                        </span>

                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask(task.id, { status: e.target.value as TaskStatus })
                          }
                          className="bg-transparent text-[10px] font-semibold border border-slate-700 rounded-md px-1 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="todo" className="bg-slate-900 text-slate-100">
                            در انتظار
                          </option>
                          <option value="in_progress" className="bg-slate-900 text-slate-100">
                            در حال انجام
                          </option>
                          <option value="completed" className="bg-slate-900 text-slate-100">
                            تکمیل شده
                          </option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* AGENDA / CALENDAR VIEW */
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-6">
            {['امروز', 'فردا', 'روزهای آینده', 'معوقه'].map((groupTitle) => {
              const today = new Date().toISOString().split('T')[0];
              const dTomorrow = new Date();
              dTomorrow.setDate(dTomorrow.getDate() + 1);
              const tomorrow = dTomorrow.toISOString().split('T')[0];

              const groupTasks = filteredTasks.filter((task) => {
                if (groupTitle === 'معوقه') return task.dueDate < today && task.status !== 'completed';
                if (groupTitle === 'امروز') return task.dueDate === today;
                if (groupTitle === 'فردا') return task.dueDate === tomorrow;
                return task.dueDate > tomorrow;
              });

              if (groupTasks.length === 0) return null;

              return (
                <div key={groupTitle} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-inherit pb-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm text-indigo-400">{groupTitle}</h3>
                    <span className="text-xs opacity-60">({groupTasks.length} کار)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-slate-700/40 bg-slate-800/30 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTaskComplete(t.id)}
                            className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center cursor-pointer"
                          >
                            {t.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                          <div>
                            <span className="text-xs font-semibold block">{t.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {t.timeSlot || `${t.estimatedDuration} دقیقه`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditClick(t)}
                          className="text-xs text-slate-400 hover:text-white p-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultGoalId={taskModalGoalId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t.tasks.deleteConfirmTitle}
        message={t.tasks.deleteConfirmMessage}
        confirmText={t.actions.delete}
      />
    </div>
  );
};
