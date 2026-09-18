import prisma from '../prisma.js';
import { EscalationLevel } from '../types/shared.js';
import { notificationService } from './notification/notification.service.js';

export class ReminderService {
  /**
   * Determine escalation level based on minutes overdue
   */
  public getEscalationLevel(minutesOverdue: number): EscalationLevel {
    if (minutesOverdue < 15) return 1;
    if (minutesOverdue < 30) return 2;
    if (minutesOverdue < 60) return 3;
    return 4;
  }

  /**
   * Craft escalating mentor notification copy
   */
  public getEscalationMessage(level: EscalationLevel, taskTitle: string, minutesOverdue: number): string {
    switch (level) {
      case 1:
        return `Friendly nudge: Time for "${taskTitle}". Consistency is how goals become reality!`;
      case 2:
        return `⚠️ Still pending (${minutesOverdue}m past): "${taskTitle}". Don't let hesitation break your stride.`;
      case 3:
        return `🛑 STRICT WARNING: You're losing today's momentum on "${taskTitle}". Stop procrastinating. Work now!`;
      case 4:
      default:
        return `🚨 CRITICAL EMERGENCY: "${taskTitle}" must be completed before sleeping! Your entire milestone is at risk. Execute immediately!`;
    }
  }

  /**
   * Process a single due task and escalate if needed
   */
  public async processTaskReminder(taskId: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        milestone: {
          include: { goal: true },
        },
        reminders: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!task || task.completed) return;

    const now = new Date();

    // If snoozed and snooze period is still active, bypass
    if (task.snoozedUntil && new Date(task.snoozedUntil) > now) {
      return;
    }

    const scheduledDate = new Date(task.scheduledTime);
    const minutesOverdue = Math.max(0, Math.floor((now.getTime() - scheduledDate.getTime()) / 60000));
    const targetEscalation = this.getEscalationLevel(minutesOverdue);

    // Check if we already sent a reminder recently (within reminderInterval minutes)
    const lastReminder = task.reminders[0];
    if (lastReminder) {
      const minutesSinceLastReminder = (now.getTime() - new Date(lastReminder.sentAt).getTime()) / 60000;
      // If reminder interval hasn't passed and escalation hasn't increased, skip tick
      if (minutesSinceLastReminder < task.reminderInterval && lastReminder.escalationLevel >= targetEscalation) {
        return;
      }
    }

    const message = this.getEscalationMessage(targetEscalation, task.title, minutesOverdue);

    // Save reminder in database
    const reminder = await prisma.reminder.create({
      data: {
        taskId: task.id,
        sentAt: now,
        escalationLevel: targetEscalation,
        message,
        channel: 'BROWSER',
        acknowledged: false,
      },
    });

    // Update task's active escalation level
    await prisma.task.update({
      where: { id: task.id },
      data: {
        activeEscalationLevel: targetEscalation,
      },
    });

    // Dispatch to all notification channels (Browser SSE, Sound, Webhook)
    await notificationService.notifyAll({
      id: reminder.id,
      taskId: task.id,
      taskTitle: task.title,
      escalationLevel: targetEscalation,
      message,
      scheduledTime: scheduledDate,
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      soundAlert: '',
      timestamp: now.toISOString(),
    });
  }

  /**
   * Snooze a task for specified minutes
   */
  public async snoozeTask(taskId: string, minutes: number): Promise<{ snoozedUntil: Date; taskTitle: string }> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        milestone: {
          include: { goal: { include: { user: true } } },
        },
      },
    });

    if (!task) throw new Error('Task not found');

    const snoozedUntil = new Date(Date.now() + minutes * 60000);

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        snoozedUntil,
      },
    });

    // Increment behavior skipped / snooze count
    const userId = task.milestone.goal.user.id;
    await prisma.behavior.upsert({
      where: { userId },
      create: {
        userId,
        skippedCount: 1,
      },
      update: {
        skippedCount: { increment: 1 },
      },
    });

    return { snoozedUntil, taskTitle: task.title };
  }
}

export const reminderService = new ReminderService();
