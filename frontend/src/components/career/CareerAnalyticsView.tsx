import React, { useMemo, useState } from 'react';
import {
  Flame,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { Goal, Milestone, Task } from '@shared/types';
import clsx from 'clsx';

interface CareerAnalyticsViewProps {
  goal: Goal | null;
  allTasks: Task[];
  completedTasks: Task[];
  streak: number;
  goalProgress: number;
  onTakeMilestoneTest?: (milestone: Milestone) => void;
  onNavigateUpload?: () => void;
  milestoneTestStats?: { passed: number; total: number };
}

export const CareerAnalyticsView: React.FC<CareerAnalyticsViewProps> = ({
  goal,
  allTasks,
  completedTasks,
  streak,
  goalProgress,
  onTakeMilestoneTest,
  onNavigateUpload,
  milestoneTestStats = { passed: 0, total: 0 },
}) => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month'>('week');

  const milestones = goal?.milestones || [];
  const totalTasksCount = allTasks.length;
  const completedTasksCount = completedTasks.length;

  // Calculate total study minutes invested
  const totalStudyMinutes = useMemo(() => {
    return completedTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  }, [completedTasks]);

  const studyHoursFormatted = (totalStudyMinutes / 60).toFixed(1);

  // Weekly study data for the wave chart
  const weekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayKey = d.toISOString().split('T')[0];
      const isToday = d.toDateString() === now.toDateString();

      // Tasks completed on this specific day
      const dayCompleted = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toISOString().split('T')[0] === dayKey;
      }).length;

      days.push({
        dayName: dayNames[i],
        shortName: dayNames[i].slice(0, 1),
        isToday,
        completedCount: dayCompleted,
      });
    }
    return days;
  }, [completedTasks]);

  // Smooth SVG wave path generator for Career study consistency
  const careerWavePath = useMemo(() => {
    const width = 280;
    const height = 90;
    const step = width / (weekDays.length - 1);

    // Map completedCount to y coordinate with an organic curve
    const maxVal = Math.max(2, ...weekDays.map((d) => d.completedCount));
    const coords = weekDays.map((d, i) => {
      const normalized =
        d.completedCount > 0
          ? (d.completedCount / maxVal) * 55 + 30
          : 15 + ((i % 2) * 5);
      return {
        x: i * step,
        y: height - (normalized / 100) * (height - 15),
      };
    });

    let linePath = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      linePath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const cleanAreaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
    return { linePath, areaPath: cleanAreaPath };
  }, [weekDays]);

  // Radial ring parameters
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const ringProgress = Math.min(100, Math.round(goalProgress));
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  if (!goal) {
    return (
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center shadow-2xs space-y-3">
        <span className="text-3xl">🌱</span>
        <h3 className="text-sm font-black text-primary-text dark:text-white">
          No Study Plan Uploaded Yet
        </h3>
        <p className="text-xs text-secondary-text dark:text-gray-400 max-w-sm mx-auto">
          Upload or paste your syllabus to unlock living garden analytics, curriculum velocity, and phase knowledge tests.
        </p>
        {onNavigateUpload && (
          <button
            type="button"
            onClick={onNavigateUpload}
            className="py-2.5 px-4 rounded-xl bg-success text-white text-xs font-black hover:bg-success-hover transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Upload Study Plan</span>
            <span>→</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Key Metrics 4-Box Grid (Clean & User Friendly) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-secondary-text dark:text-gray-400 uppercase tracking-wider">
            Topics Done
          </div>
          <div className="text-xl font-black text-primary-text dark:text-white">
            {completedTasksCount} / {totalTasksCount}
          </div>
          <div className="text-[10px] text-success font-bold">
            {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% of roadmap
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-secondary-text dark:text-gray-400 uppercase tracking-wider">
            Study Hours
          </div>
          <div className="text-xl font-black text-primary-text dark:text-white">
            {studyHoursFormatted}h
          </div>
          <div className="text-[10px] text-primary font-bold">
            {totalStudyMinutes} min focused
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-secondary-text dark:text-gray-400 uppercase tracking-wider">
            Active Streak
          </div>
          <div className="text-xl font-black text-warning flex items-center gap-1">
            <Flame className="w-4 h-4 fill-warning" />
            <span>{streak}d</span>
          </div>
          <div className="text-[10px] text-secondary-text font-bold">
            Consistency streak
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-secondary-text dark:text-gray-400 uppercase tracking-wider">
            Exams Passed
          </div>
          <div className="text-xl font-black text-primary-text dark:text-white">
            {milestones.length > 0
              ? `${Math.min(milestoneTestStats.passed, milestones.length)}/${milestones.length}`
              : `${milestoneTestStats.passed}`}
          </div>
          <div className="text-[10px] text-secondary-text font-bold">
            {milestoneTestStats.passed > 0 ? 'Verified tests' : 'Knowledge tests'}
          </div>
        </div>
      </div>

      {/* 3. TWO-CARD STUDY ANALYTICS (Matching the Visual Reference Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Left Card: Roadmap Radial Completion Ring */}
        <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-primary-text dark:text-white">
              Roadmap Velocity
            </span>
            <span className="text-[10px] font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
              {completedTasksCount > 0 ? 'Ahead of Schedule 🚀' : 'Getting Started 🌱'}
            </span>
          </div>

          {/* Radial Circular Progress Ring */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-surface-secondary dark:text-surface-darkBorder"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-success transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                Curriculum
              </span>
              <span className="text-2xl font-black text-primary-text dark:text-white">
                {Math.round(goalProgress)}%
              </span>
              <span className="text-[10px] font-black text-success mt-0.5">
                {completedTasksCount} / {totalTasksCount} Topics
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border/60 text-center pt-2 border-t border-border/50">
            <div className="pr-2">
              <div className="text-[10px] font-bold text-secondary-text">Completed</div>
              <div className="text-sm font-black text-primary-text dark:text-white mt-0.5">
                {completedTasksCount} topics
              </div>
            </div>
            <div className="pl-2">
              <div className="text-[10px] font-bold text-secondary-text">Remaining</div>
              <div className="text-sm font-black text-success mt-0.5">
                {Math.max(0, totalTasksCount - completedTasksCount)} topics
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Weekly Study Consistency Wave Chart */}
        <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-primary-text dark:text-white">
              Study Rhythm
            </span>
            <span className="text-[10px] font-bold text-secondary-text">
              7-Day Study Wave
            </span>
          </div>

          {/* Smooth SVG Wave Area Chart */}
          <div className="relative pt-2">
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 280 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="careerGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4E9E70" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4E9E70" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {careerWavePath.areaPath && (
                <path d={careerWavePath.areaPath} fill="url(#careerGreenGradient)" />
              )}

              {careerWavePath.linePath && (
                <path
                  d={careerWavePath.linePath}
                  fill="none"
                  stroke="#4E9E70"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}
            </svg>

            {/* X-Axis Day Labels */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-secondary-text pt-1">
              {weekDays.map((d, i) => (
                <span key={i} className={clsx(d.isToday && 'text-success font-black')}>
                  {d.shortName}
                </span>
              ))}
            </div>
          </div>

          {/* Successful Study Days in a Row */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-black text-primary-text dark:text-white">
                Study sessions this week
              </span>
              <span className="text-[10px] text-success font-bold">
                {weekDays.filter((d) => d.completedCount > 0).length} active days
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      d.completedCount > 0
                        ? 'bg-success text-white shadow-2xs'
                        : 'border-2 border-border/80 text-secondary-text bg-surface-secondary/40'
                    )}
                    title={`${d.dayName}: ${d.completedCount} topics`}
                  >
                    {d.completedCount > 0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-bold opacity-60">{d.dayName.slice(0, 1)}</span>
                    )}
                  </div>
                  <span className={clsx('text-[9px] font-bold', d.isToday ? 'text-success' : 'text-secondary-text')}>
                    {d.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Momo Study Coach Insight */}
      <div className="bg-lavender dark:bg-surface border border-primary/20 dark:border-primary/30 rounded-2xl p-4 space-y-1 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <span className="text-xl">🐱</span>
          <div className="text-xs text-primary dark:text-text-primary leading-relaxed font-medium">
            {completedTasksCount === 0
              ? "Your roadmap garden has taken root! Complete your first topic on Home to see your tree sprout and study momentum climb."
              : completedTasksCount >= 3
              ? "Incredible momentum! Working ahead on upcoming topics accelerates your milestone readiness and builds solid habit compounding."
              : "Great daily consistency! Tackling topics step-by-step with focus timer sessions boosts your comprehension exam retention."}
          </div>
        </div>
      </div>

      {/* 5. Phase Mastery Cards (User-Friendly Overview) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
            Phased Knowledge Exams & Mastery ({milestones.length})
          </div>
          <span className="text-[11px] text-secondary-text font-medium">
            Test comprehension per phase
          </span>
        </div>

        {milestones.map((m, idx) => {
          const mTasks = m.tasks || [];
          const mCompleted = mTasks.filter((t) => t.completed).length;
          const mTotal = mTasks.length;
          const mPct = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

          return (
            <div
              key={m.id}
              className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                    Phase {idx + 1}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-primary-text dark:text-white break-words">
                    {m.title}
                  </h3>
                </div>
                <span
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-black',
                    m.completed
                      ? 'bg-success-soft text-success'
                      : mCompleted > 0
                      ? 'bg-lavender-soft text-primary'
                      : 'bg-surface-secondary text-secondary-text'
                  )}
                >
                  {m.completed ? 'Passed ★' : `${mCompleted}/${mTotal} Topics (${mPct}%)`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${mPct}%` }}
                />
              </div>

              {/* Take Phase Exam Button */}
              {onTakeMilestoneTest && (
                <button
                  type="button"
                  onClick={() => onTakeMilestoneTest(m)}
                  className="w-full py-2.5 rounded-xl bg-surface-secondary dark:bg-surface-secondary text-primary-text dark:text-white hover:bg-border text-xs font-black transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-warning" />
                  <span>Take Phase {idx + 1} Knowledge Exam ★</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CareerAnalyticsView;
