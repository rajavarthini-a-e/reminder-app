import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { dashboardRouter } from './routes/dashboard.js';
import { tasksRouter } from './routes/tasks.js';
import { plansRouter } from './routes/plans.js';
import { mentorRouter } from './routes/mentor.js';
import { remindersRouter } from './routes/reminders.js';
import { authRouter, routinesRouter } from './routes/auth.js';
import { schedulerService } from './services/scheduler.service.js';

const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, '') : '';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile app)
      if (!origin) return callback(null, true);
      // Allow configured frontend origin
      if (FRONTEND_URL && (origin === FRONTEND_URL || origin.startsWith(FRONTEND_URL))) {
        return callback(null, true);
      }
      // Allow local dev, Render preview, and Vercel deployments
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (responds on both /health and /api/health for Render/monitoring)
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'MentorAI Backend',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(config.ai.apiKey),
  });
});

// Mount modular API routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/auth', authRouter);
app.use('/api/routines', routinesRouter);
app.use('/api', plansRouter);

// Support top-level convenience endpoints directly matching specification
app.post('/upload-plan', (req, res, next) => {
  req.url = '/upload-plan';
  plansRouter(req, res, next);
});
app.get('/dashboard', (req, res, next) => {
  req.url = '/';
  dashboardRouter(req, res, next);
});
app.get('/tasks/today', (req, res, next) => {
  req.url = '/today';
  tasksRouter(req, res, next);
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Start server
const PORT = config.port;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 [MentorAI Backend] Running on http://${HOST}:${PORT}`);
  console.log(`📡 [Scheduler] Starting 1-minute persistent cron engine...`);
  schedulerService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server and stopping scheduler');
  schedulerService.stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server and stopping scheduler');
  schedulerService.stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});
