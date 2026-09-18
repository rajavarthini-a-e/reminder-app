import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  CalendarDays,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import { Task } from '@shared/types';
import clsx from 'clsx';
import { deleteTask } from '../services/api.js';

export const CalendarScreen: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loadDashboard, openVerification, toggleTask } = useAppStore();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    const newMonth = new Date(year, month - 1, 1);
    setCurrentMonthDate(newMonth);
    setSelectedDate(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(year, month + 1, 1);
    setCurrentMonthDate(newMonth);
    setSelectedDate(newMonth);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedDate(now);
  };

  const allTasks: Task[] = useMemo(() => {
    return (dashboardData?.goal?.milestones || []).flatMap((m) => m.tasks || []);
  }, [dashboardData]);

  // Tasks per day counts for dots
  const taskCountByDay = useMemo(() => {
    const counts: Record<string, { total: number; completed: number; critical: number }> = {};
    allTasks.forEach((t) => {
      const dayKey = new Date(t.scheduledTime).toISOString().split('T')[0];
      if (!counts[dayKey]) {
        counts[dayKey] = { total: 0, completed: 0, critical: 0 };
      }
      counts[dayKey].total += 1;
      if (t.completed) counts[dayKey].completed += 1;
      if (t.priority === 'CRITICAL') counts[dayKey].critical += 1;
    });
    return counts;
  }, [allTasks]);

  // Tasks strictly for the selected date
  const selectedDayTasks = useMemo(() => {
    const targetStr = selectedDate.toISOString().split('T')[0];
    return allTasks.filter((t) => {
      const taskDate = new Date(t.scheduledTime).toISOString().split('T')[0];
      return taskDate === targetStr;
    });
  }, [allTasks, selectedDate]);

  // Weekday chips for the scrubber (Screen 6)
  const currentWeekDays = useMemo(() => {
    const days = [];
    const curr = new Date(selectedDate);
    const dayOfWeek = curr.getDay(); // 0 is Sun
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Week navigation
  const nextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
    setCurrentMonthDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const prevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
    setCurrentMonthDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
  };

  const weekRangeLabel = useMemo(() => {
    if (currentWeekDays.length === 0) return '';
    const start = currentWeekDays[0];
    const end = currentWeekDays[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} – ${end.getDate()}`;
    }
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
  }, [currentWeekDays]);

  // Month grid days (5 or 6 weeks)
  const monthGridDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const leadingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon = 0
    const startGrid = new Date(firstDay);
    startGrid.setDate(firstDay.getDate() - leadingDays);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startGrid);
      d.setDate(startGrid.getDate() + i);
      days.push(d);
      // Stop at 35 days if month ended and week ended
      if (i === 34 && d.getMonth() !== month) {
        break;
      }
    }
    return days;
  }, [year, month]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all">
      {/* 1. Header & Month Navigator */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white">
            {monthName}
          </h1>
          <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
            Auto-scheduled timetable from your roadmap
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-surface dark:bg-surface-dark border border-border text-secondary-text hover:text-primary-text min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 py-1.5 rounded-xl bg-surface dark:bg-surface-dark border border-border text-xs font-bold text-primary-text hover:bg-surface-secondary min-h-[40px] cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-surface dark:bg-surface-dark border border-border text-secondary-text hover:text-primary-text min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Auto-Calendar Notice Card */}
      {allTasks.length > 0 ? (
        <div className="bg-success-soft border border-success/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📅</span>
            <div className="text-xs font-bold text-success-hover dark:text-success leading-relaxed">
              Calendar auto-scheduled from roadmap.
            </div>
          </div>

          {/* Week / Month View Switcher */}
          <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl p-0.5 border border-success/20">
            <button
              onClick={() => setViewMode('week')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition-all',
                viewMode === 'week'
                  ? 'bg-success text-white shadow-2xs'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition-all',
                viewMode === 'month'
                  ? 'bg-success text-white shadow-2xs'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              Month
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📅</span>
            <div>
              <div className="text-xs font-black text-primary-text dark:text-white">
                No study plan uploaded yet
              </div>
              <div className="text-[11px] text-secondary-text dark:text-gray-400">
                Upload or paste a study plan to generate your automated timetable.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded-xl bg-success text-white text-xs font-black hover:bg-success-hover transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5"
          >
            <span>Upload Plan</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* 3. Calendar View: Week Scrubber (with Prev/Next Week buttons) OR Month Grid */}
      {viewMode === 'week' ? (
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs space-y-3">
          {/* Week Navigation Header */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={prevWeek}
              className="flex items-center gap-1 text-xs font-bold text-secondary-text hover:text-primary-text p-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer"
              title="Previous 7 Days"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Week</span>
            </button>

            <span className="text-xs font-black text-primary-text dark:text-white">
              {weekRangeLabel}
            </span>

            <button
              onClick={nextWeek}
              className="flex items-center gap-1 text-xs font-bold text-secondary-text hover:text-primary-text p-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer"
              title="Next 7 Days"
            >
              <span>Next Week</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 7-Day Buttons */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {currentWeekDays.map((d) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const dayNum = d.getDate();
              const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
              const dateKey = d.toISOString().split('T')[0];
              const taskInfo = taskCountByDay[dateKey];

              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  className={clsx(
                    'flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer min-h-[52px] relative',
                    isSelected
                      ? 'bg-lavender-soft border-2 border-primary text-primary font-black shadow-xs'
                      : isToday
                      ? 'bg-warning-soft text-warning font-bold'
                      : 'bg-surface-secondary text-secondary-text hover:text-primary-text'
                  )}
                >
                  <span className="text-[10px] font-bold opacity-75">{dayName}</span>
                  <span className="text-xs font-black">{dayNum}</span>

                  {/* Task Indicator Dot */}
                  {taskInfo && taskInfo.total > 0 && (
                    <span
                      className={clsx(
                        'w-1.5 h-1.5 rounded-full mt-0.5',
                        taskInfo.completed === taskInfo.total
                          ? 'bg-success'
                          : taskInfo.critical > 0
                          ? 'bg-danger'
                          : 'bg-primary'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] text-secondary-text dark:text-gray-400 font-medium px-1">
            <span>🟢 Completed</span>
            <span>🟣 Has Topics</span>
            <span>🔴 Critical</span>
            <span>⭐ Today</span>
          </div>
        </div>
      ) : (
        /* Full Month Grid */
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
              {monthName} Overview
            </span>
            <span className="text-[11px] text-secondary-text font-medium">
              Click any date to view topics
            </span>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-secondary-text">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>

          {/* Month grid days */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {monthGridDays.map((d) => {
              const isCurrentMonth = d.getMonth() === month;
              const isToday = d.toDateString() === new Date().toDateString();
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const dateKey = d.toISOString().split('T')[0];
              const taskInfo = taskCountByDay[dateKey];

              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setSelectedDate(d);
                    if (d.getMonth() !== month) {
                      setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    }
                  }}
                  className={clsx(
                    'py-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer min-h-[44px]',
                    isSelected
                      ? 'bg-lavender-soft border-2 border-primary text-primary font-black shadow-xs'
                      : isToday
                      ? 'bg-warning-soft text-warning font-black'
                      : isCurrentMonth
                      ? 'bg-surface-secondary/60 text-primary-text hover:bg-surface-secondary font-medium'
                      : 'opacity-30 text-secondary-text'
                  )}
                >
                  <span>{d.getDate()}</span>
                  {taskInfo && taskInfo.total > 0 && (
                    <span
                      className={clsx(
                        'w-1.5 h-1.5 rounded-full mt-0.5',
                        taskInfo.completed === taskInfo.total
                          ? 'bg-success'
                          : taskInfo.critical > 0
                          ? 'bg-danger'
                          : 'bg-primary'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Selected Day Task List (Mockup Screen 6 Agenda View) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · Scheduled Topics ({selectedDayTasks.length})
          </div>
          <span className="text-[11px] font-bold text-secondary-text">
            {selectedDayTasks.filter((t) => t.completed).length} / {selectedDayTasks.length} done
          </span>
        </div>

        {/* Task Cards with Do/Undo Checkmark & Delete */}
        {selectedDayTasks.length > 0 ? (
          selectedDayTasks.map((task, idx) => {
            const isCritical = task.priority === 'CRITICAL' || idx === 0;
            const stripeColor = task.completed
              ? 'bg-success'
              : isCritical
              ? 'bg-danger'
              : idx % 2 === 0
              ? 'bg-success'
              : 'bg-primary';

            return (
              <div
                key={task.id}
                className={clsx(
                  'bg-white dark:bg-surface-dark border rounded-2xl p-3.5 shadow-2xs flex items-center gap-3 transition-all',
                  task.completed
                    ? 'border-border/60 opacity-85'
                    : 'border-border dark:border-surface-darkBorder'
                )}
              >
                {/* Colored Left Stripe */}
                <div className={clsx('w-1.5 h-10 rounded-full flex-shrink-0', stripeColor)} />

                <div className="flex-1 min-w-0">
                  <div
                    className={clsx(
                      'text-xs font-black text-primary-text dark:text-white break-words leading-snug',
                      task.completed && 'line-through text-secondary-text'
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] font-medium text-secondary-text dark:text-gray-400 flex items-center gap-2 mt-0.5">
                    <span className={clsx('font-bold', isCritical ? 'text-danger' : 'text-success')}>
                      {isCritical ? 'Critical · Phase 2' : 'Daily Topic'}
                    </span>
                    <span>·</span>
                    <span>{task.estimatedMinutes} min</span>
                  </div>
                </div>

                {/* Delete Task Button (>= 40px min touch target) */}
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${task.title}" from your calendar?`)) {
                      try {
                        await deleteTask(task.id);
                        await loadDashboard();
                      } catch (err) {
                        console.error('Failed to delete task:', err);
                      }
                    }
                  }}
                  className="min-w-[40px] min-h-[48px] rounded-xl flex items-center justify-center text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                  title={`Delete ${task.title}`}
                  aria-label={`Delete ${task.title}`}
                >
                  <Trash2 className="w-4 h-4 stroke-[2]" />
                </button>

                {/* Direct Do / Undo Checkmark Button */}
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await toggleTask(task.id);
                  }}
                  className={clsx(
                    'min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs',
                    task.completed
                      ? 'bg-success text-white'
                      : 'border-2 border-border dark:border-surface-darkBorder text-secondary-text hover:border-success hover:text-success'
                  )}
                  title={task.completed ? 'Topic completed — Click to undo' : 'Click to complete topic'}
                  aria-label={task.completed ? 'Topic completed — Click to undo' : 'Click to complete topic'}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Optional Mentor verification modal button if not yet completed */}
                {!task.completed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVerification(task);
                    }}
                    className="p-2 rounded-xl text-primary bg-lavender-soft hover:bg-primary hover:text-white transition-all min-h-[48px] flex items-center justify-center cursor-pointer"
                    title="Ask Momo to quiz you on this topic"
                    aria-label="Ask Momo to quiz you"
                  >
                    <span className="text-xs font-black">🎓</span>
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center shadow-2xs space-y-1.5">
            <span className="text-2xl">🌿</span>
            <div className="text-xs font-bold text-primary-text dark:text-white">
              No topics scheduled for this date
            </div>
            <p className="text-[11px] text-secondary-text dark:text-gray-400">
              {allTasks.length === 0
                ? 'Upload or paste a study plan to schedule tasks on your calendar.'
                : 'Take a rest or use the week navigation to view active study dates.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarScreen;
