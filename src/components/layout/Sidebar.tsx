import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  CalendarDays,
  Flame,
  Timer,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivePage } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activePage, setActivePage, t, tasks, goals, theme, language } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const activeGoalsCount = goals.filter((g) => g.progress < 100).length;

  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    highlight?: boolean;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'tasks', label: t.nav.tasks, icon: CheckSquare, badge: pendingTasksCount },
    { id: 'goals', label: t.nav.goals, icon: Target, badge: activeGoalsCount },
    { id: 'planner', label: t.nav.planner, icon: CalendarDays },
    { id: 'habits', label: t.nav.habits, icon: Flame },
    { id: 'focus', label: t.nav.focus, icon: Timer },
    { id: 'ai', label: t.nav.ai, icon: Sparkles, highlight: true },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleNavClick = (id: ActivePage) => {
    setActivePage(id);
    onCloseMobile();
  };

  const isRTL = language === 'fa';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r lg:border-l-0 ${
          isRTL ? 'right-0 border-l lg:border-l lg:border-r-0' : 'left-0 border-r'
        } ${
          theme === 'dark'
            ? 'bg-slate-900/95 border-slate-800 text-slate-200'
            : 'bg-white/95 border-slate-200 text-slate-800'
        } backdrop-blur-md ${
          isMobileOpen
            ? 'translate-x-0 w-72'
            : isRTL
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-inherit">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none overflow-hidden"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                  LifePilot AI
                </span>
                <span className="text-[10px] text-slate-400 truncate font-medium">
                  {t.tagline}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isRTL ? (
              isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer relative group ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : theme === 'dark'
                    ? 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    item.highlight && !isActive ? 'text-violet-400 animate-pulse' : ''
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Badge */}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ms-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip in collapsed mode */}
                {isCollapsed && (
                  <div
                    className={`absolute z-50 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${
                      isRTL ? 'right-full mr-2' : 'left-full ml-2'
                    } ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-inherit">
          <div
            className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${
              theme === 'dark' ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            {!isCollapsed && (
              <span className="truncate">
                {isRTL ? 'داده‌های محلی همگام' : 'Offline local storage synced'}
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
