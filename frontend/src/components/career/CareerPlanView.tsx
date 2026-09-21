import React, { useState, useMemo } from 'react';
import { Clock, Check, Trash2, Calendar, Flame, Award, ChevronRight } from 'lucide-react';
import { Goal, Milestone, Task } from '@shared/types';
import clsx from 'clsx';

interface CareerPlanViewProps {
  goal: Goal | null;
  allTasks: Task[];
  todayTasks: Task[];
  onDeleteTask: (taskId: string, title: string) => void;
  onVerifyTask: (task: Task) => void;
  onToggleTask?: (task: Task) => void;
  focusTimerActive: boolean;
  focusSeconds: number;
  onToggleFocusTimer: () => void;
  formatTimer: (seconds: number) => string;
  onTakeMilestoneTest?: (milestone: Milestone) => void;
  onNavigateUpload?: () => void;
  onNavigateCalendar?: () => void;
  inlineVerificationSlot?: React.ReactNode;
  criticalDeadlineSlot?: React.ReactNode;
}

export const CareerPlanView: React.FC<CareerPlanViewProps> = ({
  goal,
  allTasks,
  todayTasks,
  onDeleteTask,
  onVerifyTask,
  onToggleTask,
  focusTimerActive,
  focusSeconds,
  onToggleFocusTimer,
  formatTimer,
  onTakeMilestoneTest,
  onNavigateUpload,
  onNavigateCalendar,
  inlineVerificationSlot,
  criticalDeadlineSlot,
}) => {
  const [viewCadence, setViewCadence] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Today's topics stats
  const totalTodayCount = todayTasks.length;
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const todayPct = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;
  const primaryTask = todayTasks.find((t) => !t.completed) || todayTasks[0];

  // Set of today's task IDs to differentiate today from future topics
  const todayTaskIds = useMemo(() => new Set(todayTasks.map((t) => t.id)), [todayTasks]);

  // Incomplete upcoming topics from future days / phases that user can work ahead on
  const upcomingWorkAheadTasks = useMemo(() => {
    return allTasks.filter((t) => !t.completed && !todayTaskIds.has(t.id));
  }, [allTasks, todayTaskIds]);

  // Tasks completed today that were originally future topics
  const aheadCompletedTasks = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
    return todayTasks.filter((t) => {
      const scheduledTime = new Date(t.scheduledTime).getTime();
      return t.completed && scheduledTime > endOfToday;
    });
  }, [todayTasks]);

  // Weekly topics stats (next 7 days from now or current active week)
  const { weekTasks, daysMap, weekTotalCount, weekCompletedCount, weekPct } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysLater = startOfToday + 7 * 24 * 60 * 60 * 1000;

    // Filter tasks that fall within current 7-day window, or first 7 days if all ahead
    let wTasks = allTasks.filter((t) => {
      const time = new Date(t.scheduledTime).getTime();
      return time >= startOfToday && time < sevenDaysLater;
    });

    if (wTasks.length === 0 && allTasks.length > 0) {
      // Fallback to first 7 days of the curriculum
      const firstTime = new Date(allTasks[0].scheduledTime).getTime();
      const firstWeekEnd = firstTime + 7 * 24 * 60 * 60 * 1000;
      wTasks = allTasks.filter((t) => {
        const time = new Date(t.scheduledTime).getTime();
        return time >= firstTime && time < firstWeekEnd;
      });
    }

    const total = wTasks.length;
    const completed = wTasks.filter((t) => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Group tasks by day (formatted date string)
    const grouped: Record<string, { date: Date; tasks: Task[] }> = {};
    wTasks.forEach((t) => {
      const d = new Date(t.scheduledTime);
      const key = d.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = { date: d, tasks: [] };
      }
      grouped[key].tasks.push(t);
    });

    return {
      weekTasks: wTasks,
      daysMap: Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime()),
      weekTotalCount: total,
      weekCompletedCount: completed,
      weekPct: pct,
    };
  }, [allTasks]);

  // Overall Plan / Monthly stats
  const milestones = goal?.milestones || [];
  const totalTasksCount = allTasks.length;
  const completedTotalCount = allTasks.filter((t) => t.completed).length;
  const totalPct = totalTasksCount > 0 ? Math.round((completedTotalCount / totalTasksCount) * 100) : 0;

  if (!goal) {
    return (
      <div className="bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-3xl p-6 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-success-soft text-success flex items-center justify-center text-2xl">
          🎓
        </div>
        <div className="text-base font-black text-primary-text dark:text-white">
          No Active Career Roadmap
        </div>
        <p className="text-xs text-secondary-text dark:text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
          You are currently in Personal Habits mode. When you are ready to track study milestones, explore or activate a roadmap anytime.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={onNavigateUpload}
            className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-success text-white hover:bg-success-hover text-xs font-black transition-all shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>Browse Roadmap Library</span>
            <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 3-Way Segmented Control: Daily / Weekly / Monthly (Matching Personal Mode) */}
      <div className="flex bg-surface-secondary dark:bg-surface-darkBorder rounded-2xl p-1 select-none border border-border/60">
        {(['daily', 'weekly', 'monthly'] as const).map((cadence) => {
          const isActive = viewCadence === cadence;
          return (
            <button
              key={cadence}
              type="button"
              onClick={() => setViewCadence(cadence)}
              className={clsx(
                'flex-1 py-2.5 px-3 rounded-xl text-xs font-black capitalize transition-all text-center cursor-pointer min-h-[40px]',
                isActive
                  ? 'bg-success text-white shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              {cadence === 'monthly' ? 'Total Plan' : cadence}
            </button>
          );
        })}
      </div>

      {/* ======================================================================= */}
      {/* 1. DAILY VIEW (Today's Topics To Cover + Progress Bar + Work Ahead)    */}
      {/* ======================================================================= */}
      {viewCadence === 'daily' && (
        <div className="space-y-3.5 animate-fadeIn">
          {criticalDeadlineSlot}

          {/* Today's Study Progress Hero Card */}
          <div className="bg-success dark:bg-[#16251C] dark:border dark:border-success/30 text-white dark:text-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider uppercase opacity-85">
                TODAY'S STUDY GOAL
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/20">
                {todayPct}% Completed
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-lg sm:text-xl font-black leading-snug">
                {completedTodayCount} of {totalTodayCount} topics covered
              </div>
              {aheadCompletedTasks.length > 0 && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/25 border border-white/40 flex items-center gap-1 shadow-xs">
                  <span>🚀 Ahead of schedule (+{aheadCompletedTasks.length})</span>
                </span>
              )}
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-white/30 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white dark:bg-success h-2.5 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.min(100, todayPct)}%` }}
              />
            </div>

            {/* Next Active Topic & Focus Controls */}
            {primaryTask && !primaryTask.completed ? (
              <div className="pt-1.5 border-t border-white/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold opacity-90 truncate max-w-[240px]">
                    Current topic: {primaryTask.title}
                  </span>
                  <span className="opacity-75 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {primaryTask.estimatedMinutes} min
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={onToggleFocusTimer}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-surface-secondary text-success-hover dark:text-success text-xs font-black hover:bg-surface-secondary dark:hover:bg-border transition-all shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <span>{focusTimerActive ? `Focusing: ${formatTimer(focusSeconds)}` : 'Start Focus Timer'}</span>
                  </button>
                  <button
                    onClick={() => onVerifyTask(primaryTask)}
                    className="py-2.5 px-3.5 rounded-xl bg-success-hover dark:bg-success text-white text-xs font-bold border border-white/20 hover:bg-white/10 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Verify with Momo</span>
                  </button>
                </div>
              </div>
            ) : totalTodayCount > 0 && completedTodayCount === totalTodayCount ? (
              <div className="pt-1.5 border-t border-white/20 text-xs font-bold flex items-center gap-1.5 opacity-95">
                <span>🌿 All topics for today completed! You can review, work ahead below, or take a break.</span>
              </div>
            ) : null}
          </div>

          {/* Today's Topics Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
                Today's Topics to Cover ({totalTodayCount})
              </div>
              {onNavigateCalendar && (
                <button
                  type="button"
                  onClick={onNavigateCalendar}
                  className="text-[11px] text-success font-black hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>View Calendar</span>
                </button>
              )}
            </div>

            {todayTasks.length > 0 ? (
              todayTasks.map((t, idx) => {
                const isCritical = t.priority === 'CRITICAL' || idx === 0;

                return (
                  <div
                    key={t.id}
                    className={clsx(
                      'bg-white dark:bg-surface-dark border rounded-2xl p-3.5 shadow-2xs flex items-center gap-3 transition-all',
                      t.completed
                        ? 'border-border/60 opacity-85'
                        : 'border-border dark:border-surface-darkBorder'
                    )}
                  >
                    {/* Topic Indicator Icon */}
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold',
                        t.completed
                          ? 'bg-success-soft text-success'
                          : isCritical
                          ? 'bg-danger-soft text-danger'
                          : 'bg-lavender-soft text-primary'
                      )}
                    >
                      {t.completed ? '✓' : idx + 1}
                    </div>

                    {/* Topic Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={clsx(
                          'text-xs font-bold text-primary-text dark:text-white break-words leading-snug',
                          t.completed && 'line-through text-secondary-text'
                        )}
                      >
                        {t.title}
                      </div>
                      <div className="text-[10px] text-secondary-text dark:text-gray-400 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className={clsx('font-bold', isCritical ? 'text-danger' : 'text-success')}>
                          {t.priority}
                        </span>
                        <span>·</span>
                        <span className="whitespace-nowrap">{t.estimatedMinutes} min</span>
                        {t.milestone && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[120px] whitespace-nowrap">{t.milestone.title}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Task Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(t.id, t.title);
                      }}
                      className="min-w-[40px] min-h-[48px] rounded-xl flex items-center justify-center text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                      title={`Delete topic ${t.title}`}
                      aria-label={`Delete topic ${t.title}`}
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>

                    {/* Direct Do / Undo Checkmark Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleTask) {
                          onToggleTask(t);
                        } else {
                          onVerifyTask(t);
                        }
                      }}
                      className={clsx(
                        'min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs',
                        t.completed
                          ? 'bg-success text-white'
                          : 'border-2 border-border dark:border-surface-darkBorder hover:border-success text-secondary-text hover:text-success'
                      )}
                      title={t.completed ? 'Topic completed — Click to undo tick' : 'Click to complete topic'}
                      aria-label={t.completed ? 'Topic completed — Click to undo tick' : 'Click to complete topic'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Optional Mentor verification modal button if not yet completed */}
                    {!t.completed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyTask(t);
                        }}
                        className="p-2 rounded-xl text-primary bg-lavender-soft hover:bg-primary hover:text-white transition-all min-h-[48px] flex items-center justify-center cursor-pointer"
                        title="Ask Momo to quiz you and put tick"
                        aria-label="Ask Momo to quiz you"
                      >
                        <span className="text-xs font-black">🎓</span>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center shadow-2xs space-y-2">
                <span className="text-2xl">🌱</span>
                <div className="text-xs font-bold text-primary-text dark:text-white">
                  No topics scheduled for today
                </div>
                <p className="text-[11px] text-secondary-text dark:text-gray-400">
                  All topics scheduled for today are cleared. Check the Weekly tab, Calendar, or work ahead below.
                </p>
              </div>
            )}
          </div>

          {/* =================================================================== */}
          {/* Work Ahead Section: Day 2, Day 3 & Upcoming Topics                  */}
          {/* =================================================================== */}
          {upcomingWorkAheadTasks.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Work Ahead (Day 2 & Day 3 Topics)</span>
                    <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-black">
                      {upcomingWorkAheadTasks.length} upcoming
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary-text dark:text-gray-400">
                    Want to finish 3 days of work in one day? Complete upcoming topics right now.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {upcomingWorkAheadTasks.slice(0, 6).map((t, idx) => {
                  const taskDate = new Date(t.scheduledTime);
                  const formattedDate = taskDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={t.id}
                      className="bg-white/90 dark:bg-surface-dark/90 border border-border/70 dark:border-surface-darkBorder/70 rounded-2xl p-3.5 shadow-2xs flex items-center gap-3 transition-all hover:border-success/50"
                    >
                      <div className="w-8 h-8 rounded-xl bg-surface-secondary text-secondary-text flex items-center justify-center text-xs font-black flex-shrink-0">
                        +{idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-primary-text dark:text-white break-words leading-snug">
                          {t.title}
                        </div>
                        <div className="text-[10px] text-secondary-text dark:text-gray-400 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="font-bold text-primary">{formattedDate}</span>
                          <span>·</span>
                          <span>{t.estimatedMinutes} min</span>
                          {t.milestone && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[110px]">{t.milestone.title}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete Task */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(t.id, t.title);
                        }}
                        className="min-w-[40px] min-h-[48px] rounded-xl flex items-center justify-center text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                        title={`Delete topic ${t.title}`}
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>

                      {/* Direct Do Checkmark Button to Complete Ahead */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleTask) {
                            onToggleTask(t);
                          } else {
                            onVerifyTask(t);
                          }
                        }}
                        className="min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 border-border dark:border-surface-darkBorder hover:border-success text-secondary-text hover:text-success shadow-2xs"
                        title="Mark this upcoming topic complete today"
                        aria-label="Mark this upcoming topic complete today"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Momo Verify Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyTask(t);
                        }}
                        className="p-2 rounded-xl text-primary bg-lavender-soft hover:bg-primary hover:text-white transition-all min-h-[48px] flex items-center justify-center cursor-pointer"
                        title="Ask Momo to quiz you on this upcoming topic"
                        aria-label="Ask Momo to quiz you"
                      >
                        <span className="text-xs font-black">🎓</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inline Mentor Verification Slot */}
          {inlineVerificationSlot}
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. WEEKLY VIEW (This Week's Topics & 7-Day Day-by-Day Breakdown)        */}
      {/* ======================================================================= */}
      {viewCadence === 'weekly' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Weekly Progress Hero Card */}
          <div className="bg-success text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider uppercase opacity-85">
                THIS WEEK'S STUDY PROGRESS
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/20">
                {weekPct}% Completed
              </span>
            </div>

            <div className="text-lg sm:text-xl font-black leading-snug">
              {weekCompletedCount} of {weekTotalCount} topics covered this week
            </div>

            {/* White Animated Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${weekPct}%` }}
              />
            </div>

            <div className="text-xs opacity-85 font-medium">
              Covering {daysMap.length} scheduled study days in this weekly block
            </div>
          </div>

          {/* 7-Day Day-by-Day Topics Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
              Weekly Timetable ({weekTasks.length} topics)
            </div>

            {daysMap.length > 0 ? (
              daysMap.map((group, gIdx) => {
                const dayTitle = group.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                const dayCompleted = group.tasks.filter((t) => t.completed).length;
                const isAllDone = dayCompleted === group.tasks.length;

                return (
                  <div
                    key={group.date.toISOString()}
                    className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📅</span>
                        <span className="text-xs font-black text-primary-text dark:text-white">
                          Day {gIdx + 1} · {dayTitle}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          'text-[10px] font-black px-2 py-0.5 rounded-full',
                          isAllDone
                            ? 'bg-success-soft text-success'
                            : 'bg-surface-secondary text-secondary-text'
                        )}
                      >
                        {dayCompleted} of {group.tasks.length} done
                      </span>
                    </div>

                    {/* Topics in this Day */}
                    <div className="space-y-2 pt-1">
                      {group.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-surface-secondary/60 dark:bg-surface-darkBorder/40 rounded-xl p-3 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className={clsx(
                                'text-xs font-bold text-primary-text dark:text-white break-words',
                                task.completed && 'line-through text-secondary-text'
                              )}
                            >
                              {task.title}
                            </div>
                            <div className="text-[10px] text-secondary-text dark:text-gray-400">
                              {task.estimatedMinutes} min · {task.priority}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id, task.title);
                              }}
                              className="p-2 rounded-lg text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                              title={`Delete ${task.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>

                            {/* Direct Do / Undo Checkmark */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleTask) {
                                  onToggleTask(task);
                                } else {
                                  onVerifyTask(task);
                                }
                              }}
                              className={clsx(
                                'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
                                task.completed
                                  ? 'bg-success text-white'
                                  : 'border border-border text-secondary-text hover:border-success hover:text-success'
                              )}
                              title={task.completed ? 'Topic completed — Click to undo' : 'Mark topic complete'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            {!task.completed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerifyTask(task);
                                }}
                                className="p-1.5 rounded-lg text-primary bg-lavender-soft hover:bg-primary hover:text-white transition-all text-xs cursor-pointer"
                                title="Ask Momo to quiz you"
                              >
                                🎓
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center shadow-2xs space-y-2">
                <span className="text-2xl">🌿</span>
                <div className="text-xs font-bold text-primary-text dark:text-white">
                  No topics scheduled for this week
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. MONTHLY / TOTAL PLAN VIEW (Roadmap Milestones & Progress Bars)       */}
      {/* ======================================================================= */}
      {viewCadence === 'monthly' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Total Roadmap Progress Hero Card */}
          <div className="bg-success text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider uppercase opacity-85">
                TOTAL ROADMAP PROGRESS
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/20">
                {totalPct}% Overall
              </span>
            </div>

            <div className="text-lg sm:text-xl font-black leading-snug">
              {completedTotalCount} of {totalTasksCount} total topics covered
            </div>

            {/* White Animated Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${totalPct}%` }}
              />
            </div>

            <div className="text-xs opacity-85 font-medium flex items-center justify-between">
              <span>Goal: {goal.title}</span>
              <span>{goal.durationDays || 60} Days Plan</span>
            </div>
          </div>

          {/* Phase / Milestone Progress Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
              Curriculum Phases & Milestones ({milestones.length})
            </div>

            {milestones.map((m, idx) => {
              const mTasks = m.tasks || [];
              const mCompleted = mTasks.filter((t) => t.completed).length;
              const mTotal = mTasks.length;
              const mPct = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

              return (
                <div
                  key={m.id}
                  className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black text-secondary-text uppercase tracking-wider">
                        Phase {idx + 1}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-primary-text dark:text-white break-words">
                        {m.title}
                      </h3>
                    </div>
                    <span className="text-xs font-black text-success flex-shrink-0">
                      {mCompleted}/{mTotal} topics · {mPct}%
                    </span>
                  </div>

                  {/* Phase Progress Bar */}
                  <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-success h-2 rounded-full transition-all duration-500"
                      style={{ width: `${mPct}%` }}
                    />
                  </div>

                  {/* Topics Pills List */}
                  <div className="space-y-1.5 pt-1">
                    {mTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-surface-secondary/50 dark:bg-surface-darkBorder/30"
                      >
                        <span
                          className={clsx(
                            'font-medium break-words leading-tight flex-1',
                            t.completed && 'line-through text-secondary-text'
                          )}
                        >
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(t.id, t.title);
                            }}
                            className="text-secondary-text hover:text-danger p-1"
                            title={`Delete ${t.title}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Direct Do / Undo Checkmark */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleTask) {
                                onToggleTask(t);
                              } else {
                                onVerifyTask(t);
                              }
                            }}
                            className={clsx(
                              'w-6 h-6 rounded flex items-center justify-center text-[10px] transition-all cursor-pointer',
                              t.completed
                                ? 'bg-success text-white'
                                : 'border border-border text-secondary-text hover:border-success'
                            )}
                            title={t.completed ? 'Topic completed — Click to undo' : 'Mark topic complete'}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {!t.completed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerifyTask(t);
                              }}
                              className="text-[10px] p-1 text-primary hover:text-primary-text"
                              title="Ask Momo to quiz you"
                            >
                              🎓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Take Phase Exam Button */}
                  {onTakeMilestoneTest && (
                    <button
                      type="button"
                      onClick={() => onTakeMilestoneTest(m)}
                      className="w-full mt-2 py-2.5 rounded-xl bg-surface-secondary dark:bg-surface-secondary text-primary-text dark:text-white hover:bg-border text-xs font-black transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Take Phase {idx + 1} Knowledge Exam ★</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPlanView;
