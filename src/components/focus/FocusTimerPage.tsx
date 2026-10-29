import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { getTodayDateString, formatDateTime } from '../../utils/dateUtils';

type TimerMode = 'work' | 'short_break' | 'long_break';

export const FocusTimerPage: React.FC = () => {
  const {
    t,
    settings,
    tasks,
    addFocusSession,
    focusSessions,
    todayFocusMinutes,
    theme,
  } = useApp();

  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled ?? true);

  // Time remaining in seconds
  const modeDurationSeconds = useMemo(() => {
    if (mode === 'work') return (settings.pomodoroWorkDuration || 25) * 60;
    if (mode === 'short_break') return (settings.pomodoroShortBreak || 5) * 60;
    return (settings.pomodoroLongBreak || 15) * 60;
  }, [mode, settings]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(modeDurationSeconds);

  // References for resilient timestamp-based countdown
  const timerEndTimestampRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play gentle completion chime via Web Audio API (zero external assets needed)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic chime chord
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.4); // G5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio might be blocked without initial gesture
    }
  };

  // Reset timer when switching modes
  useEffect(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerEndTimestampRef.current = null;
    setSecondsRemaining(modeDurationSeconds);
  }, [mode, modeDurationSeconds]);

  // Handle countdown interval and tab change resilience
  useEffect(() => {
    if (isRunning) {
      if (!timerEndTimestampRef.current) {
        timerEndTimestampRef.current = Date.now() + secondsRemaining * 1000;
      }

      intervalRef.current = setInterval(() => {
        if (!timerEndTimestampRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.round((timerEndTimestampRef.current - now) / 1000));

        setSecondsRemaining(diff);

        if (diff <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          timerEndTimestampRef.current = null;
          handleSessionComplete();
        }
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timerEndTimestampRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleSessionComplete = () => {
    playChime();

    if (mode === 'work') {
      const selectedTask = tasks.find((t) => t.id === selectedTaskId);
      const duration = settings.pomodoroWorkDuration || 25;

      addFocusSession({
        taskId: selectedTaskId || null,
        taskTitle: selectedTask ? selectedTask.title : null,
        durationMinutes: duration,
        completedAt: new Date().toISOString(),
        mode: 'work',
      });

      // Auto propose short break
      setMode('short_break');
    } else {
      setMode('work');
    }
  };

  const handleStart = () => {
    timerEndTimestampRef.current = Date.now() + secondsRemaining * 1000;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    timerEndTimestampRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    timerEndTimestampRef.current = null;
    setSecondsRemaining(modeDurationSeconds);
  };

  // Calculations for display
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((modeDurationSeconds - secondsRemaining) / modeDurationSeconds) * 100))
  );

  const todayStr = getTodayDateString();
  const todaySessions = focusSessions.filter((s) => s.completedAt.startsWith(todayStr));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.focus.title}</h1>
          <p className="text-sm opacity-70 mt-1">{t.focus.subtitle}</p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto ${
            soundEnabled
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
              : 'border-slate-700 text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? 'صدا فعال' : 'بی‌صدا'}</span>
        </button>
      </div>

      {/* Main Timer Display Card */}
      <div
        className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800'
            : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
        }`}
      >
        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl border border-slate-700/50 bg-slate-800/40 mb-8 max-w-md w-full">
          <button
            onClick={() => setMode('work')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'work'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.focus.workSession}
          </button>
          <button
            onClick={() => setMode('short_break')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.focus.shortBreak}
          </button>
          <button
            onClick={() => setMode('long_break')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.focus.longBreak}
          </button>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* SVG ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              stroke={
                mode === 'work' ? '#6366f1' : mode === 'short_break' ? '#10b981' : '#8b5cf6'
              }
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight">
              {formattedTime}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-bold">
              {mode === 'work' ? 'تمرکز عمیق' : 'استراحت'}
            </span>
          </div>
        </div>

        {/* Associated Task Selection */}
        <div className="mt-6 mb-8 max-w-sm w-full text-start">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70 text-center">
            {t.focus.linkToTask}
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isRunning}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            } disabled:opacity-50`}
          >
            <option value="">{t.focus.noLinkedTask}</option>
            {tasks
              .filter((t) => t.status !== 'completed')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-700/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={t.focus.reset}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base shadow-xl transition-all cursor-pointer hover:scale-105 ${
                mode === 'work'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : mode === 'short_break'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.focus.start}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base bg-amber-600 hover:bg-amber-500 shadow-xl shadow-amber-600/30 transition-all cursor-pointer hover:scale-105"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>{t.focus.pause}</span>
            </button>
          )}
        </div>

        {/* Resilient notice footer */}
        <div className="mt-8 flex items-center gap-2 text-xs opacity-60">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t.focus.tabSwitchNotice}</span>
        </div>
      </div>

      {/* Today's Focus History List */}
      <div
        className={`p-6 rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">{t.focus.todayCompletedSessions}</h3>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {t.focus.totalFocusToday}: {todayFocusMinutes} {t.dashboard.minutesUnit}
          </span>
        </div>

        {todaySessions.length === 0 ? (
          <p className="text-xs opacity-60 text-center py-6">
            هنوز جلسه تمرکزی برای امروز ثبت نشده است. اولین بلاک کاری را شروع کنید!
          </p>
        ) : (
          <div className="space-y-2.5">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block">
                      {session.taskTitle || 'تمرکز عمومی آزاد'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(session.completedAt)}
                    </span>
                  </div>
                </div>
                <span className="font-bold font-mono text-indigo-400">
                  +{session.durationMinutes} دقیقه
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
