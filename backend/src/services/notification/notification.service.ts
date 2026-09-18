import { INotificationChannel, INotificationPayload } from './notification.interface.js';
import { browserChannel } from './browser.channel.js';
import { soundChannel } from './sound.channel.js';
import { webhookChannel } from './webhook.channel.js';

export class NotificationService {
  private channels: INotificationChannel[] = [
    soundChannel,
    browserChannel,
    webhookChannel,
  ];

  public registerChannel(channel: INotificationChannel) {
    this.channels.push(channel);
  }

  public async notifyAll(payload: INotificationPayload): Promise<void> {
    console.log(`[NotificationService] Dispatching Level ${payload.escalationLevel} alert for: "${payload.taskTitle}"`);

    // Ensure sound cue is selected first
    payload.soundAlert = soundChannel.getSoundForEscalation(payload.escalationLevel);

    const promises = this.channels.map(async (channel) => {
      try {
        await channel.send(payload);
      } catch (err) {
        console.error(`[NotificationService] Channel ${channel.name} failed:`, err);
      }
    });

    await Promise.allSettled(promises);
  }
}

export const notificationService = new NotificationService();
