import prisma from '../prisma.js';
import { BehaviorInsight } from '../types/shared.js';

export class BehaviorService {
  /**
   * Log task completion and evaluate behavioral patterns
   */
  public async logTaskCompletion(userId: string, taskId: string, completedMinutes: number): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { milestone: { include: { goal: true } } },
    });

    if (!task) return;

    const behavior = await prisma.behavior.findUnique({
      where: { userId },
    });

    const currentStreak = (behavior?.streak || 0) + 1;
    const bestStreak = Math.max(currentStreak, behavior?.bestStreak || 0);
    const now = new Date();
    const completionHour = now.getHours();

    let insights: BehaviorInsight[] = [];
    try {
      insights = behavior?.insightsJson ? JSON.parse(behavior.insightsJson) : [];
    } catch {
      insights = [];
    }

    // Pattern 1: Evening study habit detection
    if (completionHour >= 19 && completionHour <= 23) {
      const hasTimingInsight = insights.some(i => i.type === 'TIMING');
      if (!hasTimingInsight) {
        insights.unshift({
          type: 'TIMING',
          title: 'Prime Focus Window: 8:00 PM',
          detail: `You have completed multiple high-focus tasks between 7 PM and 11 PM. Complex modules are optimized for your evening momentum.`,
          timestamp: now.toISOString(),
        });
      }
    }

    // Pattern 2: Finished early reward / recommendation
    if (completedMinutes < task.estimatedMinutes - 10) {
      insights.unshift({
        type: 'RECOMMENDATION',
        title: 'Ahead of Schedule Pacing',
        detail: `You completed "${task.title}" ${task.estimatedMinutes - completedMinutes} minutes faster than estimated. Tomorrow's topic has been unlocked early for preview.`,
        timestamp: now.toISOString(),
      });
    }

    // Cap insights to most relevant 6
    insights = insights.slice(0, 6);

    await prisma.behavior.upsert({
      where: { userId },
      create: {
        userId,
        streak: currentStreak,
        bestStreak,
        lastActiveDate: now,
        insightsJson: JSON.stringify(insights),
      },
      update: {
        streak: currentStreak,
        bestStreak,
        lastActiveDate: now,
        insightsJson: JSON.stringify(insights),
      },
    });

    // Update goal and milestone progress
    await this.updateProgressHierarchy(task.milestone.goalId, task.milestoneId);
  }

  /**
   * Recalculates Milestone and Goal progress percentages rolling upward
   */
  public async updateProgressHierarchy(goalId: string, milestoneId: string): Promise<void> {
    // 1. Update Milestone
    const milestoneTasks = await prisma.task.findMany({
      where: { milestoneId },
    });

    const completedMilestoneTasks = milestoneTasks.filter(t => t.completed);
    const isMilestoneDone = milestoneTasks.length > 0 && completedMilestoneTasks.length === milestoneTasks.length;

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { completed: isMilestoneDone },
    });

    // 2. Update Goal overall progress
    const allGoalTasks = await prisma.task.findMany({
      where: {
        milestone: { goalId },
      },
    });

    if (allGoalTasks.length > 0) {
      const allCompleted = allGoalTasks.filter(t => t.completed).length;
      const progressPercent = Math.round((allCompleted / allGoalTasks.length) * 1000) / 10; // e.g. 23.5%

      await prisma.goal.update({
        where: { id: goalId },
        data: { progress: progressPercent },
      });
    }
  }

  /**
   * Log task postponement / skip and generate adaptation if needed
   */
  public async logTaskPostpone(userId: string, taskId: string, reason?: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) return;

    const behavior = await prisma.behavior.findUnique({ where: { userId } });
    const skippedCount = (behavior?.skippedCount || 0) + 1;

    let insights: BehaviorInsight[] = [];
    try {
      insights = behavior?.insightsJson ? JSON.parse(behavior.insightsJson) : [];
    } catch {
      insights = [];
    }

    if (skippedCount >= 2 && !insights.some(i => i.type === 'ADAPTATION')) {
      insights.unshift({
        type: 'ADAPTATION',
        title: 'Adaptive Workload Splitting',
        detail: `Repeated delays detected on "${task.title}". The mentor has recalibrated tomorrow's session into two micro-blocks to reduce friction.`,
        timestamp: new Date().toISOString(),
      });
    }

    insights = insights.slice(0, 6);

    await prisma.behavior.upsert({
      where: { userId },
      create: {
        userId,
        skippedCount,
        insightsJson: JSON.stringify(insights),
      },
      update: {
        skippedCount,
        insightsJson: JSON.stringify(insights),
      },
    });
  }
}

export const behaviorService = new BehaviorService();
