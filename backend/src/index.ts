import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { dashboardRouter } from './routes/dashboard.js';
import { tasksRouter } from './routes/tasks.js';
import { plansRouter } from './routes/plans.js';
import { mentorRouter } from './routes/mentor.js';
import { remindersRouter } from './routes/reminders.js';
import { schedulerService } from './services/scheduler.service.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
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
const server = app.listen(config.port, () => {
  console.log(`🚀 [MentorAI Backend] Running on http://localhost:${config.port}`);
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
