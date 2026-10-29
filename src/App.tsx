/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TasksPage } from './components/tasks/TasksPage';
import { GoalsPage } from './components/goals/GoalsPage';
import { PlannerPage } from './components/planner/PlannerPage';
import { HabitsPage } from './components/habits/HabitsPage';
import { FocusTimerPage } from './components/focus/FocusTimerPage';
import { AIAssistantPage } from './components/ai/AIAssistantPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { SettingsPage } from './components/settings/SettingsPage';

// Quick Modals
import { TaskModal } from './components/tasks/TaskModal';
import { GoalModal } from './components/goals/GoalModal';

function MainAppShell() {
  const {
    activePage,
    isTaskModalOpen,
    setIsTaskModalOpen,
    taskModalGoalId,
    isGoalModalOpen,
    setIsGoalModalOpen,
    language,
    theme,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRTL = language === 'fa';

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tasks':
        return <TasksPage />;
      case 'goals':
        return <GoalsPage />;
      case 'planner':
        return <PlannerPage />;
      case 'habits':
        return <HabitsPage />;
      case 'focus':
        return <FocusTimerPage />;
      case 'ai':
        return <AIAssistantPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sidebar navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content wrapper with responsive margins for sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isRTL ? 'lg:mr-64' : 'lg:ml-64'
        }`}
      >
        <Navbar onOpenMobile={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 mb-16 lg:mb-0">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileNav />

      {/* Global Quick Action Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultGoalId={taskModalGoalId}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
