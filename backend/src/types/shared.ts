export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VerificationType = 'LEARNING' | 'CODING' | 'READING' | 'WORKOUT' | 'GENERAL';

export type EscalationLevel = 1 | 2 | 3 | 4;

export interface User {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  deadline: string;
  progress: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  milestones?: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  order: number;
  dueDate: string;
  completed: boolean;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  milestoneId: string;
  title: string;
  description?: string | null;
  scheduledTime: string;
  estimatedMinutes: number;
  priority: Priority;
  reminderInterval: number; // in minutes
  completed: boolean;
  completedAt?: string | null;
  verificationType: VerificationType;
  topic?: string | null;
  sourceContext?: string | null;
  order: number;
  activeEscalationLevel?: EscalationLevel;
  snoozedUntil?: string | null;
  milestone?: {
    id: string;
    title: string;
    goalId: string;
    goal?: {
      id: string;
      title: string;
    };
  };
  reminders?: Reminder[];
  verifications?: Verification[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  sentAt: string;
  escalationLevel: EscalationLevel;
  message: string;
  channel: 'BROWSER' | 'SOUND' | 'CONSOLE' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL';
  acknowledged: boolean;
  snoozedUntil?: string | null;
  task?: Task;
}

export interface Verification {
  id: string;
  taskId: string;
  question: string;
  answer?: string | null;
  feedback?: string | null;
  passed: boolean;
  score?: number | null;
  verifiedAt?: string | null;
}

export interface BehaviorInsight {
  type: 'TIMING' | 'HABIT' | 'RECOMMENDATION' | 'ADAPTATION';
  title: string;
  detail: string;
  timestamp: string;
}

export interface Behavior {
  id: string;
  userId: string;
  preferredStudyTime: string; // e.g. "20:00"
  skippedCount: number;
  streak: number;
  bestStreak: number;
  completionRate: number;
  lastActiveDate?: string | null;
  insights: BehaviorInsight[];
}

export interface ScoreFactor {
  factor: string;
  impact: number;
  description: string;
  type: 'bonus' | 'penalty' | 'neutral';
}

export interface AccountabilityScore {
  score: number;
  grade: string;
  assessment: string;
  breakdown: ScoreFactor[];
  streak: number;
  completionRate: number;
  overdueCount: number;
}

export interface ExtractedTask {
  title: string;
  estimatedMinutes: number;
  priority: Priority;
  verificationType: VerificationType;
  topic?: string;
  description?: string;
  dayNumber?: number;
}

export interface ExtractedMilestone {
  title: string;
  weekOrMonthNumber?: number;
  dueDate?: string;
  tasks: ExtractedTask[];
}

export interface ExtractedPlan {
  goal: string;
  duration: number; // in days
  startDate?: string;
  endDate?: string;
  milestones: ExtractedMilestone[];
  rawSummary?: string;
}

export interface MentorChatMessage {
  id: string;
  sender: 'mentor' | 'user' | 'system';
  text: string;
  timestamp: string;
  escalationLevel?: EscalationLevel;
  taskId?: string;
  actionRequired?: 'VERIFY' | 'SNOOZE' | 'ACKNOWLEDGE' | 'NONE';
  verificationQuestion?: string;
}

export interface DashboardData {
  user: User;
  goal: Goal | null;
  goalProgress: number; // percentage (0 - 100)
  currentDay: number;
  totalDays: number;
  todayMission: Task | null;
  todayTasks: Task[];
  criticalDeadlines: Task[];
  streak: {
    current: number;
    best: number;
    lastActiveDate: string | null;
  };
  score: AccountabilityScore;
  behavior: Behavior;
  activeReminders: Reminder[];
}
