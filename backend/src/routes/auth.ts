import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

export const authRouter = Router();

// Helper to sanitize user object for client response
function sanitizeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email || '',
    onboardingCompleted: user.onboardingCompleted ?? true,
    onboardingStep: 3,
    focusPreference: user.focusPreference || 'personal',
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  };
}

const DEFAULT_ROUTINES = [
  {
    id: 'routine-water',
    name: 'Drink Water',
    icon: '💧',
    repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
    reminderTime: 'Every 30 mins',
    frequencyType: 'interval',
    intervalMinutes: 30,
    targetCount: 8,
    dailyCounts: {},
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-hair-oil',
    name: 'Apply Hair Oil',
    icon: '🌿',
    repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
    reminderTime: '8:00 PM',
    frequencyType: 'once_daily',
    targetCount: 1,
    dailyCounts: {},
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-stretch',
    name: 'Stretch & Posture Break',
    icon: '🧘',
    repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
    reminderTime: '4:00 PM',
    frequencyType: 'once_daily',
    targetCount: 1,
    dailyCounts: {},
    completions: {},
    streak: 0,
    createdAt: new Date().toISOString(),
  },
];

// Helper to resolve user from Bearer header or fallback
async function getRequestedUser(req: Request) {
  const authHeader = req.headers.authorization;
  let userId = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7).trim();
  }
  if (!userId && req.query.userId) {
    userId = String(req.query.userId).trim();
  }

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  // Fallback to first user in database
  return await prisma.user.findFirst();
}

// POST /api/auth/signup
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      return res.status(400).json({ success: false, error: 'Please provide your name.' });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please log in.',
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword || 'password123',
        onboardingCompleted: true, // Default to true so user lands directly in app!
        focusPreference: 'personal',
        routinesJson: JSON.stringify(DEFAULT_ROUTINES),
        behavior: {
          create: {
            preferredStudyTime: '20:00',
            streak: 0,
            bestStreak: 0,
            completionRate: 0.0,
            insightsJson: '[]',
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token: newUser.id,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Please enter your email.' });
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Handle demo account or initial seeded user
    if (!user && (cleanEmail === 'alex@mentorai.com' || cleanEmail.includes('demo'))) {
      user = await prisma.user.findFirst();
      if (user && !user.email) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { email: cleanEmail, password: cleanPassword || 'password123' },
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email. Please check your email or sign up.',
      });
    }

    // Verify password if set
    if (user.password && cleanPassword && user.password !== cleanPassword) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please try again.',
      });
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
      token: user.id,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Failed to log in. Please try again.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await getRequestedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
      token: user.id,
    });
  } catch (err: any) {
    console.error('Auth me error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch current user' });
  }
});

// PUT /api/auth/profile
authRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    const user = await getRequestedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { name, focusPreference, onboardingCompleted } = req.body;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name: String(name).trim() } : {}),
        ...(focusPreference ? { focusPreference: String(focusPreference) } : {}),
        ...(typeof onboardingCompleted === 'boolean' ? { onboardingCompleted } : {}),
      },
    });

    res.json({
      success: true,
      user: sanitizeUser(updated),
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export const routinesRouter = Router();

// GET /api/routines
routinesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getRequestedUser(req);
    if (!user) {
      return res.json({ success: true, routines: DEFAULT_ROUTINES });
    }

    let routines = DEFAULT_ROUTINES;
    if (user.routinesJson) {
      try {
        routines = JSON.parse(user.routinesJson);
      } catch (e) {
        routines = DEFAULT_ROUTINES;
      }
    }

    res.json({ success: true, routines });
  } catch (err: any) {
    console.error('Fetch routines error:', err);
    res.json({ success: true, routines: DEFAULT_ROUTINES });
  }
});

// POST /api/routines
routinesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = await getRequestedUser(req);
    const { routines } = req.body;

    if (!routines || !Array.isArray(routines)) {
      return res.status(400).json({ success: false, error: 'routines must be an array' });
    }

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          routinesJson: JSON.stringify(routines),
        },
      });
    }

    res.json({ success: true, count: routines.length });
  } catch (err: any) {
    console.error('Save routines error:', err);
    res.status(500).json({ success: false, error: 'Failed to persist routines in database' });
  }
});
