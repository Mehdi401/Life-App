import { AIProposal, Task, Goal, Habit } from '../types';

export interface AIAssistantRequest {
  message: string;
  language?: 'fa' | 'en';
  mode?: 'chat' | 'breakdown_goal' | 'plan_day' | 'reorganize_tasks' | 'weekly_summary';
  context?: {
    tasks: Task[];
    goals: Goal[];
    habits: Habit[];
    todayFocusMinutes: number;
  };
}

export interface AIAssistantResponse {
  text: string;
  suggestedTasks?: AIProposal['suggestedTasks'];
  suggestedMilestones?: AIProposal['suggestedMilestones'];
  scheduleAdvice?: string | null;
  isFallback?: boolean;
}

export class AIService {
  static async sendMessage(req: AIAssistantRequest): Promise<AIAssistantResponse> {
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.warn('AIService call failed, using local fallback:', err);
      const isFa = req.language === 'fa';
      return {
        text: isFa
          ? 'ارتباط با سرور هوش مصنوعی برقرار نشد یا درخواست با خطایی مواجه شد. تمام عملکردهای دیگر برنامه به شکل کاملاً آفلاین و پایدار در دسترس شما هستند.'
          : 'Could not connect to the AI server. All workspace features continue to work smoothly in local mode.',
        suggestedTasks: [],
        suggestedMilestones: [],
        isFallback: true,
      };
    }
  }

  static async getDailySuggestion(stats: {
    totalTasksToday: number;
    completedTasksToday: number;
    pendingHighPriority: number;
    focusMinutesToday: number;
    habitsDoneToday: number;
    totalHabits: number;
  }, language: 'fa' | 'en' = 'fa'): Promise<string> {
    try {
      const res = await fetch('/api/ai/daily-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stats, language }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch daily suggestion');
      }

      const data = await res.json();
      return data.suggestion || '';
    } catch {
      // Deterministic client fallback based on real stats
      const rate = stats.totalTasksToday > 0 ? (stats.completedTasksToday / stats.totalTasksToday) * 100 : 0;
      if (language === 'fa') {
        if (rate >= 80) return 'روز درخشانی را پشت سر گذاشتید! استراحت یا برنامه‌ریزی زودهنگام فردا می‌تواند انگیزه شما را حفظ کند.';
        if (stats.pendingHighPriority > 0) return `تمرکز بر ${stats.pendingHighPriority} کار فوری باقی‌مانده در ساعات اوج انرژی، کلید پیشرفت امروز است.`;
        return 'روز خود را با متمرکز شدن بر یک اولویت اصلی آغاز کنید و از چندوظیفگی بپرهیزید.';
      } else {
        if (rate >= 80) return 'Terrific momentum today! Take time to recharge and savor your accomplishments.';
        if (stats.pendingHighPriority > 0) return `Target your ${stats.pendingHighPriority} critical priority item(s) first for maximum impact.`;
        return 'Focus on one high-leverage task at a time to maintain optimal cognitive flow.';
      }
    }
  }
}
