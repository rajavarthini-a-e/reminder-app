import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';
import { browserChannel } from '../services/notification/browser.channel.js';
import { reminderService } from '../services/reminder.service.js';
import { notificationService } from '../services/notification/notification.service.js';
import { EscalationLevel } from '../types/shared.js';

export const remindersRouter = Router();

// GET /api/reminders/active
remindersRouter.get('/active', async (req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        acknowledged: false,
        task: {
          completed: false,
        },
      },
      include: {
        task: {
          include: {
            milestone: {
              include: { goal: true },
            },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: 10,
    });

    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch active reminders', details: err.message });
  }
});

// POST /api/reminders/:id/acknowledge
remindersRouter.post('/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: { acknowledged: true },
    });

    res.json({ success: true, reminder });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to acknowledge reminder', details: err.message });
  }
});

// GET /api/reminders/stream (Server-Sent Events for real-time push to frontend)
remindersRouter.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected heartbeat
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date() })}\n\n`);

  const unregister = browserChannel.registerClient(res);

  req.on('close', () => {
    unregister();
  });
});

// POST /api/reminders/test-alert
// Triggers an instant test escalation alert (Levels 1 to 4) for immediate visual & sound verification
remindersRouter.post('/test-alert', async (req: Request, res: Response) => {
  try {
    const level = (parseInt(req.body.level || '1', 10) as EscalationLevel) || 1;
    const task = await prisma.task.findFirst({
      where: { completed: false },
    });

    const taskTitle = task?.title || 'Daily High-Focus Session';
    const message = reminderService.getEscalationMessage(level, taskTitle, level * 20);

    await notificationService.notifyAll({
      id: `test_alert_${Date.now()}`,
      taskId: task?.id || 'sample-task',
      taskTitle,
      escalationLevel: level,
      message,
      scheduledTime: new Date(),
      estimatedMinutes: 45,
      priority: level === 4 ? 'CRITICAL' : 'HIGH',
      soundAlert: '',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Triggered Level ${level} test alert.`,
      escalationLevel: level,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to trigger test alert', details: err.message });
  }
});
