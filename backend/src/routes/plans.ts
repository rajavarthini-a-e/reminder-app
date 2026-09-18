import { Router, Request, Response } from 'express';
import multer from 'multer';
import prisma from '../prisma.js';
import { parserService } from '../services/parser.service.js';
import { ExtractedPlan } from '../types/shared.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

export const plansRouter = Router();

// POST /api/upload-plan
plansRouter.post('/upload-plan', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const rawText = req.body.planText;

    if (!file && (!rawText || rawText.trim().length === 0)) {
      return res.status(400).json({
        error: 'No file or plan text provided',
        message: 'Please upload a PDF, DOCX, Markdown document or paste plan text.',
      });
    }

    const extractedPlan = await parserService.parseFile(
      file?.buffer,
      file?.originalname,
      file?.mimetype,
      rawText
    );

    res.json({
      success: true,
      data: extractedPlan,
    });
  } catch (err: any) {
    console.error('Plan upload parsing failed:', err);
    res.status(500).json({
      error: 'Failed to parse study plan',
      details: err.message,
    });
  }
});

// POST /api/goals/save-plan
// Saves confirmed or edited plan into database
plansRouter.post('/goals/save-plan', async (req: Request, res: Response) => {
  try {
    const plan: ExtractedPlan = req.body;

    if (!plan || !plan.goal || !Array.isArray(plan.milestones)) {
      return res.status(400).json({ error: 'Invalid plan structure' });
    }

    // Default user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Alex Rivera',
          timezone: 'America/New_York',
        },
      });
    }

    const durationDays = plan.duration || 60;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // When a user uploads a new plan, it must fully replace any prior plan — all old tasks, milestones, and alerts must be cleared.
    await prisma.goal.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Create Goal
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: plan.goal,
        description: plan.rawSummary || `Customized ${durationDays}-day accountability curriculum.`,
        startDate,
        endDate,
        deadline: endDate,
        durationDays,
        progress: 0.0,
      },
    });

    let globalDayIndex = 0;

    for (let mIdx = 0; mIdx < plan.milestones.length; mIdx++) {
      const milestoneData = plan.milestones[mIdx];
      const milestoneDueDate = new Date(startDate.getTime() + (mIdx + 1) * 14 * 24 * 60 * 60 * 1000);

      const milestone = await prisma.milestone.create({
        data: {
          goalId: goal.id,
          title: milestoneData.title || `Milestone ${mIdx + 1}`,
          order: mIdx + 1,
          dueDate: milestoneDueDate,
          completed: false,
        },
      });

      for (let tIdx = 0; tIdx < milestoneData.tasks.length; tIdx++) {
        const taskData = milestoneData.tasks[tIdx];
        const taskDayOffset = globalDayIndex++;
        // Schedule task at 8:00 PM (20:00) on day offset
        const scheduledTime = new Date(startDate.getTime() + taskDayOffset * 24 * 60 * 60 * 1000);
        scheduledTime.setHours(20, 0, 0, 0);

        await prisma.task.create({
          data: {
            milestoneId: milestone.id,
            title: taskData.title,
            description: taskData.description || `Module objective for: ${taskData.title}`,
            scheduledTime,
            estimatedMinutes: taskData.estimatedMinutes || 45,
            priority: (taskData.priority as any) || 'MEDIUM',
            reminderInterval: 15,
            completed: false,
            verificationType: (taskData.verificationType as any) || 'LEARNING',
            topic: taskData.topic || taskData.title,
            order: tIdx + 1,
          },
        });
      }
    }

    res.json({
      success: true,
      message: 'Plan saved successfully and accountability schedule activated!',
      goalId: goal.id,
    });
  } catch (err: any) {
    console.error('Error saving plan to database:', err);
    res.status(500).json({ error: 'Failed to save plan', details: err.message });
  }
});

// DELETE /api/goals/active
// Deletes current active goals, milestones, tasks, and verifications to start fresh
plansRouter.delete('/goals/active', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.chatMessage.deleteMany({ where: { userId: user.id } });
      await prisma.verification.deleteMany({});
      await prisma.reminder.deleteMany({});
      await prisma.task.deleteMany({});
      await prisma.milestone.deleteMany({});
      await prisma.goal.deleteMany({
        where: { userId: user.id },
      });
    }
    res.json({ success: true, message: 'All active goals, tasks, and roadmaps cleared successfully' });
  } catch (err: any) {
    console.error('Error deleting active goal:', err);
    res.status(500).json({ error: 'Failed to delete active goal', details: err.message });
  }
});

// POST /api/goals/reset
// Resets all completed tasks, progress, and verifications for the active goal to start fresh from Day 1
plansRouter.post('/goals/reset', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activeGoal = await prisma.goal.findFirst({
      where: { userId: user.id },
      include: { milestones: { include: { tasks: true } } },
    });

    if (activeGoal) {
      await prisma.goal.update({
        where: { id: activeGoal.id },
        data: { progress: 0.0 },
      });

      await prisma.milestone.updateMany({
        where: { goalId: activeGoal.id },
        data: { completed: false },
      });

      const milestoneIds = activeGoal.milestones.map((m) => m.id);
      await prisma.task.updateMany({
        where: { milestoneId: { in: milestoneIds } },
        data: { completed: false },
      });

      await prisma.verification.deleteMany({});
      await prisma.reminder.deleteMany({});
    }

    res.json({ success: true, message: 'Goal reset to Day 1 successfully' });
  } catch (err: any) {
    console.error('Error resetting active goal:', err);
    res.status(500).json({ error: 'Failed to reset active goal', details: err.message });
  }
});
