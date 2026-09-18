class BrowserNotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch {
      return false;
    }
  }

  public hasPermission(): boolean {
    return this.permission === 'granted';
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  public showNotification(title: string, options?: NotificationOptions): Notification | null {
    if (this.permission !== 'granted' || !('Notification' in window)) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mentor-ai-reminder',
        requireInteraction: options?.requireInteraction ?? true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (err) {
      console.warn('Failed to display browser notification:', err);
      return null;
    }
  }
}

export const browserNotificationService = new BrowserNotificationService();
