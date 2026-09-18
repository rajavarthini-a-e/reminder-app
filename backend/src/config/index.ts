import dotenv from 'dotenv';
import path from 'path';

// Load environment from backend directory or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  ai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  notifications: {
    enableBrowser: process.env.ENABLE_BROWSER_NOTIFICATIONS !== 'false',
    enableSound: process.env.ENABLE_SOUND_ALERTS !== 'false',
    webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL || '',
  },
};
