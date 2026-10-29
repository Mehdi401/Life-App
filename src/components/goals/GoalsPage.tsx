import React, { useState } from 'react';
import {
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import { formatDate, isPastDate } from '../../utils/dateUtils';
import { GoalModal } from './GoalModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const GoalsPage: React.FC = () => {
  const {
    t,
    goals,
    tasks,
    deleteGoal,
    toggleMilestone,
    addMilestoneToGoal,
    openNewTaskModal,
    theme,
    language,
    isGoalModalOpen,
    setIsGoalModalOpen,
    openNewGoalModal,
  } = useApp();

  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [newMilestoneTitles, setNewMilestoneTitles] = useState<{ [goalId: string]: string }>({});

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };

  const handleAddMilestone = (goalId: string) => {
    const text = newMilestoneTitles[goalId];
    if (text && text.trim()) {
      addMilestoneToGoal(goalId, text.trim());
      setNewMilestoneTitles((prev) => ({ ...prev, [goalId]: '' }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.goals.title}</h1>
          <p className="text-sm opacity-70 mt-1">{t.goals.subtitle}</p>
        </div>

        <button
          onClick={() => {
            setGoalToEdit(null);
            openNewGoalModal();
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.goals.addGoal}</span>
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800">
          <Target className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm opacity-70 mb-4">{t.goals.noGoals}</p>
          <button
            onClick={() => openNewGoalModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
          >
            {t.goals.addGoal}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const isOverdue = goal.targetDate && isPastDate(goal.targetDate) && goal.progress < 100;
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);

            return (
              <div
                key={goal.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                          {t.tasks.categories[goal.category as keyof typeof t.tasks.categories] || goal.category}
                        </span>
                        {goal.isSample && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            نمونه
                          </span>
                        )}
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            {t.goals.overdueNotice}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">{goal.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title={t.actions.edit}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title={t.actions.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs opacity-70 leading-relaxed mb-4">{goal.description}</p>
                  )}

                  {/* Progress Bar & Details */}
                  <div className="space-y-1.5 mb-5 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        {goal.calculationType === 'milestone' ? t.goals.byMilestones : t.goals.manual}
                      </span>
                      <span className="font-extrabold text-violet-400 text-sm">
                        {goal.progress}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>موعد: {formatDate(goal.targetDate, language)}</span>
                      </span>
                      <span>
                        {goal.milestones.filter((m) => m.completed).length} از {goal.milestones.length}{' '}
                        مایل‌استون تکمیل شده
                      </span>
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      {t.goals.milestones}
                    </span>

                    {goal.milestones.length === 0 ? (
                      <p className="text-xs opacity-50 italic">هنوز مایل‌استونی تعریف نشده است.</p>
                    ) : (
                      <div className="space-y-2">
                        {goal.milestones.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => toggleMilestone(goal.id, m.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                              m.completed
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800/20 border-slate-700/40 hover:bg-slate-800/50'
                            }`}
                          >
                            <button
                              type="button"
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                m.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-600'
                              }`}
                            >
                              {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <span className={m.completed ? 'line-through opacity-70' : 'font-medium'}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Quick Add Milestone */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newMilestoneTitles[goal.id] || ''}
                        onChange={(e) =>
                          setNewMilestoneTitles((prev) => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMilestone(goal.id);
                          }
                        }}
                        placeholder="افزودن گام اجرایی جدید..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/50 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleAddMilestone(goal.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 shrink-0 cursor-pointer"
                      >
                        {t.actions.add}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Associated Tasks Footer */}
                <div className="pt-4 border-t border-inherit flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{linkedTasks.length} کار مرتبط</span>
                  </span>

                  <button
                    onClick={() => openNewTaskModal(goal.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    + افزودن کار برای این هدف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="حذف هدف"
        message={t.goals.deleteConfirm}
        confirmText={t.actions.delete}
      />
    </div>
  );
};
