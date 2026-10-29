import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import { getTodayDateString } from '../../utils/dateUtils';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { t, addGoal, updateGoal, theme } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('study');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [calculationType, setCalculationType] = useState<'milestone' | 'manual'>('milestone');
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setCategory(goalToEdit.category);
      setTargetDate(goalToEdit.targetDate);
      setCalculationType(goalToEdit.calculationType);
      setProgress(goalToEdit.progress);
      setMilestones(goalToEdit.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('study');
      const d = new Date();
      d.setMonth(d.getMonth() + 2);
      setTargetDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      setCalculationType('milestone');
      setProgress(0);
      setMilestones([]);
    }
    setError('');
  }, [goalToEdit, isOpen]);

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newMilestoneText.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t.goals.goalTitle + ' الزامی است');
      return;
    }

    let calculatedProgress = progress;
    if (calculationType === 'milestone') {
      if (milestones.length > 0) {
        const completed = milestones.filter((m) => m.completed).length;
        calculatedProgress = Math.round((completed / milestones.length) * 100);
      } else {
        calculatedProgress = 0;
      }
    }

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        calculationType,
        progress: calculatedProgress,
        milestones,
      });
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        calculationType,
        progress: calculatedProgress,
        milestones,
      });
    }

    onClose();
  };

  const inputClasses = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    theme === 'dark'
      ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
  }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? t.goals.editGoal : t.goals.addGoal}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.goals.goalTitle} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.goals.goalTitlePlaceholder}
            className={inputClasses}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.goals.description}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClasses}
            >
              <option value="study">{t.tasks.categories.study}</option>
              <option value="work">{t.tasks.categories.work}</option>
              <option value="health">{t.tasks.categories.health}</option>
              <option value="personal">{t.tasks.categories.personal}</option>
              <option value="finance">{t.tasks.categories.finance}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.goals.targetDate}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Calculation Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.goals.calculationType}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCalculationType('milestone')}
              className={`p-3 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                calculationType === 'milestone'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                  : 'border-slate-700/50 hover:bg-slate-800/40 opacity-70'
              }`}
            >
              {t.goals.byMilestones}
            </button>
            <button
              type="button"
              onClick={() => setCalculationType('manual')}
              className={`p-3 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                calculationType === 'manual'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                  : 'border-slate-700/50 hover:bg-slate-800/40 opacity-70'
              }`}
            >
              {t.goals.manual}
            </button>
          </div>
        </div>

        {/* Manual Progress Slider if manual */}
        {calculationType === 'manual' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-80">
                {t.goals.progress}
              </label>
              <span className="text-xs font-bold text-indigo-400">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        )}

        {/* Milestones list */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.goals.milestones}
          </label>

          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={() =>
                      setMilestones((prev) =>
                        prev.map((item) =>
                          item.id === m.id ? { ...item, completed: !item.completed } : item
                        )
                      )
                    }
                    className="rounded accent-indigo-600 cursor-pointer"
                  />
                  <span className={m.completed ? 'line-through opacity-60' : ''}>
                    {m.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add milestone inline input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMilestone();
                }
              }}
              placeholder={t.goals.milestonePlaceholder}
              className={inputClasses}
            />
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-700/50 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            {t.actions.cancel}
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {goalToEdit ? t.actions.save : t.actions.create}
          </button>
        </div>
      </form>
    </Modal>
  );
};
