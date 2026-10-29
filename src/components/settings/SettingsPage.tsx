import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileJson,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const {
    t,
    settings,
    updateSettings,
    resetSampleData,
    clearAllData,
    importBackup,
    theme,
    setTheme,
    language,
    setLanguage,
  } = useApp();

  const [userName, setUserName] = useState(settings.userName || 'مهدی');
  const [workDuration, setWorkDuration] = useState(settings.pomodoroWorkDuration || 25);
  const [shortBreak, setShortBreak] = useState(settings.pomodoroShortBreak || 5);
  const [longBreak, setLongBreak] = useState(settings.pomodoroLongBreak || 15);
  const [workStart, setWorkStart] = useState(settings.workStartHour || 8);
  const [workEnd, setWorkEnd] = useState(settings.workEndHour || 18);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dialogs
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || 'کاربر',
      pomodoroWorkDuration: Number(workDuration) || 25,
      pomodoroShortBreak: Number(shortBreak) || 5,
      pomodoroLongBreak: Number(longBreak) || 15,
      workStartHour: Number(workStart) || 8,
      workEndHour: Number(workEnd) || 18,
      soundEnabled,
    });
    showToast('success', t.settings.saveSuccess);
  };

  // Export full JSON backup
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifepilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'فایل پشتیبان کامل JSON با موفقیت دریافت شد.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvStr = StorageService.exportTasksAsCSV();
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifepilot-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'فایل اکسل/CSV کارها با موفقیت دریافت شد.');
  };

  // File Upload JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = importBackup(content);
        if (ok) {
          showToast('success', t.settings.importSuccess);
        } else {
          showToast('error', t.settings.importError);
        }
      } catch {
        showToast('error', t.settings.importError);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const inputClasses = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    theme === 'dark'
      ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
  }`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.settings.title}</h1>
        <p className="text-sm opacity-70 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Section 1: Appearance & Language */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-bold text-base mb-4 pb-2 border-b border-inherit">
            {t.settings.appearance}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Theme */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
                {t.settings.theme}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                      : 'border-slate-700/50 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>تیره (Navy)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600'
                      : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>روشن</span>
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
                {t.settings.language}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('fa')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    language === 'fa'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                      : 'border-slate-700/50 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>فارسی (RTL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                      : 'border-slate-700/50 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>English (LTR)</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {t.settings.userName}
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Section 2: Pomodoro & Working Hours Configuration */}
        <div
          className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-bold text-base mb-4 pb-2 border-b border-inherit">
            {t.settings.pomodoroSettings}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {t.settings.workDuration}
              </label>
              <input
                type="number"
                min="5"
                max="90"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {t.settings.shortBreakDuration}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {t.settings.longBreakDuration}
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
          </div>

          <h3 className="font-bold text-base mb-4 mt-6 pb-2 border-b border-inherit">
            {t.settings.workingHoursConfig}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {t.settings.workStart} (0-23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={workStart}
                onChange={(e) => setWorkStart(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {t.settings.workEnd} (0-23)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={workEnd}
                onChange={(e) => setWorkEnd(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="pt-5 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {t.actions.save}
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Data Management & Backup */}
      <div
        className={`p-6 rounded-2xl border space-y-5 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 pb-2 border-b border-inherit">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base">{t.settings.dataManagement}</h3>
        </div>

        {/* Clear Storage Loss Warning */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
          <p className="font-bold mb-1">اطلاعیه مهم ذخیره‌سازی محلی:</p>
          <p>{t.settings.dataNotice}</p>
        </div>

        {/* Export / Import Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-violet-400" />
            <span>{t.settings.exportJson}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.settings.exportCsv}</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 text-xs font-bold text-slate-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>{t.settings.importJson}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Destructive Actions */}
        <div className="pt-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settings.resetSample}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.settings.clearAll}</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetSampleData();
          showToast('success', 'داده‌های نمونه اولیه با موفقیت بازنشانی شدند.');
        }}
        title={t.settings.resetConfirmTitle}
        message={t.settings.resetConfirmMsg}
        confirmText={t.actions.reset}
        isDestructive={false}
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => {
          clearAllData();
          showToast('success', 'تمام اطلاعات برنامه با موفقیت پاک شدند.');
        }}
        title={t.settings.clearConfirmTitle}
        message={t.settings.clearConfirmMsg}
        confirmText={t.actions.delete}
        isDestructive={true}
      />
    </div>
  );
};
