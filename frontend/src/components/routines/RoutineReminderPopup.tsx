import React, { useState, useEffect } from 'react';
import { Check, X, Bell, BellOff, Clock, Sparkles } from 'lucide-react';
import {
  routineReminderService,
  RoutineReminderEventPayload,
} from '../../services/routineReminderService.js';
import {
  toggleRoutineCompletion,
  incrementRoutineCount,
  getRoutineTodayCount,
  getRoutineTargetCount,
  updateRoutineReminderTimestamp,
} from '../../services/routinesService.js';
import { soundService } from '../../services/sound.service.js';
import clsx from 'clsx';

export const RoutineReminderPopup: React.FC = () => {
  const [activePayload, setActivePayload] = useState<RoutineReminderEventPayload | null>(null);
  const [isCompletedJustNow, setIsCompletedJustNow] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');

  useEffect(() => {
    const unsubscribe = routineReminderService.subscribe((payload) => {
      setActivePayload(payload);
      setIsCompletedJustNow(false);
      setCompletionMessage('');
    });

    return () => unsubscribe();
  }, []);

  if (!activePayload) return null;

  const { routine, isWater, frequencyLabel, isSoundMuted, message } = activePayload;
  const isInterval = isWater || routine.frequencyType === 'interval';
  const todayCount = getRoutineTodayCount(routine);
  const targetCount = getRoutineTargetCount(routine);

  const handleMarkDone = () => {
    if (isInterval) {
      incrementRoutineCount(routine.id);
      if (!isSoundMuted) {
        soundService.playWaterDroplet();
      }
      setCompletionMessage(`Recorded! ${todayCount + 1} of ${targetCount} glasses drank today. 💧`);
    } else {
      toggleRoutineCompletion(routine.id);
      if (!isSoundMuted) {
        soundService.playVictory();
      }
      setCompletionMessage('Routine Completed! Great job keeping up your streak.');
    }
    setIsCompletedJustNow(true);
    setTimeout(() => {
      setActivePayload(null);
      setIsCompletedJustNow(false);
      setCompletionMessage('');
    }, 1500);
  };

  const handleSnooze = () => {
    // Snooze by 5 minutes: set lastRemindedAt so it fires again in 5 minutes
    const intervalMins = routine.intervalMinutes || 30;
    const snoozeOffsetMs = (intervalMins - 5) * 60 * 1000;
    updateRoutineReminderTimestamp(routine.id, Date.now() - snoozeOffsetMs);
    setActivePayload(null);
  };

  const handleDismiss = () => {
    setActivePayload(null);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-auto p-2 sm:p-0 animate-slideDown">
      <div
        className={clsx(
          'rounded-3xl p-5 border-2 shadow-2xl backdrop-blur-md transition-all space-y-3.5',
          isCompletedJustNow
            ? 'bg-success/95 text-white border-success'
            : isWater
            ? 'bg-surface/95 dark:bg-[#15232A] border-sky-400/40 text-primary-text dark:text-gray-100 shadow-sky-500/10'
            : 'bg-surface/95 dark:bg-surface-dark border-peach/40 text-primary-text dark:text-gray-100'
        )}
      >
        {isCompletedJustNow ? (
          <div className="flex items-center gap-3 py-2 text-white">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              {isInterval ? '💧' : '✨'}
            </div>
            <div>
              <div className="text-sm font-black">
                {isInterval ? 'Hydration Recorded!' : 'Routine Completed!'}
              </div>
              <div className="text-xs opacity-90">{completionMessage}</div>
            </div>
          </div>
        ) : (
          <>
            {/* Header: Icon, Title & Close */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner',
                    isWater
                      ? 'bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700'
                      : 'bg-peach-soft border border-peach/30'
                  )}
                >
                  {routine.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-primary-text dark:text-white">
                      {routine.name}
                    </span>
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                        isWater
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                          : 'bg-peach/15 text-peach dark:bg-peach/25 dark:text-orange-300'
                      )}
                    >
                      {frequencyLabel}
                    </span>
                  </div>
                  <div className="text-xs text-secondary-text dark:text-gray-400 font-medium mt-0.5">
                    {isWater
                      ? `30-minute Hydration · Glass ${todayCount + 1} of ${targetCount}`
                      : 'Personal Habit Alert'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-secondary cursor-pointer transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message */}
            <p className="text-xs text-primary-text/90 dark:text-gray-200 leading-relaxed font-medium">
              {message}
            </p>

            {/* Sound Status Pill */}
            <div className="flex items-center gap-2 pt-0.5">
              <div
                className={clsx(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold',
                  isSoundMuted
                    ? 'bg-surface-secondary dark:bg-surface-darkBorder text-secondary-text'
                    : 'bg-success/15 text-success dark:bg-success/20 dark:text-emerald-400'
                )}
              >
                {isSoundMuted ? (
                  <>
                    <BellOff className="w-3 h-3" />
                    <span>Notification pop-up alone (Sound is muted)</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3 animate-bounce" />
                    <span>Sound alert played</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleMarkDone}
                className={clsx(
                  'flex-1 min-h-[44px] py-2.5 px-3.5 rounded-xl font-black text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 text-white',
                  isInterval
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : 'bg-success hover:bg-success-hover'
                )}
              >
                <Check className="w-4 h-4" />
                <span>
                  {isInterval
                    ? `💧 Drank Water (+1) · ${todayCount}/${targetCount}`
                    : 'Mark done'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSnooze}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-surface-secondary dark:bg-surface-darkBorder text-primary-text dark:text-gray-200 hover:bg-border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Remind again in 5 minutes"
              >
                <Clock className="w-3.5 h-3.5 text-secondary-text" />
                <span>Snooze 5m</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoutineReminderPopup;
