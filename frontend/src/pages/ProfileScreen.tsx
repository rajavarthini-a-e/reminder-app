import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  RotateCcw,
  LogOut,
  User,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import { getCurrentUser, updateCurrentUser, logout, resetPassword } from '../services/authService.js';
import { deleteActivePlan } from '../services/api.js';
import { resetRoutinesToDefault, clearAllRoutines } from '../services/routinesService.js';
import clsx from 'clsx';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const {
    dashboardData,
    loadDashboard,
    mentorTone,
    setMentorTone,
  } = useAppStore();

  const [reminderTime, setReminderTime] = useState('7:00 AM');
  const [exportNotice, setExportNotice] = useState(false);
  const [planNotice, setPlanNotice] = useState<string | null>(null);

  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwStatus, setPwStatus] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const userName = currentUser?.name || dashboardData?.user?.name || 'Alex Rivera';
  const userEmail = currentUser?.email || 'alex@mentorai.com';
  const focusLabel = currentUser?.focusPreference
    ? currentUser.focusPreference === 'career'
      ? 'Career & Study focus active'
      : currentUser.focusPreference === 'personal'
      ? 'Personal Habits focus active'
      : 'Career + Personal active'
    : 'Career + Personal active';

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dashboardData || { user: userName }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mentorai_progress_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const tones: Array<'balanced' | 'gentle' | 'strict'> = ['balanced', 'gentle', 'strict'];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all">
      {/* 1. Header (Mockup Screen 15) */}
      <div className="flex items-center gap-3.5 pt-1">
        <div className="w-14 h-14 rounded-full bg-peach-soft border border-peach/25 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
          🐱
        </div>
        <div>
          <h1 className="text-lg font-black text-primary-text dark:text-white break-words leading-snug">
            {userName}
          </h1>
          <div className="text-xs text-secondary-text dark:text-gray-400 font-medium break-words">
            {userEmail}
          </div>
          <p className="text-[11px] text-success font-bold mt-0.5">
            {focusLabel}
          </p>
        </div>
      </div>

      {/* 2. Mentor Tone (Mockup Screen 15) */}
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-2.5">
        <div className="text-xs font-bold text-secondary-text dark:text-gray-400">
          Mentor tone
        </div>
        <div className="flex gap-2">
          {tones.map((t) => {
            const isSelected = (mentorTone || 'balanced') === t;
            return (
              <button
                key={t}
                onClick={() => setMentorTone(t)}
                className={clsx(
                  'flex-1 py-3 px-2 rounded-xl text-xs font-black capitalize transition-all cursor-pointer min-h-[48px] flex items-center justify-center shadow-2xs select-none',
                  isSelected
                    ? 'bg-success text-white shadow-xs'
                    : 'bg-surface-secondary text-secondary-text hover:text-primary-text'
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Reminder Time (Mockup Screen 15) */}
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-primary-text dark:text-white">
          Daily reminder time
        </div>
        <select
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-secondary text-primary-text dark:text-white text-xs font-bold border border-border outline-none min-h-[48px] cursor-pointer"
        >
          <option value="7:00 AM">7:00 AM</option>
          <option value="8:00 AM">8:00 AM</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="6:00 PM">6:00 PM</option>
          <option value="8:00 PM">8:00 PM</option>
        </select>
      </div>

      {/* 4. Export Progress (Mockup Screen 15) */}
      <button
        onClick={handleExport}
        className="w-full bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 text-left hover:bg-surface-secondary transition-all cursor-pointer min-h-[48px]"
      >
        <span className="text-xs font-bold text-primary-text dark:text-white">
          {exportNotice ? '✓ Progress Exported' : 'Export progress'}
        </span>
        <Download className="w-4 h-4 text-secondary-text" />
      </button>

      {/* 5. Clear Active Study Plan (if exists) */}
      {dashboardData?.goal && (
        <button
          onClick={async () => {
            if (
              window.confirm(
                'Are you sure you want to delete your active roadmap plan? All scheduled tasks, garden stages, and milestones will be cleared.'
              )
            ) {
              try {
                await deleteActivePlan();
                await loadDashboard();
                setPlanNotice('Active study plan cleared.');
                setTimeout(() => setPlanNotice(null), 3000);
              } catch (err) {
                console.error('Failed to delete active plan:', err);
              }
            }
          }}
          className="w-full bg-white dark:bg-surface-dark border border-danger/30 text-danger hover:bg-danger-soft/30 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 text-left transition-all cursor-pointer min-h-[48px]"
        >
          <div>
            <div className="text-xs font-bold text-danger">Delete Active Roadmap Plan</div>
            <div className="text-[10px] text-secondary-text dark:text-gray-400">
              Remove current goal and scheduled timetable tasks
            </div>
          </div>
          <Trash2 className="w-4 h-4 text-danger flex-shrink-0" />
        </button>
      )}

      {/* 6. Reset Personal Habits to Default */}
      <button
        onClick={() => {
          if (window.confirm('Reset all personal habits back to original defaults?')) {
            resetRoutinesToDefault();
            setPlanNotice('Personal habits reset to default.');
            setTimeout(() => setPlanNotice(null), 3000);
          }
        }}
        className="w-full bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 text-left hover:bg-surface-secondary transition-all cursor-pointer min-h-[48px]"
      >
        <div>
          <div className="text-xs font-bold text-primary-text dark:text-white">Reset Habits to Default</div>
          <div className="text-[10px] text-secondary-text dark:text-gray-400">
            Restore default daily habits list
          </div>
        </div>
        <RotateCcw className="w-4 h-4 text-secondary-text flex-shrink-0" />
      </button>

      {planNotice && (
        <div className="p-3 bg-success-soft text-success border border-success/30 rounded-xl text-xs font-bold text-center">
          {planNotice}
        </div>
      )}

      {/* Security: Change Password Card */}
      <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-primary-text dark:text-white">Account Security</div>
            <div className="text-[10px] text-secondary-text dark:text-gray-400">
              Update password for {userEmail}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(!isChangingPassword);
              setPwError(null);
              setPwStatus(null);
            }}
            className="text-xs font-black text-success hover:underline cursor-pointer"
          >
            {isChangingPassword ? 'Close' : 'Change Password'}
          </button>
        </div>

        {isChangingPassword && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPwError(null);
              setPwStatus(null);

              if (newPassword.length < 4) {
                setPwError('Password must be at least 4 characters.');
                return;
              }

              const res = await resetPassword(userEmail, newPassword);
              if (res.success) {
                setPwStatus('Password changed successfully!');
                setNewPassword('');
                setTimeout(() => {
                  setIsChangingPassword(false);
                  setPwStatus(null);
                }, 2000);
              } else {
                setPwError(res.error || 'Failed to update password.');
              }
            }}
            className="space-y-2.5 pt-2 border-t border-border/60"
          >
            {pwError && (
              <div className="bg-danger-soft text-danger p-2.5 rounded-xl text-xs font-bold">
                ⚠️ {pwError}
              </div>
            )}
            {pwStatus && (
              <div className="bg-success-soft text-success p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{pwStatus}</span>
              </div>
            )}
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 chars)"
                className="w-full min-h-[44px] bg-surface-secondary text-primary-text rounded-xl pl-3.5 pr-10 text-xs font-medium border border-border focus:border-success focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-secondary-text hover:text-primary-text cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-success text-white hover:bg-success-hover text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              Save New Password
            </button>
          </form>
        )}
      </div>

      {/* 6. Sign Out Button (>= 48px) */}
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="w-full bg-danger-soft border border-danger/30 text-danger hover:bg-danger/10 rounded-2xl p-3.5 text-center text-xs font-black transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4 stroke-[2.5]" />
        <span>Sign out</span>
      </button>
    </div>
  );
};

export default ProfileScreen;
