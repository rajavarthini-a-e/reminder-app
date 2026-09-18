import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';
import { aiService } from '../services/ai.service.js';

export const mentorRouter = Router();

// GET /api/mentor/chat
mentorRouter.get('/chat', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.json([]);

    const messages = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load chat history', details: err.message });
  }
});

// POST /api/mentor/chat
mentorRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { text, taskId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Alex Rivera', timezone: 'America/New_York' },
      });
    }

    // 1. Save user's message
    const userMsg = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        sender: 'user',
        text: text.trim(),
        taskId: taskId || null,
      },
    });

    // 2. Fetch full curriculum context (active goal, milestone, tasks)
    const activeGoal = await prisma.goal.findFirst({
      where: { userId: user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let targetTask = null;
    if (taskId) {
      targetTask = await prisma.task.findUnique({ where: { id: taskId } });
    } else {
      targetTask = await prisma.task.findFirst({
        where: { completed: false },
        orderBy: { scheduledTime: 'asc' },
      });
    }

    const currentMilestone = activeGoal?.milestones.find((m) => m.tasks.some((t) => !t.completed)) || activeGoal?.milestones[0];
    const upcomingTasks = (currentMilestone?.tasks || []).filter((t) => !t.completed).slice(0, 3);

    let currentTaskContext = '';
    if (activeGoal) {
      currentTaskContext = `Active Goal: "${activeGoal.title}". Current Milestone: "${currentMilestone?.title || 'Phase 1'}". Upcoming Tasks: [${upcomingTasks.map((t) => t.title).join(', ')}].`;
    }
    if (targetTask) {
      currentTaskContext += ` Today's Focus Task: "${targetTask.title}" (${targetTask.verificationType}, topic: ${targetTask.topic || targetTask.title}).`;
    }

    // 3. Check if user is reporting completion
    const isDoneIntent = /(done|completed|finished|i finished|solved it)/i.test(text);

    let mentorReplyText = '';
    let actionRequired: string | null = null;
    let verificationQuestion: string | null = null;

    if (isDoneIntent && targetTask && !targetTask.completed) {
      // Trigger verification challenge right inside chat!
      verificationQuestion = await aiService.generateVerificationQuestion(
        targetTask.title,
        targetTask.topic || undefined,
        targetTask.verificationType,
        targetTask.sourceContext || undefined
      );

      mentorReplyText = `You claim you are finished with "${targetTask.title}". A true professional proves their work before celebrating.\n\nHere is your verification challenge:\n\n👉 **${verificationQuestion}**\n\nProvide your detailed answer or code to verify completion.`;
      actionRequired = 'VERIFY';
    } else {
      // Normal chat response with strict mentor persona
      const recentMessages = await prisma.chatMessage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 8,
      });

      const formattedHistory = recentMessages.reverse().map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      mentorReplyText = await aiService.chatWithMentor(formattedHistory, currentTaskContext);
    }

    // 4. Save mentor's reply
    const mentorMsg = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        sender: 'mentor',
        text: mentorReplyText,
        taskId: targetTask?.id || null,
        actionRequired,
      },
    });

    res.json({
      userMessage: userMsg,
      mentorMessage: mentorMsg,
      actionRequired,
      verificationQuestion,
      taskId: targetTask?.id || null,
    });
  } catch (err: any) {
    console.error('Mentor chat error:', err);
    res.status(500).json({ error: 'Failed to process chat message', details: err.message });
  }
});
