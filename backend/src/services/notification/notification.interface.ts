import { EscalationLevel } from '../../types/shared.js';

export interface INotificationPayload {
  id: string;
  taskId: string;
  taskTitle: string;
  escalationLevel: EscalationLevel;
  message: string;
  scheduledTime: Date;
  estimatedMinutes: number;
  priority: string;
  soundAlert: string; // 'gentle_chime' | 'firm_pulse' | 'strict_alert' | 'emergency_siren'
  timestamp: string;
}

export interface INotificationChannel {
  name: string;
  send(payload: INotificationPayload): Promise<boolean>;
}
