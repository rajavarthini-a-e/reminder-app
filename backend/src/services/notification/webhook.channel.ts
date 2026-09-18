import { INotificationChannel, INotificationPayload } from './notification.interface.js';
import { config } from '../../config/index.js';

class WebhookChannel implements INotificationChannel {
  name = 'WEBHOOK';

  async send(payload: INotificationPayload): Promise<boolean> {
    if (!config.notifications.webhookUrl) {
      return false; // No webhook configured, gracefully skip
    }

    try {
      const response = await fetch(config.notifications.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'MentorAI',
          escalationLevel: payload.escalationLevel,
          title: `[MentorAI Escalation Level ${payload.escalationLevel}] ${payload.taskTitle}`,
          message: payload.message,
          taskId: payload.taskId,
          timestamp: payload.timestamp,
        }),
      });
      return response.ok;
    } catch (err) {
      console.error('Failed to dispatch webhook notification:', err);
      return false;
    }
  }
}

export const webhookChannel = new WebhookChannel();
