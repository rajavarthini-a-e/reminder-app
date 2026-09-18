import cron from 'node-cron';
import prisma from '../prisma.js';
import { reminderService } from './reminder.service.js';

export class SchedulerService {
  private isRunning = false;
  private cronJob: cron.ScheduledTask | null = null;

  public start(): void {
    if (this.isRunning) return;

    console.log('⏰ [SchedulerService] Starting node-cron 1-minute persistent task evaluator...');

    // Run every minute
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.evaluateDueTasks();
    });

    this.isRunning = true;

    // Trigger an initial evaluation immediately on startup
    setTimeout(() => {
      this.evaluateDueTasks().catch((err) =>
        console.error('Initial scheduler evaluation error:', err)
      );
    }, 3000);
  }

  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('🛑 [SchedulerService] Scheduler stopped.');
    }
  }

  public async evaluateDueTasks(): Promise<void> {
    try {
      const now = new Date();

      // Find all due, incomplete tasks
      const dueTasks = await prisma.task.findMany({
        where: {
          completed: false,
          scheduledTime: {
            lte: now,
          },
        },
      });

      if (dueTasks.length > 0) {
        console.log(`⏰ [SchedulerService] Found ${dueTasks.length} pending due task(s) to evaluate.`);
      }

      for (const task of dueTasks) {
        await reminderService.processTaskReminder(task.id);
      }
    } catch (err) {
      console.error('[SchedulerService] Error evaluating due tasks:', err);
    }
  }
}

export const schedulerService = new SchedulerService();
