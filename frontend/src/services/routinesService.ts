import { saveServerRoutines, fetchServerRoutines } from './api.js';

export type RoutineDay = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';

export type ReminderFrequencyType = 'interval' | 'once_daily';

export interface Routine {
  id: string;
  name: string;
  icon: string;
  repeatDays: RoutineDay[];
  reminderTime: string; // e.g. "Every 30 mins" or "9:00 PM"
  frequencyType: ReminderFrequencyType; // 'interval' | 'once_daily'
  intervalMinutes?: number; // e.g. 30 for 30 mins
  targetCount?: number; // e.g. 8 for 8 glasses / check-ins per day (defaults to 8 for interval)
  dailyCounts?: Record<string, number>; // 'YYYY-MM-DD': number of check-ins
  lastRemindedAt?: number; // timestamp in ms of last alert
  lastRemindedDate?: string; // 'YYYY-MM-DD' of last daily alert
  completions: Record<string, boolean>; // 'YYYY-MM-DD': true
  streak: number;
  createdAt: string;
}

export interface RoutineAnalytics {
  id: string;
  name: string;
  icon: string;
  consistencyPct: number;
  completedCount: number;
  scheduledCount: number;
  streak: number;
  slipInsight?: string;
  frequencyLabel?: string;
  todayCount?: number;
  targetCount?: number;
}

const STORAGE_KEY = 'mentor_personal_routines_v1';

export const ALL_DAYS: RoutineDay[] = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

export const DAY_MAP: Record<number, RoutineDay> = {
  0: 'Su',
  1: 'M',
  2: 'T',
  3: 'W',
  4: 'Th',
  5: 'F',
  6: 'Sa',
};

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-water',
    name: 'Drink water',
    icon: '💧',
    repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
    reminderTime: 'Every 30 mins',
    frequencyType: 'interval',
    intervalMinutes: 30,
    targetCount: 8,
    dailyCounts: {},
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-hair-oil',
    name: 'Hair oil',
    icon: '🧴',
    repeatDays: ['T', 'F'],
    reminderTime: '9:00 PM',
    frequencyType: 'once_daily',
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-stretch',
    name: 'Morning stretch',
    icon: '🧘',
    repeatDays: ['M', 'W', 'F'],
    reminderTime: '7:30 AM',
    frequencyType: 'once_daily',
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-reading',
    name: 'Bedtime reading',
    icon: '📖',
    repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
    reminderTime: '10:00 PM',
    frequencyType: 'once_daily',
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
];

export function formatRoutineFrequency(routine: Routine): string {
  if (routine.frequencyType === 'interval') {
    const mins = routine.intervalMinutes || 30;
    return `Every ${mins} mins`;
  }
  return routine.reminderTime ? `Daily · ${routine.reminderTime} (Once a day)` : 'Once a day';
}

export function getStoredRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROUTINES));
      return DEFAULT_ROUTINES;
    }
    const parsed: Routine[] = JSON.parse(raw);
    let modified = false;

    const migrated = parsed.map((r) => {
      // Ensure dailyCounts map exists
      if (!r.dailyCounts) {
        r.dailyCounts = {};
        modified = true;
      }

      // Ensure targetCount exists
      if (r.frequencyType === 'interval' && (!r.targetCount || r.targetCount <= 0)) {
        r.targetCount = 8;
        modified = true;
      } else if (r.frequencyType === 'once_daily' && (!r.targetCount || r.targetCount <= 0)) {
        r.targetCount = 1;
        modified = true;
      }

      // Migrate older routines missing frequencyType or intervalMinutes
      if (!r.frequencyType) {
        modified = true;
        if (r.name.toLowerCase().includes('water')) {
          return {
            ...r,
            frequencyType: 'interval' as ReminderFrequencyType,
            intervalMinutes: 30,
            targetCount: 8,
            reminderTime: 'Every 30 mins',
          };
        } else {
          return {
            ...r,
            frequencyType: 'once_daily' as ReminderFrequencyType,
            targetCount: 1,
            reminderTime: r.reminderTime || '9:00 PM',
          };
        }
      }
      return r;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch (err) {
    console.error('Failed to parse routines from localStorage:', err);
    return DEFAULT_ROUTINES;
  }
}

export function saveStoredRoutines(routines: Routine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
    window.dispatchEvent(new CustomEvent('mentor_routines_updated', { detail: routines }));
    // Asynchronously sync to SQLite backend database
    saveServerRoutines(routines).catch((err) => console.warn('Failed to sync routines to backend:', err));
  } catch (err) {
    console.error('Failed to save routines to localStorage:', err);
  }
}

