import React, { useState, useMemo } from 'react';
import {
  Flame,
  Check,
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  Routine,
  RoutineDay,
  ALL_DAYS,
  DAY_MAP,
  getRoutineTodayCount,
  getRoutineTargetCount,
  isRoutineCompletedOnDate,
} from '../../services/routinesService.js';
import clsx from 'clsx';

interface PersonalAnalyticsViewProps {
  routines: Routine[];
  onOpenCreateModal?: () => void;
  longestStreak?: number;
}

export const PersonalAnalyticsView: React.FC<PersonalAnalyticsViewProps> = ({
  routines,
  onOpenCreateModal,
  longestStreak = 0,
}) => {
  // Selected routine for detailed analytics (default to first routine, e.g. "Drink water")
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(() => {
    return routines[0]?.id || '';
  });

  // Time period switcher: Day | Week | Month (Matching Image 2)
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');

  // Keep selectedRoutineId valid if routines change
  const selectedRoutine = useMemo(() => {
    return routines.find((r) => r.id === selectedRoutineId) || routines[0] || null;
  }, [routines, selectedRoutineId]);

  // Current week dates: Monday to Sunday
  const currentWeekDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const days: { date: Date; key: string; dayName: string; shortName: string; isToday: boolean }[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      const isToday = d.toDateString() === now.toDateString();

      days.push({
        date: d,
        key,
        dayName: dayNames[i],
        shortName: dayNames[i].slice(0, 1),
        isToday,
      });
    }
    return days;
  }, []);

  // Compute analytics for the selected routine
  const routineStats = useMemo(() => {
    if (!selectedRoutine) {
      return {
        completedThisWeek: 0,
        targetThisWeek: 0,
        weekPct: 0,
        completedThisMonth: 0,
        totalCompletions: 0,
        weekDayStatus: [] as { dayName: string; completed: boolean; count: number; isToday: boolean; isScheduled: boolean }[],
        wavePoints: [] as number[],
        averageConsistency: 0,
        targetGoal: 1,
        isInterval: false,
      };
    }

    const completions = selectedRoutine.completions || {};
    const totalCompletions = Object.keys(completions).length;
    const isInterval = selectedRoutine.frequencyType === 'interval';
    const targetGoal = getRoutineTargetCount(selectedRoutine);

    // Week stats
    let completedThisWeek = 0;
    let targetThisWeek = 0;
    const weekDayStatus = currentWeekDates.map((day) => {
      const isDone = isRoutineCompletedOnDate(selectedRoutine, day.key);
      const count = getRoutineTodayCount(selectedRoutine, day.key);
      const dayIndex = day.date.getDay();
      const routineDayKey = DAY_MAP[dayIndex];
      const isScheduled = selectedRoutine.repeatDays.includes(routineDayKey);

      if (isScheduled) targetThisWeek += 1;
      if (isDone) completedThisWeek += 1;

      return {
        dayName: day.dayName,
        completed: isDone,
        count,
        isToday: day.isToday,
        isScheduled,
      };
    });

    const targetBase = targetThisWeek > 0 ? targetThisWeek : selectedRoutine.repeatDays.length || 7;
    const weekPct = Math.min(100, Math.round((completedThisWeek / targetBase) * 100));

    // Month stats
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const completedThisMonth = Object.keys(completions).filter((k) => k.startsWith(currentMonthPrefix)).length;

    // Wave chart data points (0 to 100 curve for each of the 7 days)
    const wavePoints = weekDayStatus.map((d, idx) => {
      if (isInterval) {
        if (d.count > 0) return Math.min(95, 25 + Math.round((d.count / targetGoal) * 70));
        if (d.isScheduled) return 25;
        return 15;
      }
      if (d.completed) return 75 + ((idx % 3) * 8); // 75 - 91
      if (d.isScheduled) return 25 + ((idx % 2) * 5); // 25 - 30
      return 15;
    });

    const averageConsistency = weekPct > 0 ? weekPct : totalCompletions > 0 ? 65 : 0;

    return {
      completedThisWeek,
      targetThisWeek: targetBase,
      weekPct,
      completedThisMonth,
      totalCompletions,
      weekDayStatus,
      wavePoints,
      averageConsistency,
      targetGoal,
      isInterval,
    };
  }, [selectedRoutine, currentWeekDates]);

  // SVG Wave path generator for the smooth gradient area chart (Matching Image 2)
  const svgWavePath = useMemo(() => {
    const points = routineStats.wavePoints;
    if (points.length === 0) return { linePath: '', areaPath: '' };

    const width = 280;
    const height = 90;
    const step = width / (points.length - 1);

    // Map value 0-100 to y coordinate (height to 10)
    const coords = points.map((p, i) => ({
      x: i * step,
      y: height - (p / 100) * (height - 15),
    }));

    // Smooth bezier curve generator
    let linePath = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      linePath += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const areaPath = `${linePath} L ${width},${height} L 0 revolutionary L 0,${height} Z`.replace(
      'revolutionary',
      ''
    );
    const cleanAreaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return { linePath, areaPath: cleanAreaPath };
  }, [routineStats.wavePoints]);

  if (routines.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center shadow-2xs space-y-3">
        <span className="text-3xl">✨</span>
        <h3 className="text-sm font-black text-primary-text dark:text-white">
          No Personal Habits Created Yet
        </h3>
        <p className="text-xs text-secondary-text dark:text-gray-400 max-w-sm mx-auto">
          Create daily routines like Drink Water, Meditation, or Reading on Home to unlock habit analytics and streak trends.
        </p>
        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="py-2.5 px-4 rounded-xl bg-peach text-white text-xs font-black hover:bg-peach/90 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Routine</span>
          </button>
        )}
      </div>
    );
  }

  // Radial ring parameters for Card 1
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const ringProgress = Math.min(100, routineStats.weekPct);
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Habit Selection Carousel / Chips (Switch analytics for each task created in Home) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
            Your Personal Tasks ({routines.length})
          </span>
          <span className="text-[11px] text-secondary-text font-medium">
            Select a task to view analytics
          </span>
        </div>

        {/* Scrollable Habit Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {routines.map((r) => {
            const isSelected = r.id === selectedRoutine?.id;
            const completionsCount = Object.keys(r.completions || {}).length;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoutineId(r.id)}
                className={clsx(
                  'flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all flex-shrink-0 cursor-pointer border',
                  isSelected
                    ? 'bg-peach text-white border-peach shadow-xs'
                    : 'bg-white dark:bg-surface-dark border-border/80 text-secondary-text hover:text-primary-text hover:border-peach/50'
                )}
              >
                <span className="text-base">{r.icon}</span>
                <span>{r.name}</span>
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-secondary text-secondary-text'
                  )}
                >
                  {r.streak || 0}d
                </span>
              </button>
            );
          })}

          {onOpenCreateModal && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="py-2 px-3 rounded-xl border border-dashed border-peach/60 text-peach text-xs font-black hover:bg-peach-soft transition-all flex-shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. DEDICATED ANALYTICS FOR SELECTED TASK (Modeled directly after Image 2) */}
      {/* ======================================================================= */}
      {selectedRoutine && (
        <div className="space-y-3.5">
          {/* Active Task Sub-Header */}
          <div className="bg-white dark:bg-surface-dark border border-border/70 dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-peach-soft text-peach flex items-center justify-center text-xl flex-shrink-0">
                {selectedRoutine.icon}
              </div>
              <div>
                <h2 className="text-sm font-black text-primary-text dark:text-white leading-tight">
                  {selectedRoutine.name} Analytics
                </h2>
                <div className="text-[11px] text-secondary-text dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Scheduled at {selectedRoutine.reminderTime}</span>
                  <span>·</span>
                  <span>{selectedRoutine.repeatDays.length === 7 ? 'Daily' : `${selectedRoutine.repeatDays.length} days/wk`}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-soft text-warning text-xs font-black border border-warning/30">
              <Flame className="w-3.5 h-3.5 fill-warning" />
              <span>{selectedRoutine.streak || 0}d streak</span>
            </div>
          </div>

          {/* TWO-CARD ANALYTICS SECTION (Matching Image 2: Left Radial Ring Card + Right Wave Chart Card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* CARD 1: Radial Goal & Consistency Ring (Left Card in Image 2) */}
            <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-primary-text dark:text-white">
                  {selectedRoutine.name}
                </span>
                <span className="text-[10px] font-bold text-peach bg-peach-soft px-2 py-0.5 rounded-full">
                  Target: {selectedRoutine.repeatDays.length === 7 ? 'Daily Goal' : `${selectedRoutine.repeatDays.length}x Goal`}
                </span>
              </div>

              {/* Radial Circular Progress Ring */}
              <div className="flex flex-col items-center justify-center py-2 relative">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 110 110">
                  {/* Background Track */}
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-surface-secondary dark:text-surface-darkBorder"
                    fill="transparent"
                  />
                  {/* Active Progress Stroke */}
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-peach transition-all duration-700 ease-out"
                    fill="transparent"
                  />
                </svg>

                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                    Consistency
                  </span>
                  <span className="text-2xl font-black text-primary-text dark:text-white">
                    {routineStats.weekPct}%
                  </span>
                  <span className="text-[10px] font-black text-peach mt-0.5">
                    {routineStats.completedThisWeek}/{routineStats.targetThisWeek} Days
                  </span>
                </div>
              </div>

              {/* Complete vs Target Columns (Matching Image 2) */}
              <div className="grid grid-cols-2 divide-x divide-border/60 text-center pt-2 border-t border-border/50">
                <div className="pr-2">
                  <div className="text-[10px] font-bold text-secondary-text">Completed</div>
                  <div className="text-sm font-black text-primary-text dark:text-white mt-0.5">
                    {routineStats.completedThisWeek} check-ins
                  </div>
                </div>
                <div className="pl-2">
                  <div className="text-[10px] font-bold text-secondary-text">Target</div>
                  <div className="text-sm font-black text-peach mt-0.5">
                    {routineStats.targetThisWeek} days/wk
                  </div>
                </div>
              </div>

              {/* Log Timeline Breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-black text-secondary-text uppercase tracking-wider">
                  Recent Check-In Activity
                </div>
                {routineStats.weekDayStatus.some((d) => d.completed || d.count > 0) ? (
                  <div className="space-y-1 text-xs">
                    {routineStats.weekDayStatus
                      .filter((d) => d.completed || d.count > 0)
                      .slice(0, 3)
                      .map((d) => (
                        <div
                          key={d.dayName}
                          className="flex items-center justify-between p-2 rounded-xl bg-surface-secondary/60 text-primary-text dark:text-white text-[11px]"
                        >
                          <span className="font-bold">
                            {d.isToday ? 'Today' : d.dayName} · {selectedRoutine.reminderTime}
                          </span>
                          <span className={clsx(
                            'font-black flex items-center gap-1',
                            d.completed ? 'text-peach' : 'text-sky-600 dark:text-sky-400'
                          )}>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>
                              {routineStats.isInterval
                                ? `${d.count}/${routineStats.targetGoal} glasses`
                                : 'Logged'}
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-secondary-text py-2 text-center bg-surface-secondary/40 rounded-xl">
                    No check-ins logged yet this week.
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: Statistics & Consistency Wave Chart (Right Card in Image 2) */}
            <div className="bg-white dark:bg-surface-dark border border-border/80 dark:border-surface-darkBorder rounded-2xl p-5 shadow-2xs space-y-4">
              {/* Header & Day | Week | Month Tabs */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-primary-text dark:text-white">
                  Statistics
                </span>
                <div className="flex items-center bg-surface-secondary dark:bg-surface-darkBorder rounded-xl p-0.5 border border-border/40">
                  {(['day', 'week', 'month'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setTimePeriod(period)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-[10px] font-black capitalize transition-all cursor-pointer',
                        timePeriod === period
                          ? 'bg-peach text-white shadow-2xs'
                          : 'text-secondary-text hover:text-primary-text'
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smooth SVG Wave Area Chart (Matching Image 2) */}
              <div className="relative pt-2">
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 280 90" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="peachGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D47B58" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#D47B58" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill */}
                  {svgWavePath.areaPath && (
                    <path d={svgWavePath.areaPath} fill="url(#peachGradient)" />
                  )}

                  {/* Smooth Curved Line */}
                  {svgWavePath.linePath && (
                    <path
                      d={svgWavePath.linePath}
                      fill="none"
                      stroke="#D47B58"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* X-Axis Day Labels */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-secondary-text pt-1">
                  {currentWeekDates.map((d) => (
                    <span key={d.key} className={clsx(d.isToday && 'text-peach font-black')}>
                      {d.shortName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Successful Days in a Row (Matching Image 2) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-primary-text dark:text-white">
                    Successful days in a row
                  </span>
                  <span className="text-[10px] text-peach font-bold">
                    {selectedRoutine.streak || 0} consecutive
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {routineStats.weekDayStatus.map((d, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                          d.completed
                            ? 'bg-peach text-white shadow-2xs'
                            : d.count > 0
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-black border border-sky-300 dark:border-sky-800'
                            : d.isScheduled
                            ? 'border-2 border-border/80 text-secondary-text bg-surface-secondary/40'
                            : 'border border-dashed border-border/50 text-secondary-text/50'
                        )}
                        title={`${d.dayName}: ${d.completed ? 'Completed' : d.count > 0 ? `${d.count} checks` : 'Missed'}`}
                      >
                        {d.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : d.count > 0 ? (
                          <span className="text-[10px] font-black">{d.count}</span>
                        ) : (
                          <span className="text-[10px] font-bold opacity-60">{d.dayName.slice(0, 1)}</span>
                        )}
                      </div>
                      <span className={clsx('text-[9px] font-bold', d.isToday ? 'text-peach' : 'text-secondary-text')}>
                        {d.dayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details List (Matching Image 2) */}
              <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                <div className="text-[10px] font-black text-secondary-text uppercase tracking-wider">
                  Details
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-peach" />
                      <span>Weekly Consistency</span>
                    </span>
                    <span className="font-black text-primary-text dark:text-white">
                      {routineStats.weekPct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      <span>Habit Frequency</span>
                    </span>
                    <span className="font-black text-primary-text dark:text-white">
                      {selectedRoutine.frequencyType === 'interval'
                        ? `Every ${selectedRoutine.intervalMinutes || 30} mins`
                        : selectedRoutine.repeatDays.length === 7
                        ? `Daily at ${selectedRoutine.reminderTime || '9:00 PM'} (Once a day)`
                        : `${selectedRoutine.repeatDays.join(', ')} at ${selectedRoutine.reminderTime || '9:00 PM'} (Once a day)`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span>Monthly Check-ins</span>
                    </span>
                    <span className="font-black text-primary-text dark:text-white">
                      {routineStats.completedThisMonth} completions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. ALL HABITS CONSISTENCY SUMMARY LIST                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
            All Habits Consistency Summary
          </span>
          <span className="text-xs text-secondary-text font-bold">
            Longest streak: {longestStreak}d 🔥
          </span>
        </div>

        <div className="space-y-2">
          {routines.map((r) => {
            const isSelected = r.id === selectedRoutine.id;
            const completedCount = Object.keys(r.completions || {}).length;
            const targetTotal = Math.max(completedCount, 7);
            const rate = Math.round((completedCount / targetTotal) * 100);

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoutineId(r.id)}
                className={clsx(
                  'w-full p-3 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer border',
                  isSelected
                    ? 'bg-peach-soft/40 border-peach/50 shadow-2xs'
                    : 'bg-surface-secondary/40 border-transparent hover:bg-surface-secondary'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{r.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-primary-text dark:text-white truncate">
                      {r.name}
                    </div>
                    <div className="text-[10px] text-secondary-text dark:text-gray-400">
                      {r.frequencyType === 'interval'
                        ? `Every ${r.intervalMinutes || 30} mins · ${r.repeatDays.length === 7 ? 'Daily' : r.repeatDays.join(', ')}`
                        : `${r.reminderTime || '9:00 PM'} (Once a day) · ${r.repeatDays.length === 7 ? 'Daily' : r.repeatDays.join(', ')}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-20 bg-surface-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-peach h-1.5 rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-primary-text dark:text-white w-9 text-right">
                    {rate}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-secondary-text" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalAnalyticsView;
