import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client if API key is provided
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// AI Assistant endpoint
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { message, context, mode = 'chat', language = 'fa' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!genAI) {
      // Graceful fallback when GEMINI_API_KEY is not configured
      const isFa = language === 'fa';
      const fallbackReply = isFa
        ? 'کلید Gemini API در تنظیمات سرور شناسایی نشد، اما LifePilot تمام امکانات خود را به طور کامل در اختیارتان قرار می‌دهد. برای استفاده از دستیار زنده هوش مصنوعی، لطفاً متغیر GEMINI_API_KEY را تنظیم کنید.'
        : 'Gemini API key is not configured on the server. However, LifePilot continues to work seamlessly with local management. Set GEMINI_API_KEY to activate live AI generation.';

      res.json({
        text: fallbackReply,
        actions: [],
        isFallback: true,
      });
      return;
    }

    const systemPrompt = `You are LifePilot AI, a wise, empathetic, highly structured personal productivity assistant and coach.
The user language preference is: ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.
Always reply primarily in the requested language (${language === 'fa' ? 'Persian with natural, professional tone' : 'English'}).

Context of the user's workspace:
- Tasks count: ${context?.tasks?.length || 0}
- Active goals count: ${context?.goals?.length || 0}
- Habits tracked: ${context?.habits?.length || 0}
- Recent tasks overview: ${JSON.stringify(context?.tasks?.slice(0, 8) || [])}
- Goals overview: ${JSON.stringify(context?.goals?.slice(0, 5) || [])}
- Focus time today (minutes): ${context?.todayFocusMinutes || 0}

User mode: ${mode} (Options: 'chat', 'breakdown_goal', 'plan_day', 'reorganize_tasks', 'weekly_summary')

Crucial instructions:
1. Provide thoughtful, actionable, concise advice.
2. If the user asks to plan their day, break down a goal, reorganize tasks, or create actionable items, ALWAYS include structured proposals that the user can review and explicitly approve.
3. Structure your response in valid JSON with:
{
  "text": "Your natural language response and explanation",
  "suggestedTasks": [
    {
      "title": "Short title",
      "description": "Optional details",
      "priority": "low" | "medium" | "high",
      "estimatedDuration": 30, // in minutes
      "category": "work" | "study" | "health" | "personal" | "general",
      "suggestedTimeSlot": "09:00 - 09:30" // optional
    }
  ],
  "suggestedMilestones": [
    {
      "goalId": "optional-id",
      "title": "Milestone title"
    }
  ],
  "scheduleAdvice": "Optional short summary of recommended daily schedule blocks"
}

If no specific task or milestone proposals are needed, keep suggestedTasks and suggestedMilestones empty.
Return ONLY valid JSON.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        text: rawText,
        suggestedTasks: [],
        suggestedMilestones: [],
      };
    }

    res.json({
      text: parsedData.text || '',
      suggestedTasks: parsedData.suggestedTasks || [],
      suggestedMilestones: parsedData.suggestedMilestones || [],
      scheduleAdvice: parsedData.scheduleAdvice || null,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: error.message || 'Internal server error while calling Gemini API',
      isFallback: true,
    });
  }
});

// Daily smart suggestion endpoint
app.post('/api/ai/daily-suggestion', async (req: Request, res: Response) => {
  try {
    const { stats, language = 'fa' } = req.body;
    const isFa = language === 'fa';

    if (!genAI) {
      // Meaningful fallback based on statistics
      const completionRate = stats?.totalTasksToday
        ? Math.round((stats.completedTasksToday / stats.totalTasksToday) * 100)
        : 0;
      let text = '';
      if (isFa) {
        if (completionRate >= 80) {
          text = 'عملکرد فوق‌العاده‌ای امروز داشتید! اکنون زمان مناسبی برای استراحت یا آماده‌سازی اولویت‌های فرداست.';
        } else if (stats?.pendingHighPriority > 0) {
          text = `امروز هنوز ${stats.pendingHighPriority} کار با اولویت بالا باقی مانده است. پیشنهاد می‌شود یک بلاک تمرکز ۲۵ دقیقه‌ای برای مهم‌ترین آن‌ها در نظر بگیرید.`;
        } else {
          text = 'روز خود را با اولویت‌بندی ۳ کار اساسی آغاز کنید. تمرکز بر یک کار در هر زمان، بهره‌وری را دوچندان می‌کند.';
        }
      } else {
        if (completionRate >= 80) {
          text = 'Outstanding performance today! A great time to recharge or sketch tomorrow’s primary targets.';
        } else if (stats?.pendingHighPriority > 0) {
          text = `You still have ${stats.pendingHighPriority} high-priority item(s). Consider starting a 25-minute Pomodoro session now.`;
        } else {
          text = 'Start by identifying your top 3 needle-movers for today. Single-tasking beats multitasking every time.';
        }
      }

      res.json({ suggestion: text, isFallback: true });
      return;
    }

    const prompt = `Based on these user stats:
- Tasks today: ${stats?.totalTasksToday || 0} total, ${stats?.completedTasksToday || 0} completed
- Pending high priority tasks: ${stats?.pendingHighPriority || 0}
- Focus minutes today: ${stats?.focusMinutesToday || 0}
- Active habits done: ${stats?.habitsDoneToday || 0} / ${stats?.totalHabits || 0}
Language: ${isFa ? 'Persian (Farsi)' : 'English'}

Provide a 1-2 sentence inspiring, practical productivity tip or observation tailored specifically to their day. Output as JSON: { "suggestion": "string" }`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json({ suggestion: parsed.suggestion, isFallback: false });
    } catch {
      res.json({ suggestion: response.text, isFallback: false });
    }
  } catch (error: any) {
    console.error('Error generating daily suggestion:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

// Vite integration / Static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
