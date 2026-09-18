import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService.js';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = signup(name, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to create account.');
      return;
    }

    // New user always starts at Step 1 of Onboarding
    navigate('/onboarding', { replace: true });
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
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text font-medium leading-relaxed max-w-[280px] mx-auto break-words">
              Meet Momo, setup your study goals and start your personal habit streaks.
            </p>
          </div>

          {error && (
            <div className="bg-danger-soft border border-danger/30 text-danger-text rounded-2xl p-3.5 text-xs font-bold leading-snug break-words text-left">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-primary-text uppercase tracking-wider block">
                Your Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-secondary-text pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full min-h-[48px] bg-surface-secondary text-primary-text rounded-2xl pl-10 pr-4 text-xs font-medium border border-border focus:border-success focus:outline-none transition-colors"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full min-h-[48px] bg-surface-secondary text-primary-text rounded-2xl pl-10 pr-4 text-xs font-medium border border-border focus:border-success focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Sign Up Submit Button (>= 48px) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer',
                isSubmitting && 'opacity-60 cursor-not-allowed'
              )}
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Footer switch to Login */}
        <div className="text-center space-y-2">
          <p className="text-xs text-secondary-text font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-black text-success hover:underline min-h-[48px] inline-flex items-center"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