export async function syncRoutinesWithBackend(): Promise<Routine[]> {
  try {
    const serverRoutines = await fetchServerRoutines();
    if (serverRoutines && serverRoutines.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverRoutines));
      window.dispatchEvent(new CustomEvent('mentor_routines_updated', { detail: serverRoutines }));
      return serverRoutines;
    }
  } catch (e) {
    console.warn('Routine backend sync skipped:', e);
  }
  return getStoredRoutines();
}

export function getRoutineTargetCount(routine: Routine): number {
  if (routine.targetCount && routine.targetCount > 0) {
    return routine.targetCount;
  }
  return routine.frequencyType === 'interval' ? 8 : 1;
}

export function getRoutineTodayCount(routine: Routine, dateKey?: string): number {
  const date = dateKey || getTodayKey();
  if (routine.dailyCounts && typeof routine.dailyCounts[date] === 'number') {
    return routine.dailyCounts[date];
  }
  return Boolean(routine.completions && routine.completions[date]) ? getRoutineTargetCount(routine) : 0;
}

export function isRoutineCompletedOnDate(routine: Routine, dateKey?: string): boolean {
  const date = dateKey || getTodayKey();
  const count = getRoutineTodayCount(routine, date);
  const target = getRoutineTargetCount(routine);
  return count >= target;
}

export function incrementRoutineCount(id: string, dateKey?: string): Routine[] {
  const routines = getStoredRoutines();
  const target = routines.find((r) => r.id === id);
  const date = dateKey || getTodayKey();

  if (target) {
    target.dailyCounts = target.dailyCounts || {};
    target.completions = target.completions || {};
    const current = getRoutineTodayCount(target, date);
    const targetGoal = getRoutineTargetCount(target);
    const nextCount = current + 1;
    target.dailyCounts[date] = nextCount;

    const wasCompleted = Boolean(target.completions[date]);
    const isNowCompleted = nextCount >= targetGoal;

    if (isNowCompleted && !wasCompleted) {
      target.completions[date] = true;
      target.streak += 1;
    } else if (isNowCompleted) {
      target.completions[date] = true;
    }
  }

  saveStoredRoutines(routines);
  return routines;
}

export function decrementRoutineCount(id: string, dateKey?: string): Routine[] {
  const routines = getStoredRoutines();
  const target = routines.find((r) => r.id === id);
  const date = dateKey || getTodayKey();

  if (target) {
    target.dailyCounts = target.dailyCounts || {};
    target.completions = target.completions || {};
    const current = getRoutineTodayCount(target, date);
    const targetGoal = getRoutineTargetCount(target);
    const nextCount = Math.max(0, current - 1);
    target.dailyCounts[date] = nextCount;

    const wasCompleted = Boolean(target.completions[date]);
    const isNowCompleted = nextCount >= targetGoal;

    if (wasCompleted && !isNowCompleted) {
      delete target.completions[date];
      target.streak = Math.max(0, target.streak - 1);
    }
  }

  saveStoredRoutines(routines);
  return routines;
}

export function toggleRoutineCompletion(id: string, dateKey?: string): Routine[] {
  const routines = getStoredRoutines();
  const target = routines.find((r) => r.id === id);
  const date = dateKey || getTodayKey();

  if (target) {
    if (target.frequencyType === 'interval') {
      const current = getRoutineTodayCount(target, date);
      const targetGoal = getRoutineTargetCount(target);
      if (current >= targetGoal) {
        // If at or above target, cycle back to 0
        target.dailyCounts = target.dailyCounts || {};
        target.dailyCounts[date] = 0;
        delete target.completions[date];
        target.streak = Math.max(0, target.streak - 1);
      } else {
        return incrementRoutineCount(id, date);
      }
    } else {
      // Once daily habits
      target.dailyCounts = target.dailyCounts || {};
      target.completions = target.completions || {};
      const isDone = Boolean(target.completions[date]);
      if (isDone) {
        delete target.completions[date];
        target.dailyCounts[date] = 0;
        target.streak = Math.max(0, target.streak - 1);
      } else {
        target.completions[date] = true;
        target.dailyCounts[date] = 1;
        target.streak += 1;
      }
    }
  }

  saveStoredRoutines(routines);
  return routines;
}

