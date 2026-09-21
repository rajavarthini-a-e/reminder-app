import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';
import { scoreService } from '../services/score.service.js';
import { DashboardData } from '../types/shared.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Fetch requested user or fallback to first user
    const authHeader = req.headers.authorization;
    let userId = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.substring(7).trim();
    }
    if (!userId && req.query.userId) {
      userId = String(req.query.userId).trim();
    }

    let user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          include: { behavior: true },
        })
      : null;

    if (!user) {
      user = await prisma.user.findFirst({
        include: {
          behavior: true,
        },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Rajavarthini',
          timezone: 'America/New_York',
          behavior: {
            create: {
              preferredStudyTime: '20:00',
              streak: 0,
              bestStreak: 0,
              completionRate: 0.0,
              insightsJson: '[]',
            },
          },
        },
        include: { behavior: true },
      });
    } else if (user.name === 'Alex Rivera') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Rajavarthini' },
        include: { behavior: true },
      });
    }

    // Fetch primary active goal
    const goal = await prisma.goal.findFirst({
      where: { userId: user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                reminders: { orderBy: { sentAt: 'desc' }, take: 1 },
                verifications: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate current day in timeline
    let currentDay = 1;
    let totalDays = goal?.durationDays || 60;
    if (goal) {
      const start = new Date(goal.startDate).getTime();
      const now = Date.now();
      const elapsedDays = Math.floor((now - start) / (24 * 60 * 60 * 1000)) + 1;
      currentDay = Math.max(1, Math.min(totalDays, elapsedDays));
    }

    // Collect all tasks
    const allTasks = (goal?.milestones || []).flatMap((m) =>
      m.tasks.map((t) => ({
        ...t,
        milestone: {
          id: m.id,
          title: m.title,
          goalId: m.goalId,
        },
      }))
    );

    // Filter today's tasks
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Identify active day: today if tasks exist today, otherwise earliest incomplete day
    const strictlyTodayTasks = allTasks.filter((t) => {
      const scheduled = new Date(t.scheduledTime);
      return scheduled >= startOfToday && scheduled <= endOfToday;
    });

    let activeDayStr = '';
    if (strictlyTodayTasks.length > 0) {
      activeDayStr = now.toISOString().split('T')[0];
    } else if (allTasks.length > 0) {
      const firstIncomplete = allTasks.find((t) => !t.completed) || allTasks[0];
      activeDayStr = new Date(firstIncomplete.scheduledTime).toISOString().split('T')[0];
    }

    let todayTasks = allTasks.filter((t) => {
      const scheduled = new Date(t.scheduledTime);
      const taskDayStr = scheduled.toISOString().split('T')[0];
      const isScheduledForActiveDay = Boolean(activeDayStr && taskDayStr === activeDayStr);
      const isOverdue = !t.completed && scheduled < startOfToday;
      const wasCompletedToday =
        t.completed &&
        t.completedAt &&
        new Date(t.completedAt) >= startOfToday &&
        new Date(t.completedAt) <= endOfToday;
      return isScheduledForActiveDay || isOverdue || wasCompletedToday;
    });

    // Today's primary mission: priority to incomplete, highest escalation, or highest priority
    const todayMission =
      todayTasks.find((t) => !t.completed && t.priority === 'HIGH') ||
      todayTasks.find((t) => !t.completed) ||
      todayTasks[0] ||
      null;

    // Critical deadlines: tasks with priority CRITICAL or overdue tasks
    const criticalDeadlines = allTasks.filter(
      (t) => !t.completed && (t.priority === 'CRITICAL' || new Date(t.scheduledTime) < now)
    );

    // Accountability score
    const score = await scoreService.calculateUserScore(user.id);

    // Behavior info
    const rawInsights = user.behavior?.insightsJson ? JSON.parse(user.behavior.insightsJson) : [];
    const behaviorData = {
      id: user.behavior?.id || '',
      userId: user.id,
      preferredStudyTime: user.behavior?.preferredStudyTime || '20:00',
      skippedCount: user.behavior?.skippedCount || 0,
      streak: user.behavior?.streak ?? 0,
      bestStreak: user.behavior?.bestStreak ?? 0,
      completionRate: user.behavior?.completionRate ?? 0.0,
      lastActiveDate: user.behavior?.lastActiveDate?.toISOString() || null,
      insights: rawInsights,
    };

    // Active unacknowledged reminders for the current active goal
    const activeReminders = goal
      ? await prisma.reminder.findMany({
          where: {
            acknowledged: false,
            task: {
              completed: false,
              milestone: {
                goalId: goal.id,
              },
            },
          },
          include: {
            task: true,
          },
          orderBy: { sentAt: 'desc' },
          take: 5,
        })
      : [];

    const responseData: DashboardData = {
      user: {
        id: user.id,
        name: user.name,
        timezone: user.timezone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      goal: goal
        ? {
            id: goal.id,
            userId: goal.userId,
            title: goal.title,
            description: goal.description,
            deadline: goal.deadline.toISOString(),
            progress: goal.progress,
            startDate: goal.startDate.toISOString(),
            endDate: goal.endDate.toISOString(),
            durationDays: goal.durationDays,
            milestones: goal.milestones.map((m) => ({
              id: m.id,
              goalId: m.goalId,
              title: m.title,
              order: m.order,
              dueDate: m.dueDate.toISOString(),
              completed: m.completed,
              tasks: m.tasks.map((t) => ({
                id: t.id,
                milestoneId: t.milestoneId,
                title: t.title,
                description: t.description,
                scheduledTime: t.scheduledTime.toISOString(),
                estimatedMinutes: t.estimatedMinutes,
                priority: t.priority as any,
                reminderInterval: t.reminderInterval,
                completed: t.completed,
                completedAt: t.completedAt?.toISOString() || null,
                verificationType: t.verificationType as any,
                topic: t.topic,
                sourceContext: t.sourceContext,
                order: t.order,
                activeEscalationLevel: t.activeEscalationLevel as any,
                snoozedUntil: t.snoozedUntil?.toISOString() || null,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
              })),
              createdAt: m.createdAt.toISOString(),
              updatedAt: m.updatedAt.toISOString(),
            })),
            createdAt: goal.createdAt.toISOString(),
            updatedAt: goal.updatedAt.toISOString(),
          }
        : null,
      goalProgress: goal?.progress || 0,
      currentDay,
      totalDays,
      todayMission: todayMission
        ? {
            id: todayMission.id,
            milestoneId: todayMission.milestoneId,
            title: todayMission.title,
            description: todayMission.description,
            scheduledTime: todayMission.scheduledTime.toISOString(),
            estimatedMinutes: todayMission.estimatedMinutes,
            priority: todayMission.priority as any,
            reminderInterval: todayMission.reminderInterval,
            completed: todayMission.completed,
            completedAt: todayMission.completedAt?.toISOString() || null,
            verificationType: todayMission.verificationType as any,
            topic: todayMission.topic,
            sourceContext: todayMission.sourceContext,
            order: todayMission.order,
            activeEscalationLevel: todayMission.activeEscalationLevel as any,
            snoozedUntil: todayMission.snoozedUntil?.toISOString() || null,
            milestone: (todayMission as any).milestone,
            createdAt: todayMission.createdAt.toISOString(),
            updatedAt: todayMission.updatedAt.toISOString(),
          }
        : null,
      todayTasks: todayTasks.map((t) => ({
        id: t.id,
        milestoneId: t.milestoneId,
        title: t.title,
        description: t.description,
        scheduledTime: t.scheduledTime.toISOString(),
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority as any,
        reminderInterval: t.reminderInterval,
        completed: t.completed,
        completedAt: t.completedAt?.toISOString() || null,
        verificationType: t.verificationType as any,
        topic: t.topic,
        sourceContext: t.sourceContext,
        order: t.order,
        activeEscalationLevel: t.activeEscalationLevel as any,
        snoozedUntil: t.snoozedUntil?.toISOString() || null,
        milestone: (t as any).milestone,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      criticalDeadlines: criticalDeadlines.map((t) => ({
        id: t.id,
        milestoneId: t.milestoneId,
        title: t.title,
        description: t.description,
        scheduledTime: t.scheduledTime.toISOString(),
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority as any,
        reminderInterval: t.reminderInterval,
        completed: t.completed,
        completedAt: t.completedAt?.toISOString() || null,
        verificationType: t.verificationType as any,
        topic: t.topic,
        sourceContext: t.sourceContext,
        order: t.order,
        activeEscalationLevel: t.activeEscalationLevel as any,
        snoozedUntil: t.snoozedUntil?.toISOString() || null,
        milestone: (t as any).milestone,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      streak: {
        current: user.behavior?.streak ?? 0,
        best: user.behavior?.bestStreak ?? 0,
        lastActiveDate: user.behavior?.lastActiveDate?.toISOString() || null,
      },
      score,
      behavior: behaviorData,
      activeReminders: activeReminders.map((r) => ({
        id: r.id,
        taskId: r.taskId,
        sentAt: r.sentAt.toISOString(),
        escalationLevel: r.escalationLevel as any,
        message: r.message,
        channel: r.channel as any,
        acknowledged: r.acknowledged,
        snoozedUntil: r.snoozedUntil?.toISOString() || null,
      })),
    };

    res.json(responseData);
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
  }
});
