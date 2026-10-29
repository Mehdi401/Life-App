import React from 'react';
import { LayoutDashboard, CheckSquare, Target, CalendarDays, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivePage } from '../../types';

export const MobileNav: React.FC = () => {
  const { activePage, setActivePage, t, theme, tasks } = useApp();

  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  const items: Array<{
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    highlight?: boolean;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'tasks', label: t.nav.tasks, icon: CheckSquare, badge: pendingTasks },
    { id: 'goals', label: t.nav.goals, icon: Target },
    { id: 'planner', label: t.nav.planner, icon: CalendarDays },
    { id: 'ai', label: t.nav.ai, icon: Sparkles, highlight: true },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 px-2 border-t lg:hidden backdrop-blur-lg ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-400'
          : 'bg-white/90 border-slate-200 text-slate-600'
      }`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors relative cursor-pointer ${
              isActive
                ? item.highlight
                  ? 'text-violet-400 font-bold'
                  : 'text-indigo-400 font-bold'
                : 'hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -end-2 w-4 h-4 text-[10px] font-bold rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
