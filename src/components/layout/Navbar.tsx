import React from 'react';
import { Menu, Sun, Moon, Globe, Plus, Timer, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getHeaderCurrentDate } from '../../utils/dateUtils';

interface NavbarProps {
  onOpenMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobile }) => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    t,
    openNewTaskModal,
    setActivePage,
    todayFocusMinutes,
  } = useApp();

  const currentDate = getHeaderCurrentDate(language);

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b transition-colors backdrop-blur-md ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-800/80 text-slate-100'
          : 'bg-white/80 border-slate-200/80 text-slate-900'
      }`}
    >
      {/* Left side (or Right in RTL) */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobile}
          className={`p-2 rounded-xl lg:hidden transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Date Display */}
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-200 dark:text-slate-200 light:text-slate-800">
            {currentDate}
          </span>
          <span className="text-[11px] text-indigo-400 font-medium hidden sm:block">
            {language === 'fa' ? 'فضای کاری لایف‌پایلوت' : 'LifePilot Workspace'}
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Focus Timer Status Shortcut */}
        <button
          onClick={() => setActivePage('focus')}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            todayFocusMinutes > 0
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : theme === 'dark'
              ? 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={t.focus.title}
        >
          <Timer className="w-4 h-4 text-emerald-400" />
          <span>
            {todayFocusMinutes > 0
              ? `${todayFocusMinutes} ${t.dashboard.minutesUnit}`
              : t.actions.startFocus}
          </span>
        </button>

        {/* AI Quick Button */}
        <button
          onClick={() => setActivePage('ai')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 border border-violet-500/30 hover:border-violet-500/60 transition-all cursor-pointer"
          title={t.nav.ai}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span className="hidden md:inline">{t.nav.ai}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
              : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
          title="Switch Language / تغییر زبان"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-slate-800 hover:bg-slate-800 text-amber-400'
              : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t.dashboard.createNewTask}</span>
        </button>
      </div>
    </header>
  );
};
