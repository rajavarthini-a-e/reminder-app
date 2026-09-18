import { create } from 'zustand';
import {
  DashboardData,
  Reminder,
  Task,
} from '@shared/types';
import * as api from '../services/api.js';
import { soundService } from '../services/sound.service.js';
import { browserNotificationService } from '../services/notification.service.js';

interface AppState {
  dashboardData: DashboardData | null;
  activeReminders: Reminder[];
  isVerificationModalOpen: boolean;
  verifyingTask: Task | null;
  verificationQuestion: string;
  verificationId: string | null;
  selectedTaskId: string | null;
  selectedCalendarDate: Date;
  isSoundMuted: boolean;
  theme: 'dark' | 'light';
  mentorTone: 'strict' | 'balanced' | 'gentle' | 'drill';
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDashboard: () => Promise<void>;
  toggleSound: () => void;
  toggleTheme: () => void;
  setMentorTone: (tone: 'strict' | 'balanced' | 'gentle' | 'drill') => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedCalendarDate: (date: Date) => void;
  openVerification: (task: Task) => Promise<void>;
  closeVerification: () => void;
  handleReminderReceived: (reminder: any) => void;
  acknowledgeReminder: (reminderId: string) => Promise<void>;
  snoozeTask: (taskId: string, minutes: number) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  dashboardData: null,
  activeReminders: [],
  isVerificationModalOpen: false,
  verifyingTask: null,
  verificationQuestion: '',
  verificationId: null,
  selectedTaskId: null,
  selectedCalendarDate: new Date(),
  isSoundMuted: soundService.getMuted(),
  theme: (localStorage.getItem('mentor_theme') as 'dark' | 'light') || 'light',
  mentorTone: (localStorage.getItem('mentor_tone') as any) || 'strict',
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.fetchDashboard();
      set({
        dashboardData: data,
        activeReminders: data.activeReminders || [],
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  toggleSound: () => {
    const muted = soundService.toggleMute();
    set({ isSoundMuted: muted });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mentor_theme', next);
    if (next === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    set({ theme: next });
  },

  setMentorTone: (tone) => {
    localStorage.setItem('mentor_tone', tone);
    set({ mentorTone: tone });
  },

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),

  openVerification: async (task: Task) => {
    try {
      set({
        verifyingTask: task,
        isVerificationModalOpen: true,
        verificationQuestion: 'Preparing your verification challenge...',
      });
      const promptData = await api.getVerificationPrompt(task.id);
      set({
        verificationQuestion: promptData.question,
        verificationId: promptData.verificationId,
      });
    } catch (err: any) {
      console.error('Error generating verification prompt:', err);
      set({
        verificationQuestion: `Explain in detail how you implemented or studied "${task.title}". Provide key takeaways or queries.`,
      });
    }
  },

  closeVerification: () => {
    set({
      isVerificationModalOpen: false,
      verifyingTask: null,
      verificationQuestion: '',
      verificationId: null,
    });
  },

  handleReminderReceived: (payload: any) => {
    soundService.playByEscalation(payload.escalationLevel);

    browserNotificationService.showNotification(
      `MentorAI: ${payload.taskTitle}`,
      {
        body: payload.message,
        tag: `task-${payload.taskId}`,
      }
    );

    set((state) => {
      const existing = state.activeReminders.filter((r) => r.taskId !== payload.taskId);
      const newReminder: Reminder = {
        id: payload.id,
        taskId: payload.taskId,
        sentAt: payload.timestamp || new Date().toISOString(),
        escalationLevel: payload.escalationLevel,
        message: payload.message,
        channel: 'BROWSER',
        acknowledged: false,
      };
      return { activeReminders: [newReminder, ...existing] };
    });
  },

  acknowledgeReminder: async (reminderId: string) => {
    try {
      await api.acknowledgeReminder(reminderId);
      set((state) => ({
        activeReminders: state.activeReminders.filter((r) => r.id !== reminderId),
      }));
    } catch (err) {
      console.error('Failed to ack reminder:', err);
    }
  },

  snoozeTask: async (taskId: string, minutes: number) => {
    try {
      await api.snoozeTask(taskId, minutes);
      set((state) => ({
        activeReminders: state.activeReminders.filter((r) => r.taskId !== taskId),
      }));
      await get().loadDashboard();
    } catch (err) {
      console.error('Failed to snooze task:', err);
    }
  },

  toggleTask: async (taskId: string) => {
    try {
      await api.toggleTaskCompletion(taskId);
      await get().loadDashboard();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  },
}));
