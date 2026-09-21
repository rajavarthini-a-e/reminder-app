import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, resetPassword, getStoredUsers } from '../services/authService.js';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, KeyRound, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleOpenForgot = () => {
    setForgotEmail(email);
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotSuccess(null);
    setIsForgotModalOpen(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-type.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPassword(forgotEmail, newPassword);
      setIsResetting(false);

      if (!res.success) {
        setForgotError(res.error || 'Failed to reset password.');
        return;
      }

      setForgotSuccess(res.message || 'Password reset successfully! You can now log in.');
      // Auto-fill new credentials into login fields
      setEmail(forgotEmail);
      setPassword(newPassword);
    } catch (err: any) {
      setIsResetting(false);
      setForgotError(err.message || 'Could not reset password.');
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
            <div className="bg-danger-soft border border-danger/30 text-danger-text rounded-2xl p-3.5 text-xs font-bold leading-snug break-words text-left space-y-2">
              <div>⚠️ {error}</div>
              {error.toLowerCase().includes('no account found') && (
                <div className="pt-1">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1 text-success font-black hover:underline text-xs"
                  >
                    <span>Create a new account now</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-primary-text uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgot}
                  className="text-xs font-bold text-success hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-secondary-text pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] bg-surface-secondary text-primary-text rounded-2xl pl-10 pr-11 text-xs font-medium border border-border focus:border-success focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-secondary-text hover:text-primary-text cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                     */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn relative">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-peach-soft text-peach flex items-center justify-center text-xl flex-shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-primary-text">Reset Password</h3>
                <p className="text-xs text-secondary-text">
                  Enter your email and create a new password
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="bg-danger-soft border border-danger/30 text-danger-text rounded-2xl p-3 text-xs font-bold leading-snug">
                ⚠️ {forgotError}
              </div>
            )}

            {forgotSuccess ? (
              <div className="bg-success-soft border border-success/30 text-success rounded-2xl p-4 text-xs font-bold leading-relaxed text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-black">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>{forgotSuccess}</span>
                </div>
                <p className="text-secondary-text font-medium">
                  Your credentials have been updated in the database and prefilled.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs shadow-xs transition-all cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-primary-text uppercase tracking-wider block">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[44px] bg-surface-secondary text-primary-text rounded-xl px-3.5 text-xs font-medium border border-border focus:border-success focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-primary-text uppercase tracking-wider block">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full min-h-[44px] bg-surface-secondary text-primary-text rounded-xl pl-3.5 pr-10 text-xs font-medium border border-border focus:border-success focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-secondary-text hover:text-primary-text cursor-pointer p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-primary-text uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full min-h-[44px] bg-surface-secondary text-primary-text rounded-xl px-3.5 text-xs font-medium border border-border focus:border-success focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-surface-secondary text-secondary-text hover:text-primary-text font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Resetting...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