export function createRoutine(data: {
  name: string;
  icon: string;
  repeatDays: RoutineDay[];
  reminderTime: string;
  frequencyType?: ReminderFrequencyType;
  intervalMinutes?: number;
  targetCount?: number;
}): Routine {
  const routines = getStoredRoutines();
  const freqType: ReminderFrequencyType = data.frequencyType || 'once_daily';
  const intervalMins = freqType === 'interval' ? (data.intervalMinutes || 30) : undefined;
  const remTime = freqType === 'interval' ? `Every ${intervalMins} mins` : (data.reminderTime || '8:00 PM');
  const targetCount = data.targetCount || (freqType === 'interval' ? 8 : 1);

  const newRoutine: Routine = {
    id: `routine-${Date.now()}`,
    name: data.name,
    icon: data.icon,
    repeatDays: data.repeatDays.length > 0 ? data.repeatDays : ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
    reminderTime: remTime,
    frequencyType: freqType,
    intervalMinutes: intervalMins,
    targetCount,
    dailyCounts: {},
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  };

  routines.push(newRoutine);
  saveStoredRoutines(routines);
  return newRoutine;
}

export function updateRoutine(id: string, updates: Partial<Routine>): Routine[] {
  const routines = getStoredRoutines();
  const targetIndex = routines.findIndex((r) => r.id === id);
  if (targetIndex >= 0) {
    const existing = routines[targetIndex];
    const freqType = updates.frequencyType ?? existing.frequencyType ?? 'once_daily';
    const intervalMins = freqType === 'interval' ? (updates.intervalMinutes ?? existing.intervalMinutes ?? 30) : undefined;
    const remTime = freqType === 'interval' 
      ? `Every ${intervalMins} mins`
      : (updates.reminderTime ?? existing.reminderTime ?? '9:00 PM');
    const targetCount = updates.targetCount ?? existing.targetCount ?? (freqType === 'interval' ? 8 : 1);

    routines[targetIndex] = {
      ...existing,
      ...updates,
      frequencyType: freqType,
      intervalMinutes: intervalMins,
      reminderTime: remTime,
      targetCount,
    };
    saveStoredRoutines(routines);
  }
  return routines;
}

export function updateRoutineReminderTimestamp(id: string, timestamp: number, dateKey?: string): Routine[] {
  const routines = getStoredRoutines();
  const target = routines.find((r) => r.id === id);
  if (target) {
    target.lastRemindedAt = timestamp;
    if (dateKey) {
      target.lastRemindedDate = dateKey;
    }
    saveStoredRoutines(routines);
  }
  return routines;
}

export function deleteRoutine(id: string): Routine[] {
  const routines = getStoredRoutines().filter((r) => r.id !== id);
  saveStoredRoutines(routines);
  return routines;
}

export function clearAllRoutines(): Routine[] {
  saveStoredRoutines([]);
  return [];
}

export function resetRoutinesToDefault(): Routine[] {
  saveStoredRoutines(DEFAULT_ROUTINES);
  return DEFAULT_ROUTINES;
}

export function isRoutineScheduledForToday(routine: Routine): boolean {
  const dayIndex = new Date().getDay();
  const dayKey = DAY_MAP[dayIndex];
  return routine.repeatDays.includes(dayKey);
}

export function getRoutineAnalytics(): RoutineAnalytics[] {
  const routines = getStoredRoutines();

  return routines.map((r) => {
    const completedCount = Object.keys(r.completions || {}).length;
    const streak = r.streak || 0;
    const scheduledCount = Math.max(completedCount, 1);
    const consistencyPct = completedCount > 0 ? Math.min(100, Math.round((completedCount / scheduledCount) * 100)) : 0;
    const frequencyLabel = formatRoutineFrequency(r);
    const todayCount = getRoutineTodayCount(r);
    const targetCount = getRoutineTargetCount(r);

    return {
      id: r.id,
      name: r.name,
      icon: r.icon,
      consistencyPct,
      completedCount,
      scheduledCount,
      streak,
      frequencyLabel,
      todayCount,
      targetCount,
      slipInsight: streak === 0 && completedCount === 0 ? 'Start your first habit check-in today to build a streak!' : undefined,
    };
  });
}
