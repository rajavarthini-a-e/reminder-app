import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';
import { reminderService } from '../services/reminder.service.js';
import { aiService } from '../services/ai.service.js';
import { behaviorService } from '../services/behavior.service.js';

export const tasksRouter = Router();

// GET /api/tasks/today
tasksRouter.get('/today', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { completed: false },
          {
            scheduledTime: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        ],
      },
      include: {
        milestone: {
          include: { goal: true },
        },
        reminders: {
          orderBy: { sentAt: 'desc' },
          take: 3,
        },
        verifications: true,
      },
      orderBy: [{ priority: 'desc' }, { scheduledTime: 'asc' }],
    });

    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch today tasks', details: err.message });
  }
});

// GET /api/tasks/:id
tasksRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        milestone: {
          include: { goal: true },
        },
        reminders: {
          orderBy: { sentAt: 'desc' },
        },
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch task', details: err.message });
  }
});

// POST /api/tasks/:id/start
tasksRouter.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Acknowledge outstanding reminders for this task
    await prisma.reminder.updateMany({
      where: { taskId: task.id, acknowledged: false },
      data: { acknowledged: true },
    });

    res.json({ message: 'Task started. Focus on execution!', task });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to start task', details: err.message });
  }
});

// POST /api/tasks/:id/snooze
tasksRouter.post('/:id/snooze', async (req: Request, res: Response) => {
  try {
    const { minutes } = req.body;
    const snoozeMinutes = parseInt(minutes || '15', 10);

    if (isNaN(snoozeMinutes) || snoozeMinutes <= 0) {
      return res.status(400).json({ error: 'Invalid snooze minutes' });
    }

    const result = await reminderService.snoozeTask(req.params.id, snoozeMinutes);
    res.json({
      message: `Task snoozed for ${snoozeMinutes} minutes. Next reminder at ${result.snoozedUntil.toLocaleTimeString()}`,
      snoozedUntil: result.snoozedUntil,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to snooze task', details: err.message });
  }
});

// POST /api/tasks/:id/verify-prompt
// Generates the strict mentor challenge question for this specific task
tasksRouter.post('/:id/verify-prompt', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const question = await aiService.generateVerificationQuestion(
      task.title,
      task.topic || undefined,
      task.verificationType,
      task.sourceContext || undefined
    );

    // Save pending verification record
    const verification = await prisma.verification.create({
      data: {
        taskId: task.id,
        question,
        passed: false,
      },
    });

    res.json({
      taskId: task.id,
      verificationId: verification.id,
      taskTitle: task.title,
      verificationType: task.verificationType,
      question,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate verification question', details: err.message });
  }
});

// POST /api/tasks/:id/verify
// Evaluates the user's answer; ONLY marks completed if verification passes!
tasksRouter.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { answer, question, verificationId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        milestone: {
          include: { goal: { include: { user: true } } },
        },
      },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const promptQuestion = question || 'Explain your solution and core concepts learned.';
    const evalResult = await aiService.evaluateVerificationAnswer(
      promptQuestion,
      answer || '',
      task.title,
      task.topic || undefined,
      task.verificationType
    );

    // Update or create verification entry
    if (verificationId) {
      await prisma.verification.update({
        where: { id: verificationId },
        data: {
          answer,
          feedback: evalResult.feedback,
          passed: evalResult.passed,
          score: evalResult.score,
          verifiedAt: new Date(),
        },
      });
    } else {
      await prisma.verification.create({
        data: {
          taskId: task.id,
          question: promptQuestion,
          answer,
          feedback: evalResult.feedback,
          passed: evalResult.passed,
          score: evalResult.score,
          verifiedAt: new Date(),
        },
      });
    }

    if (evalResult.passed) {
      // Mark task completed!
      const now = new Date();
      await prisma.task.update({
        where: { id: task.id },
        data: {
          completed: true,
          completedAt: now,
          activeEscalationLevel: 1,
        },
      });

      // Acknowledge all pending reminders for this task
      await prisma.reminder.updateMany({
        where: { taskId: task.id },
        data: { acknowledged: true },
      });

      // Update behavioral insights and progress hierarchy
      const userId = task.milestone.goal.user.id;
      await behaviorService.logTaskCompletion(userId, task.id, task.estimatedMinutes);

      return res.json({
        success: true,
        passed: true,
        score: evalResult.score,
        feedback: evalResult.feedback,
        message: 'Mastery verified! Task marked completed.',
      });
    } else {
      return res.status(400).json({
        success: false,
        passed: false,
        score: evalResult.score,
        feedback: evalResult.feedback,
        message: 'Verification failed. A strict mentor will not let you cheat your own future. Please revise your answer.',
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

// POST /api/tasks/:id/complete
// Fallback endpoint: checks if verification has already passed before completing
tasksRouter.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        verifications: {
          where: { passed: true },
          take: 1,
        },
        milestone: {
          include: { goal: { include: { user: true } } },
        },
      },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Mentor enforcement: verification must pass first!
    if (task.verifications.length === 0) {
      return res.status(403).json({
        error: 'Verification required',
        message: 'MentorAI will not mark tasks complete without verified proof. Please answer the mentor verification prompt.',
        requiresVerification: true,
      });
    }

    await prisma.task.update({
      where: { id: task.id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    const userId = task.milestone.goal.user.id;
    await behaviorService.logTaskCompletion(userId, task.id, task.estimatedMinutes);

    res.json({ success: true, message: 'Task marked complete.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to complete task', details: err.message });
  }
});

// POST /api/tasks/:id/toggle
// Allows doing and undoing ticks, matching personal habit flexibility
tasksRouter.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        milestone: {
          include: { goal: { include: { user: true } } },
        },
      },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newCompleted = !task.completed;
    const now = new Date();

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        completed: newCompleted,
        completedAt: newCompleted ? now : null,
        activeEscalationLevel: newCompleted ? 1 : task.activeEscalationLevel,
      },
    });

    if (newCompleted) {
      await prisma.reminder.updateMany({
        where: { taskId: task.id },
        data: { acknowledged: true },
      });
      const userId = task.milestone.goal.user.id;
      await behaviorService.logTaskCompletion(userId, task.id, task.estimatedMinutes);
    }

    res.json({
      success: true,
      completed: newCompleted,
      message: newCompleted ? 'Task marked complete.' : 'Task uncompleted (tick undone).',
      task: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle task', details: err.message });
  }
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.reminder.deleteMany({ where: { taskId: id } });
    await prisma.verification.deleteMany({ where: { taskId: id } });
    await prisma.task.delete({ where: { id } });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});
