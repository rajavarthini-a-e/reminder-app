export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  onboardingCompleted: boolean;
  onboardingStep: 1 | 2 | 3;
  focusPreference?: 'career' | 'personal' | 'both' | 'later';
  createdAt: string;
}

const USERS_STORAGE_KEY = 'mentor_users_v1';
const SESSION_STORAGE_KEY = 'mentor_session_user';

// Initial pre-registered user (Alex Rivera) so returning user flow works out of the box
const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'user-default-1',
    name: 'Rajavarthini',
    email: 'alex@mentorai.com',
    password: 'password123',
    onboardingCompleted: true,
    onboardingStep: 3,
    focusPreference: 'career',
    createdAt: new Date('2026-09-01T00:00:00.000Z').toISOString(),
  },
];

export function getStoredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored users:', err);
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get current user session:', err);
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      // Sync legacy localStorage flag for backwards compatibility
      localStorage.setItem('mentor_onboarding_completed', user.onboardingCompleted ? 'true' : 'false');
      if (user.focusPreference) {
        localStorage.setItem('mentor_focus_preference', user.focusPreference);
        localStorage.setItem('mentor_domain_mode', user.focusPreference === 'personal' ? 'personal' : 'career');
      }
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('mentor_onboarding_completed');
      localStorage.removeItem('mentor_focus_preference');
    }
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new Event('mentor_auth_changed'));
  } catch (err) {
    console.error('Failed to set current user session:', err);
  }
}

export function signup(name: string, email: string, password?: string): { success: boolean; error?: string; user?: AuthUser } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, error: 'Please enter your name.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const users = getStoredUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return {
      success: false,
      error: 'An account with this email already exists. Please log in instead.',
    };
  }

  const newUser: AuthUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password: password || 'password123',
    onboardingCompleted: false,
    onboardingStep: 1,
    focusPreference: undefined,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function login(email: string, password?: string): { success: boolean; error?: string; user?: AuthUser } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return {
      success: false,
      error: 'No account found with this email. Please check your email or sign up.',
    };
  }

  if (password && user.password && user.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function updateCurrentUser(updates: Partial<AuthUser>): AuthUser | null {
  const current = getCurrentUser();
  if (!current) return null;

  const updatedUser: AuthUser = { ...current, ...updates };
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx >= 0) {
    users[idx] = updatedUser;
    saveStoredUsers(users);
  }

  setCurrentUser(updatedUser);
  return updatedUser;
}

export function setOnboardingStep(step: 1 | 2 | 3): void {
  updateCurrentUser({ onboardingStep: step });
}

export function setFocusPreference(focus: 'career' | 'personal' | 'both' | 'later'): void {
  updateCurrentUser({
    focusPreference: focus,
    onboardingStep: 3,
  });
}

export function completeOnboarding(): void {
  updateCurrentUser({
    onboardingCompleted: true,
    onboardingStep: 3,
  });
}

export function logout(): void {
  setCurrentUser(null);
}
