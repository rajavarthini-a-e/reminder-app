import React, { useState, useMemo } from 'react';
import { Plus, Check, Flame, Trash2, Settings, Bell, Volume2, VolumeX } from 'lucide-react';
import {
  Routine,
  ALL_DAYS,
  DAY_MAP,
  getRoutineTodayCount,
  getRoutineTargetCount,
  isRoutineCompletedOnDate,
  incrementRoutineCount,
  decrementRoutineCount,
} from '../../services/routinesService.js';
import { EditRoutineModal } from '../routines/EditRoutineModal.js';
import { routineReminderService } from '../../services/routineReminderService.js';
import { soundService } from '../../services/sound.service.js';
import clsx from 'clsx';

interface PersonalRoutinesViewProps {
  routines: Routine[];
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
  onOpenCreateModal: () => void;
  longestStreak: number;
}

export const PersonalRoutinesView: React.FC<PersonalRoutinesViewProps> = ({
  routines,
  onToggleRoutine,
  onDeleteRoutine,
  onOpenCreateModal,
  longestStreak,
}) => {
  const [viewCadence, setViewCadence] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const isSoundMuted = soundService.getMuted();

  const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = getTodayKey();
  const isRoutineDoneToday = (r: Routine) => isRoutineCompletedOnDate(r, todayKey);

  const completedCount = routines.filter(isRoutineDoneToday).length;
  const totalCount = routines.length;

  // Proportional progress calculation: interval routines progress smoothly with each check
  const routinePct = useMemo(() => {
    if (totalCount === 0) return 0;
    const totalRatio = routines.reduce((acc, r) => {
      if (r.frequencyType === 'interval') {
        const count = getRoutineTodayCount(r, todayKey);
        const target = getRoutineTargetCount(r);
        return acc + Math.min(1, count / target);
      }
      return acc + (isRoutineDoneToday(r) ? 1 : 0);
    }, 0);
    return Math.round((totalRatio / totalCount) * 100);
  }, [routines, todayKey]);

  // 7 days of current week (Mon-Sun)
  const currentWeekDays = React.useMemo(() => {
    const days = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${date}`;
      const name = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'][i];
      days.push({ key, name, isToday: key === todayKey, dayNum: d.getDate() });
    }
    return days;
  }, [todayKey]);

  // 30 days history for monthly retention matrix
  const past30Days = React.useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      days.push({ key: `${y}-${m}-${date}`, dayNum: d.getDate() });
    }
    return days;
  }, []);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 3-Way Segmented View Cadence Toggle: Daily / Weekly / Monthly */}
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
                  ? 'bg-peach text-white shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              {cadence}
            </button>
          );
        })}
      </div>

      {/* ======================================================================= */}
      {/* 1. DAILY VIEW (Today's Checklist)                                       */}
      {/* ======================================================================= */}
      {viewCadence === 'daily' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Today's Routines Hero Card */}
          <div className="bg-peach dark:bg-[#281C16] dark:border dark:border-peach/30 text-white dark:text-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="text-[11px] font-black tracking-wider uppercase opacity-85">
              TODAY'S ROUTINES
            </div>
            <div className="text-lg sm:text-xl font-black leading-snug">
              {completedCount} of {totalCount} done
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/30 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white dark:bg-peach h-2 rounded-full transition-all duration-500"
                style={{ width: `${routinePct}%` }}
              />
            </div>
          </div>

          {/* Reminder Schedule & Fast Test Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-surface-secondary dark:bg-surface-darkBorder border border-border/70 text-xs">
            <div className="flex items-center gap-2">
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4 text-warning flex-shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-success flex-shrink-0" />
              )}
              <span className="text-[11px] font-bold text-primary-text dark:text-gray-200">
                {isSoundMuted ? 'Sound muted (Pop-up alone)' : 'Sound alerts ON (Chime + Pop-up)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                routineReminderService.triggerTestReminder();
              }}
              className="py-1.5 px-3 rounded-xl bg-peach text-white hover:bg-peach-hover text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Test 30m hydration reminder alert"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test 30m Water Alert</span>
            </button>
          </div>

          {/* Daily Habit Cards */}
          <div className="space-y-2">
            <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
              Daily Habits
            </div>

            {routines.length > 0 ? (
              routines.map((routine) => {
                const isInterval = routine.frequencyType === 'interval';
                const todayCount = getRoutineTodayCount(routine, todayKey);
                const targetCount = getRoutineTargetCount(routine);
                const isDone = isRoutineCompletedOnDate(routine, todayKey);

                return (
                  <div
                    key={routine.id}
                    className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5 min-h-[56px]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Routine Icon in Peach/Sky Box */}
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
                          isInterval
                            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                            : 'bg-peach-soft'
                        )}
                      >
                        {routine.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={clsx(
                            'text-xs font-bold text-primary-text dark:text-white break-words leading-snug',
                            !isInterval && isDone && 'line-through text-secondary-text'
                          )}
                        >
                          {routine.name}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span
                            className={clsx(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black',
                              isInterval
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                : 'bg-surface-secondary text-secondary-text dark:bg-surface-darkBorder dark:text-gray-300'
                            )}
                          >
                            {isInterval
                              ? `Every ${routine.intervalMinutes || 30} mins`
                              : `Once a day · ${routine.reminderTime || '9:00 PM'}`}
                          </span>
                          <span className="text-[10px] text-secondary-text dark:text-gray-400 font-medium">
                            {routine.repeatDays.length === 7 ? 'Daily' : routine.repeatDays.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Edit Routine Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRoutine(routine);
                        }}
                        className="min-w-[40px] min-h-[44px] rounded-xl flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-secondary dark:hover:bg-surface-darkBorder transition-all cursor-pointer"
                        title={`Edit ${routine.name} frequency & reminder`}
                        aria-label={`Edit ${routine.name}`}
                      >
                        <Settings className="w-4 h-4 stroke-[2]" />
                      </button>

                      {/* Delete Routine Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${routine.name}" habit?`)) {
                            onDeleteRoutine(routine.id);
                          }
                        }}
                        className="min-w-[40px] min-h-[44px] rounded-xl flex items-center justify-center text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                        title={`Delete ${routine.name}`}
                        aria-label={`Delete ${routine.name}`}
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>

                      {/* Check Controls: Stepper for Interval, Checkbox for Once Daily */}
                      {isInterval ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Decrement / Undo button (-) */}
                          <button
                            type="button"
                            disabled={todayCount === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              decrementRoutineCount(routine.id);
                            }}
                            className={clsx(
                              'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all cursor-pointer',
                              todayCount > 0
                                ? 'bg-surface-secondary dark:bg-surface-darkBorder text-secondary-text hover:text-danger hover:bg-danger-soft/30'
                                : 'opacity-20 cursor-not-allowed text-secondary-text bg-surface-secondary/40'
                            )}
                            title="Undo one drink (-1)"
                            aria-label="Undo drink"
                          >
                            -
                          </button>

                          {/* Tactile 30m Check / +1 Button */}
                          <button
                            type="button"
                            onClick={() => {
                              incrementRoutineCount(routine.id);
                              if (!isSoundMuted) {
                                if (routine.name.toLowerCase().includes('water')) {
                                  soundService.playWaterDroplet();
                                } else {
                                  soundService.playVictory();
                                }
                              }
                            }}
                            className={clsx(
                              'min-w-[62px] min-h-[48px] px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95',
                              isDone
                                ? 'bg-success hover:bg-success-hover text-white'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                            )}
                            title={`Log 30m drink (${todayCount}/${targetCount})`}
                            aria-label={`Log drink for ${routine.name}`}
                          >
                            {isDone ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span className="text-xs font-black">{todayCount}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="text-xs font-black">
                                  {todayCount}/{targetCount}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        /* Tactile 48px Check Button for Once-a-Day habits */
                        <button
                          type="button"
                          onClick={() => onToggleRoutine(routine.id)}
                          className={clsx(
                            'min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all cursor-pointer',
                            isDone
                              ? 'bg-success text-white shadow-xs'
                              : 'border-2 border-border dark:border-surface-darkBorder text-transparent hover:border-peach'
                          )}
                          title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>

                    {/* Hydration Progress Bar for Interval Routines */}
                    {isInterval && (
                      <div className="pt-0.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-sky-700 dark:text-sky-300 flex items-center gap-1">
                            <span>💧</span>
                            <span>
                              {todayCount} of {targetCount} {routine.name.toLowerCase().includes('water') ? 'glasses drank' : 'checks'} today
                            </span>
                          </span>
                          {isDone ? (
                            <span className="text-[10px] font-black text-success flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>🎉 Daily Goal Met!</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-secondary-text dark:text-gray-400 font-bold">
                              {Math.min(100, Math.round((todayCount / targetCount) * 100))}%
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-sky-100 dark:bg-sky-950/60 rounded-full h-2 overflow-hidden">
                          <div
                            className={clsx(
                              'h-2 rounded-full transition-all duration-300',
                              isDone ? 'bg-success' : 'bg-sky-500'
                            )}
                            style={{
                              width: `${Math.min(100, Math.round((todayCount / targetCount) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center shadow-2xs space-y-2">
                <span className="text-2xl">✨</span>
                <div className="text-xs font-bold text-primary-text dark:text-white">
                  No habits configured yet
                </div>
                <p className="text-[11px] text-secondary-text dark:text-gray-400">
                  Click "+ Create new routine" below to add custom personal habits.
                </p>
              </div>
            )}
          </div>

          {/* Longest Streak Card */}
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 text-center space-y-1 shadow-2xs">
            <div className="text-xs font-medium text-secondary-text dark:text-gray-400">
              Longest streak
            </div>
            <div className="text-xl font-black text-primary-text dark:text-white flex items-center justify-center gap-1">
              <span>🔥</span>
              <span>{longestStreak} days</span>
            </div>
          </div>

          {/* Habit Coach Insight */}
          <div className="bg-peach-soft dark:bg-surface border border-peach/20 dark:border-border rounded-2xl p-4 space-y-1">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">🐱</span>
              <div className="text-xs text-peach-text dark:text-gray-200 leading-relaxed font-medium break-words">
                {completedCount === 0
                  ? "Consistency starts with Day 1. Check off today's habits as you complete them to build your streak!"
                  : completedCount === totalCount
                  ? "Flawless routine execution today! Every completed habit solidifies your discipline."
                  : `${completedCount} of ${totalCount} habits checked off today. Keep up the momentum!`}
              </div>
            </div>
          </div>

          {/* CTA: Create New Routine */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-peach hover:bg-peach-hover text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create new routine</span>
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. WEEKLY VIEW (7-Day Strip per Routine)                                */}
      {/* ======================================================================= */}
      {viewCadence === 'weekly' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
            7-Day Weekly Consistency
          </div>

          {routines.map((routine) => {
            const completedDaysCount = currentWeekDays.filter(
              (day) => isRoutineCompletedOnDate(routine, day.key)
            ).length;
            const weeklyRate = Math.round((completedDaysCount / 7) * 100);

            return (
              <div
                key={routine.id}
                className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{routine.icon}</span>
                    <span className="text-xs font-black text-primary-text dark:text-white break-words">
                      {routine.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-peach">
                      {completedDaysCount} of 7 days · {weeklyRate}%
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${routine.name}" habit?`)) {
                          onDeleteRoutine(routine.id);
                        }
                      }}
                      className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                      title={`Delete ${routine.name}`}
                      aria-label={`Delete ${routine.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Visual Strip */}
                <div className="grid grid-cols-7 gap-1.5 text-center pt-1">
                  {currentWeekDays.map((day) => {
                    const isDone = isRoutineCompletedOnDate(routine, day.key);
                    const dayCount = getRoutineTodayCount(routine, day.key);
                    const isInterval = routine.frequencyType === 'interval';

                    return (
                      <div
                        key={day.key}
                        className={clsx(
                          'py-2 rounded-xl flex flex-col items-center justify-center transition-all',
                          isDone
                            ? 'bg-peach text-white shadow-2xs font-black'
                            : dayCount > 0
                            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800'
                            : 'bg-surface-secondary text-secondary-text border border-border'
                        )}
                      >
                        <span className="text-[10px] font-bold">{day.name}</span>
                        <span className="text-xs mt-0.5 font-black">
                          {isDone ? '✓' : isInterval && dayCount > 0 ? `${dayCount}` : '·'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-peach h-2 rounded-full transition-all duration-500"
                    style={{ width: `${weeklyRate}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Weekly Summary Card */}
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 text-center space-y-1 shadow-2xs">
            <div className="text-xs font-medium text-secondary-text">Weekly Consistency</div>
            <div className="text-base font-black text-primary-text dark:text-white">
              {routines.some((r) => Object.keys(r.completions || {}).length > 0 || Object.keys(r.dailyCounts || {}).length > 0)
                ? '✨ Habit progress logged for this week'
                : '🌱 Check off daily habits this week to track your consistency rate'}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white font-black text-xs hover:bg-success-hover transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create new routine</span>
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. MONTHLY VIEW (Full Month Calendar Matrix & Retention Summary)        */}
      {/* ======================================================================= */}
      {viewCadence === 'monthly' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
            Monthly Retention & Streaks
          </div>

          {routines.map((routine) => {
            const completedDays = past30Days.filter(
              (day) => isRoutineCompletedOnDate(routine, day.key)
            ).length;
            const monthlyRate = Math.round((completedDays / 30) * 100);

            return (
              <div
                key={routine.id}
                className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{routine.icon}</span>
                    <span className="text-xs font-black text-primary-text dark:text-white break-words">
                      {routine.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-peach">
                      {completedDays}/30 days · {monthlyRate}%
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${routine.name}" habit?`)) {
                          onDeleteRoutine(routine.id);
                        }
                      }}
                      className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-secondary-text hover:text-danger hover:bg-danger-soft/40 transition-all cursor-pointer"
                      title={`Delete ${routine.name}`}
                      aria-label={`Delete ${routine.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>

                {/* 30-Day Calendar Dot Matrix (5 rows x 6 cols) */}
                <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border/60">
                  <div className="grid grid-cols-10 gap-1.5 justify-items-center">
                    {past30Days.map((day, d) => {
                      const isCompleted = isRoutineCompletedOnDate(routine, day.key);
                      const dayCount = getRoutineTodayCount(routine, day.key);
                      return (
                        <div
                          key={day.key}
                          className={clsx(
                            'w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold transition-all',
                            isCompleted
                              ? 'bg-peach text-white shadow-2xs'
                              : dayCount > 0
                              ? 'bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                              : 'bg-white text-secondary-text/50 border border-border/50'
                          )}
                          title={`Day ${d + 1}: ${isCompleted ? 'Completed' : dayCount > 0 ? `${dayCount} checks` : 'Pending'}`}
                        >
                          {day.dayNum}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Streak & Completion Stats */}
                <div className="flex items-center justify-between text-xs text-secondary-text pt-1">
                  <span className="font-bold text-primary-text dark:text-white">
                    🔥 Streak: {routine.streak || 0} days continuous
                  </span>
                  <span>{monthlyRate}% Monthly consistency</span>
                </div>
              </div>
            );
          })}

          {/* Monthly Mastery Card */}
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 text-center space-y-1 shadow-2xs">
            <div className="text-xs font-medium text-secondary-text">Monthly Habit Retention</div>
            <div className="text-base font-black text-primary-text dark:text-white">
              {routines.filter((r) => r.streak > 0).length > 0
                ? `🏆 ${routines.filter((r) => r.streak > 0).length} habit(s) sustained with active streak`
                : '🌱 Complete habits daily to build continuous monthly retention'}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white font-black text-xs hover:bg-success-hover transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create new routine</span>
          </button>
        </div>
      )}

      {/* Edit Routine Modal */}
      <EditRoutineModal
        routine={editingRoutine}
        isOpen={!!editingRoutine}
        onClose={() => setEditingRoutine(null)}
        onUpdated={() => {
          setEditingRoutine(null);
        }}
      />
    </div>
  );
};

export default PersonalRoutinesView;
