import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Check,
  RefreshCw,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIMessage } from '../../types';
import { StorageService } from '../../services/storage';
import { AIService } from '../../services/aiService';

export const AIAssistantPage: React.FC = () => {
  const {
    t,
    tasks,
    goals,
    habits,
    todayFocusMinutes,
    addTask,
    addMilestoneToGoal,
    theme,
    language,
  } = useApp();

  const [messages, setMessages] = useState<AIMessage[]>(() => StorageService.getAIChatHistory());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedProposals, setAppliedProposals] = useState<{ [msgId: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    StorageService.saveAIChatHistory(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    { label: t.ai.prompts.planDay, mode: 'plan_day' as const },
    { label: t.ai.prompts.breakGoal, mode: 'breakdown_goal' as const },
    { label: t.ai.prompts.reorganize, mode: 'reorganize_tasks' as const },
    { label: t.ai.prompts.weeklyReview, mode: 'weekly_summary' as const },
  ];

  const handleSendMessage = async (textToSend?: string, promptMode?: any) => {
    const message = (textToSend || inputText).trim();
    if (!message || isLoading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await AIService.sendMessage({
        message,
        language,
        mode: promptMode || 'chat',
        context: {
          tasks,
          goals,
          habits,
          todayFocusMinutes,
        },
      });

      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toISOString(),
        isFallback: response.isFallback,
        proposals: {
          suggestedTasks: response.suggestedTasks || [],
          suggestedMilestones: response.suggestedMilestones || [],
          scheduleAdvice: response.scheduleAdvice || undefined,
          applied: false,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // In case of error
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: 'متأسفانه در برقراری ارتباط با سرور هوش مصنوعی مشکلی رخ داد. لطفاً مجدداً تلاش کنید.',
        timestamp: new Date().toISOString(),
        isFallback: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyProposal = (msg: AIMessage) => {
    if (!msg.proposals) return;

    // Apply tasks
    if (msg.proposals.suggestedTasks && msg.proposals.suggestedTasks.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      msg.proposals.suggestedTasks.forEach((sTask) => {
        addTask({
          title: sTask.title,
          description: sTask.description || '',
          priority: sTask.priority || 'medium',
          status: 'todo',
          dueDate: today,
          estimatedDuration: sTask.estimatedDuration || 30,
          category: sTask.category || 'general',
          timeSlot: sTask.suggestedTimeSlot || null,
        });
      });
    }

    // Apply milestones if associated with a goal
    if (msg.proposals.suggestedMilestones && msg.proposals.suggestedMilestones.length > 0) {
      msg.proposals.suggestedMilestones.forEach((sMilestone) => {
        const targetGoal = goals.find((g) => g.id === sMilestone.goalId) || goals[0];
        if (targetGoal) {
          addMilestoneToGoal(targetGoal.id, sMilestone.title);
        }
      });
    }

    setAppliedProposals((prev) => ({ ...prev, [msg.id]: true }));
  };

  const handleClearChat = () => {
    StorageService.clearAIChatHistory();
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t.ai.title}</h1>
            <p className="text-xs opacity-70">{t.ai.subtitle}</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.ai.clearChat}</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pe-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bot className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="font-extrabold text-lg">سلام! من LifePilot AI هستم</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                می‌توانم به شما در برنامه‌ریزی روزانه، تجزیه اهداف، اولویت‌بندی وظایف و بهینه‌سازی زمان کمک کنم. روی یکی از درخواست‌های پیشنهادی کلیک کنید یا سوال خود را بنویسید.
              </p>
            </div>

            {/* Quick Starter Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.label, p.mode)}
                  className="p-3 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 bg-slate-800/30 hover:bg-slate-800/60 text-xs font-medium text-start transition-all cursor-pointer text-slate-300"
                >
                  ✨ {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const hasProposals =
              msg.proposals &&
              ((msg.proposals.suggestedTasks && msg.proposals.suggestedTasks.length > 0) ||
                (msg.proposals.suggestedMilestones &&
                  msg.proposals.suggestedMilestones.length > 0));
            const isApplied = appliedProposals[msg.id] || msg.proposals?.applied;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ms-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-violet-600/20 border border-violet-500/30 text-violet-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body Card */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm space-y-3 leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                        LifePilot AI
                      </span>
                      {msg.isFallback && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          آفلاین
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Structured Action Proposal Review Card */}
                  {!isUser && hasProposals && (
                    <div className="mt-3 p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-violet-300">
                          {t.ai.proposalsTitle}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                          پیش‌نویس ساختاریافته
                        </span>
                      </div>

                      {/* Suggested Tasks */}
                      {msg.proposals?.suggestedTasks &&
                        msg.proposals.suggestedTasks.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {t.ai.suggestedTasksTitle}
                            </span>
                            {msg.proposals.suggestedTasks.map((st, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-xs"
                              >
                                <span className="font-medium truncate max-w-[200px]">
                                  {st.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400">
                                    {st.estimatedDuration} دقیقه
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                                    {st.priority}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Suggested Milestones */}
                      {msg.proposals?.suggestedMilestones &&
                        msg.proposals.suggestedMilestones.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {t.ai.suggestedMilestonesTitle}
                            </span>
                            {msg.proposals.suggestedMilestones.map((sm, i) => (
                              <div
                                key={i}
                                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-xs flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                <span>{sm.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Confirm & Apply button */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] opacity-60">{t.ai.aiDisclaimer}</span>
                        {isApplied ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.ai.appliedSuccess}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyProposal(msg)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.ai.applyToWorkspace}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div
              className={`rounded-2xl p-4 text-xs font-medium flex items-center gap-2.5 ${
                theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
              <span>{t.ai.thinking}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-3 border-t border-slate-800/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.ai.chatPlaceholder}
            disabled={isLoading}
            className={`w-full ps-4 pe-14 py-3 rounded-2xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-violet-500/40 ${
              theme === 'dark'
                ? 'bg-slate-900/90 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute end-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
