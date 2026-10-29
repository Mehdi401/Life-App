import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus, TaskCategory } from '../../types';
import { getTodayDateString } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultGoalId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultGoalId,
}) => {
  const { t, addTask, updateTask, goals, theme } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const [category, setCategory] = useState<TaskCategory>('work');
  const [goalId, setGoalId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate || getTodayDateString());
      setEstimatedDuration(taskToEdit.estimatedDuration || 30);
      setCategory(taskToEdit.category || 'work');
      setGoalId(taskToEdit.goalId || null);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate(getTodayDateString());
      setEstimatedDuration(30);
      setCategory('work');
      setGoalId(defaultGoalId || null);
    }
    setError('');
  }, [taskToEdit, defaultGoalId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t.tasks.taskTitle + ' الزامی است');
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        estimatedDuration: Number(estimatedDuration) || 30,
        category,
        goalId: goalId || null,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        estimatedDuration: Number(estimatedDuration) || 30,
        category,
        goalId: goalId || null,
        timeSlot: null,
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
      title={taskToEdit ? t.tasks.editTask : t.tasks.addTask}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {t.tasks.taskTitle} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.tasks.taskTitlePlaceholder}
            className={inputClasses}
            autoFocus
          />
        </div>

        {/* Description */}
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

        {/* Priority & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.priority}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={inputClasses}
            >
              <option value="low">{t.tasks.priorities.low}</option>
              <option value="medium">{t.tasks.priorities.medium}</option>
              <option value="high">{t.tasks.priorities.high}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className={inputClasses}
            >
              <option value="work">{t.tasks.categories.work}</option>
              <option value="study">{t.tasks.categories.study}</option>
              <option value="health">{t.tasks.categories.health}</option>
              <option value="personal">{t.tasks.categories.personal}</option>
              <option value="finance">{t.tasks.categories.finance}</option>
              <option value="general">{t.tasks.categories.general}</option>
            </select>
          </div>
        </div>

        {/* Due Date & Estimated Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.dueDate}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.estimatedDuration}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className={inputClasses}
              />
              <div className="flex gap-1 shrink-0">
                {[15, 25, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setEstimatedDuration(dur)}
                    className={`px-2 py-1 text-xs rounded-lg border font-medium cursor-pointer ${
                      estimatedDuration === dur
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-700/40 hover:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status (if editing) & Linked Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.status}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={inputClasses}
            >
              <option value="todo">{t.tasks.statuses.todo}</option>
              <option value="in_progress">{t.tasks.statuses.in_progress}</option>
              <option value="completed">{t.tasks.statuses.completed}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.tasks.linkedGoal}
            </label>
            <select
              value={goalId || ''}
              onChange={(e) => setGoalId(e.target.value || null)}
              className={inputClasses}
            >
              <option value="">{t.tasks.noGoal}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
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
            {taskToEdit ? t.actions.save : t.actions.create}
          </button>
        </div>
      </form>
    </Modal>
  );
};
