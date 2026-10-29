import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const COLOR_PRESETS = [
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
}) => {
  const { t, addHabit, updateHabit, theme } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [category, setCategory] = useState('health');
  const [color, setColor] = useState('#8b5cf6');
  const [error, setError] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setFrequency(habitToEdit.frequency);
      setTargetDaysPerWeek(habitToEdit.targetDaysPerWeek || 7);
      setCategory(habitToEdit.category);
      setColor(habitToEdit.color || '#8b5cf6');
    } else {
      setTitle('');
      setDescription('');
      setFrequency('daily');
      setTargetDaysPerWeek(7);
      setCategory('health');
      setColor('#8b5cf6');
    }
    setError('');
  }, [habitToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t.habits.habitTitle + ' الزامی است');
      return;
    }

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        frequency,
        targetDaysPerWeek: frequency === 'daily' ? 7 : targetDaysPerWeek,
        category,
        color,
      });
    } else {
      addHabit({
        title: title.trim(),
        description: description.trim(),
        frequency,
        targetDaysPerWeek: frequency === 'daily' ? 7 : targetDaysPerWeek,
        category,
        color,
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
      title={habitToEdit ? t.habits.editHabit : t.habits.addHabit}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.habits.habitTitle} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.habits.habitPlaceholder}
            className={inputClasses}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.tasks.description}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.habits.frequency}
            </label>
            <select
              value={frequency}
              onChange={(e) => {
                const val = e.target.value as 'daily' | 'weekly';
                setFrequency(val);
                if (val === 'daily') setTargetDaysPerWeek(7);
              }}
              className={inputClasses}
            >
              <option value="daily">{t.habits.daily}</option>
              <option value="weekly">{t.habits.weekly}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClasses}
            >
              <option value="health">{t.tasks.categories.health}</option>
              <option value="study">{t.tasks.categories.study}</option>
              <option value="work">{t.tasks.categories.work}</option>
              <option value="personal">{t.tasks.categories.personal}</option>
            </select>
          </div>
        </div>

        {frequency === 'weekly' && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-80">
                {t.habits.targetDays}
              </label>
              <span className="text-xs font-bold text-indigo-400">
                {targetDaysPerWeek} {t.habits.days}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={targetDaysPerWeek}
              onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        )}

        {/* Color picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
            رنگ نشانگر عادت
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
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
            {habitToEdit ? t.actions.save : t.actions.create}
          </button>
        </div>
      </form>
    </Modal>
  );
};
