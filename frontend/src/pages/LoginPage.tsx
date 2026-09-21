import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getStoredUsers } from '../services/authService.js';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || 'Failed to log in.');
        return;
      }

      // Direct seamless routing straight to Home!
      navigate('/', { replace: true });
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoFill = () => {
    const users = getStoredUsers();
    if (users.length > 0) {
      setEmail(users[0].email);
      setPassword(users[0].password || 'password123');
    } else {
      setEmail('alex@mentorai.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6 animate-fadeIn">
        {/* Main Card */}
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card text-center space-y-6">
          {/* Mascot Momo Avatar */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-peach-soft border border-peach/25 flex items-center justify-center text-4xl shadow-xs">
            🐱
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-primary-text tracking-tight">
              Welcome back to MentorAI
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text font-medium leading-relaxed max-w-[280px] mx-auto break-words">
              Your personalized accountability companion for study goals and daily habits.
            </p>
          </div>

          {error && (
            <div className="bg-danger-soft border border-danger/30 text-danger-text rounded-2xl p-3.5 text-xs font-bold leading-snug break-words text-left">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-primary-text uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-secondary-text pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full min-h-[48px] bg-surface-secondary text-primary-text rounded-2xl pl-10 pr-4 text-xs font-medium border border-border focus:border-success focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-primary-text uppercase tracking-wider block">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-secondary-text pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] bg-surface-secondary text-primary-text rounded-2xl pl-10 pr-4 text-xs font-medium border border-border focus:border-success focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Log In Submit Button (>= 48px) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer',
                isSubmitting && 'opacity-60 cursor-not-allowed'
              )}
            >
              <span>{isSubmitting ? 'Signing in...' : 'Log in'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Demo account quick-fill helper */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-xl bg-surface-secondary hover:bg-border text-secondary-text hover:text-primary-text text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-peach" />
              <span>Autofill demo account (Alex Rivera)</span>
            </button>
          </div>
        </div>

        {/* Footer switch to Signup */}
        <div className="text-center space-y-2">
          <p className="text-xs text-secondary-text font-medium">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-black text-success hover:underline min-h-[48px] inline-flex items-center"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
