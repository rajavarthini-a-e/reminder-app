import { AccountabilityScore, ScoreFactor } from '../types/shared.js';
import prisma from '../prisma.js';

export class ScoreService {
  /**
   * Calculate comprehensive accountability score out of 100 with itemized factors
   */
  public async calculateUserScore(userId: string): Promise<AccountabilityScore> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        behavior: true,
        goals: {
          include: {
            milestones: {
              include: {
                tasks: {
                  include: {
                    verifications: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const behavior = user?.behavior;
    const allTasks = (user?.goals || []).flatMap((g) =>
      g.milestones.flatMap((m) => m.tasks)
    );

    const now = new Date();
    const completedTasks = allTasks.filter((t) => t.completed);
    const overdueTasks = allTasks.filter(
      (t) => !t.completed && new Date(t.scheduledTime) < now
    );
    const criticalOverdueTasks = overdueTasks.filter(
      (t) => t.priority === 'CRITICAL'
    );

    const allVerifications = allTasks.flatMap((t) => t.verifications);
    const passedVerifications = allVerifications.filter((v) => v.passed);

    const streak = behavior?.streak || 0;

    if (allTasks.length === 0) {
      return {
        score: 100,
        grade: 'A',
        assessment: 'Welcome to MentorAI! Upload or paste a study plan to activate automated accountability tracking.',
        breakdown: [],
        streak,
        completionRate: 0,
        overdueCount: 0,
      };
    }

    const totalTasksCount = allTasks.length;
    const completionRate = completedTasks.length / totalTasksCount;
    const verificationRate =
      allVerifications.length > 0
        ? passedVerifications.length / allVerifications.length
        : 1.0;

    let baseScore = 70;
    const breakdown: ScoreFactor[] = [];

    // 1. Streak bonus (+2 per streak day, max +20)
    const streakBonus = Math.min(20, streak * 2);
    if (streakBonus > 0) {
      breakdown.push({
        factor: `${streak}-Day Streak`,
        impact: streakBonus,
        description: `Consistent daily momentum rewarded`,
        type: 'bonus',
      });
    }

    // 2. Completion rate impact
    const completionImpact = Math.round((completionRate - 0.5) * 20); // -10 to +10
    if (completionImpact !== 0) {
      breakdown.push({
        factor: 'Task Completion Rate',
        impact: completionImpact,
        description: `${Math.round(completionRate * 100)}% overall plan progress`,
        type: completionImpact > 0 ? 'bonus' : 'penalty',
      });
    }

    // 3. Verification accuracy
    if (allVerifications.length > 0) {
      const verifImpact = Math.round((verificationRate - 0.7) * 20); // e.g. 90% -> +4, 100% -> +6
      if (verifImpact !== 0) {
        breakdown.push({
          factor: 'Mentor Verification Rigor',
          impact: verifImpact,
          description: `${Math.round(verificationRate * 100)}% verification challenge pass rate`,
          type: verifImpact > 0 ? 'bonus' : 'penalty',
        });
      }
    }

    // 4. Overdue tasks penalty (-8 per overdue pending task)
    if (overdueTasks.length > 0) {
      const overduePenalty = Math.min(24, overdueTasks.length * 8);
      breakdown.push({
        factor: 'Unresolved Overdue Tasks',
        impact: -overduePenalty,
        description: `${overdueTasks.length} task(s) currently past scheduled deadline`,
        type: 'penalty',
      });
    }

    // 5. Critical deadline failure penalty (-12 per critical)
    if (criticalOverdueTasks.length > 0) {
      const critPenalty = criticalOverdueTasks.length * 12;
      breakdown.push({
        factor: 'Critical Deadline At Risk',
        impact: -critPenalty,
        description: `${criticalOverdueTasks.length} high-stakes milestone task delayed`,
        type: 'penalty',
      });
    }

    // 6. Excessive snooze / skip penalty
    if (behavior && behavior.skippedCount > 0) {
      const skipPenalty = Math.min(15, behavior.skippedCount * 3);
      breakdown.push({
        factor: 'Snooze / Postpone Frequency',
        impact: -skipPenalty,
        description: `${behavior.skippedCount} logged postponements`,
        type: 'penalty',
      });
    }

    // Calculate final score
    const totalImpact = breakdown.reduce((sum, item) => sum + item.impact, 0);
    const finalScore = Math.max(10, Math.min(100, baseScore + totalImpact));

    let grade = 'B';
    let assessment = 'Good consistency. Stay vigilant on scheduled study windows.';
    if (finalScore >= 90) {
      grade = 'A+';
      assessment = 'Elite execution. You are setting an uncompromising benchmark.';
    } else if (finalScore >= 80) {
      grade = 'A';
      assessment = 'High accountability. Keep pushing to close overdue items.';
    } else if (finalScore >= 70) {
      grade = 'B';
      assessment = 'Acceptable momentum, but hesitation is beginning to cost you.';
    } else if (finalScore >= 55) {
      grade = 'C';
      assessment = 'Warning. Slacking detected. The mentor requires immediate focus.';
    } else {
      grade = 'F';
      assessment = 'Critical intervention required. Multiple deadlines breached.';
    }

    return {
      score: finalScore,
      grade,
      assessment,
      breakdown,
      streak,
      completionRate: Math.round(completionRate * 100) / 100,
      overdueCount: overdueTasks.length,
    };
  }
}

export const scoreService = new ScoreService();
