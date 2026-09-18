import {
  Routine,
  getStoredRoutines,
  updateRoutineReminderTimestamp,
  isRoutineScheduledForToday,
  getTodayKey,
} from './routinesService.js';
import { soundService } from './sound.service.js';
import { browserNotificationService } from './notification.service.js';

export interface RoutineReminderEventPayload {
  routine: Routine;
  isWater: boolean;
  frequencyLabel: string;
  isSoundMuted: boolean;
  message: string;
}

export type RoutineReminderListener = (payload: RoutineReminderEventPayload) => void;

class RoutineReminderService {
  private timer: any = null;
  private listeners: Set<RoutineReminderListener> = new Set();
  private isRunning: boolean = false;

  public subscribe(listener: RoutineReminderListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Check immediately on startup
    this.checkReminders();

    // Check periodically every 15 seconds
    this.timer = setInterval(() => {
      this.checkReminders();
    }, 15000);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public checkReminders(): void {
    const routines = getStoredRoutines();
    const now = Date.now();
    const todayKey = getTodayKey();
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    for (const routine of routines) {
      // Must be scheduled for today
      if (!isRoutineScheduledForToday(routine)) {
        continue;
      }

      // CASE 1: Recurring Interval (e.g. Drink water every 30 minutes)
      if (routine.frequencyType === 'interval') {
        const intervalMins = routine.intervalMinutes || 30;
        const intervalMs = intervalMins * 60 * 1000;

        // If never reminded, initialize to now minus half the interval so it doesn't immediately blast on first open unless overdue
        if (!routine.lastRemindedAt) {
          updateRoutineReminderTimestamp(routine.id, now);
          continue;
        }

        const elapsed = now - routine.lastRemindedAt;
        if (elapsed >= intervalMs) {
          // Trigger reminder
          this.triggerReminder(routine);
          updateRoutineReminderTimestamp(routine.id, now);
        }
      }

      // CASE 2: Once Daily (e.g. Hair oil at 9:00 PM, Morning stretch at 7:30 AM)
      else if (routine.frequencyType === 'once_daily') {
        // If already reminded today, skip
        if (routine.lastRemindedDate === todayKey) {
          continue;
        }

        if (this.isScheduledTimeNow(routine.reminderTime, currentHours, currentMinutes)) {
          this.triggerReminder(routine);
          updateRoutineReminderTimestamp(routine.id, now, todayKey);
        }
      }
    }
  }

  private isScheduledTimeNow(timeStr: string | undefined, currentHours: number, currentMinutes: number): boolean {
    if (!timeStr) return false;
    // Format expected: "9:00 PM", "09:00 PM", "7:30 AM", etc.
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return false;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour === currentHours && minute === currentMinutes;
  }

  public triggerReminder(routine: Routine): void {
    const isWater = routine.name.toLowerCase().includes('water');
    const isMuted = soundService.getMuted();

    // 1. Play sound ONLY if toggle is on (not muted)
    if (!isMuted) {
      soundService.playRoutineReminder(isWater);
    }

    // 2. Generate friendly notification message
    const frequencyLabel = routine.frequencyType === 'interval'
      ? `Every ${routine.intervalMinutes || 30} minutes`
      : 'Once a day';

    const message = isWater
      ? 'Time for a fresh glass of water! Staying hydrated keeps your focus and mind sharp.'
      : `Time to check in on "${routine.name}". Consistency builds mastery!`;

    const payload: RoutineReminderEventPayload = {
      routine,
      isWater,
      frequencyLabel,
      isSoundMuted: isMuted,
      message,
    };

    // 3. Dispatch to internal subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error notifying reminder listener:', err);
      }
    });

    // 4. Dispatch browser notification if permitted
    browserNotificationService.showNotification(
      `${routine.icon} Routine Alert: ${routine.name}`,
      {
        body: message,
        tag: `routine-${routine.id}-${Date.now()}`,
      }
    );
  }

  // Force trigger for immediate manual testing by the user
  public triggerTestReminder(routineId?: string): RoutineReminderEventPayload | null {
    const routines = getStoredRoutines();
    let target = routines.find((r) => r.id === routineId);
    if (!target) {
      // Default to water routine or first routine
      target = routines.find((r) => r.name.toLowerCase().includes('water')) || routines[0];
    }
    if (!target) return null;

    this.triggerReminder(target);
    return {
      routine: target,
      isWater: target.name.toLowerCase().includes('water'),
      frequencyLabel: target.frequencyType === 'interval' ? `Every ${target.intervalMinutes || 30} mins` : 'Once a day',
      isSoundMuted: soundService.getMuted(),
      message: target.name.toLowerCase().includes('water')
        ? 'Time for a fresh glass of water! Staying hydrated keeps your focus and mind sharp.'
        : `Time to check in on "${target.name}". Consistency builds mastery!`,
    };
  }
}

export const routineReminderService = new RoutineReminderService();
