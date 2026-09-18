import { Response } from 'express';
import { INotificationChannel, INotificationPayload } from './notification.interface.js';

class BrowserChannel implements INotificationChannel {
  name = 'BROWSER';
  private clients: Set<Response> = new Set();

  public registerClient(res: Response): () => void {
    this.clients.add(res);
    return () => {
      this.clients.delete(res);
    };
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  async send(payload: INotificationPayload): Promise<boolean> {
    const data = JSON.stringify(payload);
    const sseMessage = `event: reminder\ndata: ${data}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(sseMessage);
      } catch (err) {
        this.clients.delete(client);
      }
    }

    return true;
  }
}

export const browserChannel = new BrowserChannel();
