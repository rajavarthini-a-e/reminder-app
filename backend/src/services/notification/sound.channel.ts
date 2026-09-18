import { INotificationChannel, INotificationPayload } from './notification.interface.js';

class SoundChannel implements INotificationChannel {
  name = 'SOUND';

  public getSoundForEscalation(level: number): string {
    switch (level) {
      case 1:
        return 'gentle_chime';
      case 2:
        return 'firm_pulse';
      case 3:
        return 'strict_alert';
      case 4:
      default:
        return 'emergency_siren';
    }
  }

  async send(payload: INotificationPayload): Promise<boolean> {
    // Sound channel attaches sound identifier to payload for frontend Web Audio API execution
    payload.soundAlert = this.getSoundForEscalation(payload.escalationLevel);
    return true;
  }
}

export const soundChannel = new SoundChannel();
