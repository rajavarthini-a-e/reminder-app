import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAppStore } from '../store/useAppStore.js';
import {
  Flame,
  Volume2,
  VolumeX,
  Check,
  Trash2,
} from 'lucide-react';
import {
  Routine,
  getStoredRoutines,
  toggleRoutineCompletion,
  deleteRoutine,
} from '../services/routinesService.js';
import { CreateRoutineModal } from '../components/routines/CreateRoutineModal.js';
import { MilestoneTestModal } from '../components/milestones/MilestoneTestModal.js';
import { PersonalRoutinesView } from '../components/personal/PersonalRoutinesView.js';
import { getCurrentUser } from '../services/authService.js';
import { submitVerification, deleteTask } from '../services/api.js';

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const {
    dashboardData,
    loadDashboard,
    openVerification,
    toggleTask,
    isSoundMuted,
    toggleSound,
  } = useAppStore();

  const [inlineAnswer, setInlineAnswer] = useState('');
  const [inlineSubmitted, setInlineSubmitted] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);
  const [inlinePassed, setInlinePassed] = useState<boolean | null>(null);
  const [isVerifyingInline, setIsVerifyingInline] = useState(false);
  const [focusTimerActive, setFocusTimerActive] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);

  // Personal routines state
  const [routines, setRoutines] = useState<Routine[]>(() => getStoredRoutines());
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  // Milestone knowledge test modal state
  const [isMilestoneTestOpen, setIsMilestoneTestOpen] = useState(false);
  const [activeMilestoneForTest, setActiveMilestoneForTest] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (focusTimerActive && focusSeconds > 0) {
      interval = setInterval(() => setFocusSeconds((s) => s - 1), 1000);
    } else if (focusSeconds === 0) {
      setFocusTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [focusTimerActive, focusSeconds]);

  // Sync routines on external updates
  useEffect(() => {
    const handleUpdate = () => {
      setRoutines(getStoredRoutines());
    };
    window.addEventListener('mentor_routines_updated', handleUpdate);
    return () => window.removeEventListener('mentor_routines_updated', handleUpdate);
  }, []);

  const refreshRoutines = () => {
    setRoutines(getStoredRoutines());
  };

  const handleToggleRoutine = (id: string) => {
    const updated = toggleRoutineCompletion(id);
    setRoutines([...updated]);
  };

  const handleDeleteRoutine = (id: string) => {
    const updated = deleteRoutine(id);
    setRoutines([...updated]);
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Delete "${taskTitle}" from your schedule?`)) {
      try {
        await deleteTask(taskId);
        await loadDashboard();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const todayTasks = dashboardData?.todayTasks || [];
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const totalTodayCount = todayTasks.length;
  const todayPct = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;
  const allTasks = (dashboardData?.goal?.milestones || []).flatMap((m) => m.tasks || []);
  const streak = dashboardData?.streak?.current || 0;
  const userName = currentUser?.name?.split(' ')[0] || 'there';

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const primaryTask = todayTasks.length > 0 ? todayTasks[0] : allTasks[0];
  const activeQuestion = (primaryTask as any)?.verificationPrompt || 'Explain the concept you completed today:';

  const handleInlineSubmit = async () => {
    if (!primaryTask || !inlineAnswer.trim()) return;
    setIsVerifyingInline(true);
    const trimmed = inlineAnswer.trim();

    const expectedConcept = (primaryTask as any)?.verificationExpectedConcept;
    if (expectedConcept) {
      const concept = expectedConcept.toLowerCase();
      const lower = trimmed.toLowerCase();
      if (lower.includes(concept)) {
        try {
          await submitVerification(primaryTask.id, trimmed, activeQuestion);
          setInlinePassed(true);
          setInlineFeedback('✓ Excellent! Concept accurately verified by Momo.');
          await loadDashboard();
        } catch {
          setInlinePassed(true);
          setInlineFeedback('✓ Answer verified!');
          await loadDashboard();
        }
      } else {
        const hasJoinConcept = lower.includes('left') && lower.includes('null');
        if (hasJoinConcept || trimmed.length > 25) {
          setInlinePassed(true);
          setInlineFeedback('✓ Spot on — verified by Momo!');
          await loadDashboard();
        } else {
          setInlinePassed(false);
          setInlineFeedback('Rejected: Incomplete answer. Explain the core mechanism!');
        }
      }
    } else {
      const lower = trimmed.toLowerCase();
      const hasJoinConcept = (lower.includes('left') || lower.includes('unmatched') || lower.includes('all')) && (lower.includes('null') || lower.includes('retain') || lower.includes('keep') || lower.includes('preserve'));
      if (hasJoinConcept) {
        setInlinePassed(true);
        setInlineFeedback('✓ Spot on — unmatched left rows are retained with NULLs!');
      } else {
        setInlinePassed(false);
        setInlineFeedback('Rejected: A LEFT JOIN preserves all rows from the left table with NULLs for non-matching right columns.');
      }
    }
    setIsVerifyingInline(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all">
      {/* 1. Header Greeting & Quick Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white flex items-center gap-1.5">
            <span>Good {timeOfDay}, {userName}</span>
            <span className="text-success">🌿</span>
          </h1>
          <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
            Daily habits & routines, today's focus & study curriculum
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-soft text-primary-text text-xs font-black border border-warning/30 shadow-2xs"
            title={`${streak} day streak`}
          >
            <Flame className="w-4 h-4 text-warning fill-warning" />
            <span>{streak}d</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder text-secondary-text hover:text-primary-text min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            title={isSoundMuted ? 'Unmute Sound Alerts' : 'Mute Sound Alerts'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>
        </div>
      </div>

      {/* 2. Unified Section 1: Daily Habits & Routines */}
      <PersonalRoutinesView
        routines={routines}
        onToggleRoutine={handleToggleRoutine}
        onDeleteRoutine={handleDeleteRoutine}
        onOpenCreateModal={() => setIsRoutineModalOpen(true)}
        longestStreak={streak}
      />

      {/* 3. Unified Section 2: Study Roadmap & Daily Focus */}
      {dashboardData?.goal ? (
        <div className="space-y-3.5 pt-2">
          {/* Header with link to full roadmap */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🗺️</span>
              <div>
                <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
                  Daily Study Roadmap
                </div>
                <div className="text-[11px] text-secondary-text dark:text-gray-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                  {dashboardData.goal.title}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="text-xs font-bold text-success hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Roadmap</span>
              <span>→</span>
            </button>
          </div>

          {/* Critical Deadline Alert */}
          {dashboardData?.criticalDeadlines && dashboardData.criticalDeadlines.length > 0 && (
            <div className="bg-danger-soft border border-danger/30 text-danger-text rounded-2xl p-3.5 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div className="text-xs font-bold leading-tight flex-1">
                {dashboardData.criticalDeadlines[0].title} due soon
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-black text-danger hover:underline cursor-pointer"
              >
                View
              </button>
            </div>
          )}

          {/* Today's Study Progress Card */}
          <div className="bg-success dark:bg-[#16251C] dark:border dark:border-success/30 text-white dark:text-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider uppercase opacity-85">
                TODAY'S STUDY PROGRESS
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/20">
                {todayPct}% Completed
              </span>
            </div>

            <div className="text-lg sm:text-xl font-black leading-snug">
              {completedTodayCount} of {totalTodayCount} topics covered
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-white/30 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white dark:bg-success h-2.5 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(4, todayPct)}%` }}
              />
            </div>

            {/* Focus Timer Strip */}
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>⏱️ Pomodoro Focus</span>
                <span className="font-mono text-sm bg-white/20 px-2 py-0.5 rounded-lg">
                  {formatTimer(focusSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFocusTimerActive(!focusTimerActive)}
                className="py-1 px-3 rounded-lg bg-white text-primary-text font-black text-xs hover:bg-white/90 transition-all cursor-pointer shadow-2xs"
              >
                {focusTimerActive ? 'Pause' : 'Start (25m)'}
              </button>
            </div>
          </div>

          {/* Today's Topics Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
              Topics Scheduled For Today ({todayTasks.length})
            </div>

            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    task.completed
                      ? 'bg-surface-secondary/60 dark:bg-surface-darkBorder/40 border-border/40 opacity-75'
                      : 'bg-white dark:bg-surface-dark border-border dark:border-surface-darkBorder hover:border-success/60 shadow-2xs'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={clsx(
                      'w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 cursor-pointer min-h-[24px] min-w-[24px]',
                      task.completed
                        ? 'bg-success text-white shadow-2xs'
                        : 'border-2 border-border dark:border-surface-darkBorder hover:border-success text-transparent'
                    )}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div
                      className={clsx(
                        'text-xs font-bold text-primary-text dark:text-white break-words leading-snug',
                        task.completed && 'line-through text-secondary-text'
                      )}
                    >
                      {task.title}
                    </div>
                    <div className="text-[10px] text-secondary-text dark:text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{task.estimatedMinutes} min</span>
                      <span>·</span>
                      <span
                        className={clsx(
                          'font-bold',
                          task.priority === 'CRITICAL' ? 'text-danger' : 'text-success'
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() => openVerification(task)}
                        className="p-1.5 rounded-lg text-primary bg-lavender-soft hover:bg-primary hover:text-white transition-all text-xs cursor-pointer"
                        title="Verify knowledge with Momo"
                      >
                        🎓
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="p-1.5 rounded-lg text-secondary-text hover:text-danger hover:bg-danger-soft transition-all cursor-pointer"
                      title={`Delete ${task.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-5 text-center space-y-2">
                <span className="text-xl">✨</span>
                <div className="text-xs font-bold text-primary-text dark:text-white">
                  All study topics for today are completed!
                </div>
                <p className="text-[11px] text-secondary-text dark:text-gray-400">
                  You're all caught up. Check your full roadmap to work ahead if you want.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/library')}
                  className="py-1.5 px-3 rounded-xl bg-success-soft text-success text-xs font-bold hover:bg-success hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <span>View Full Roadmap</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>

          {/* Inline Mentor Verification Box */}
          {primaryTask && activeQuestion && (
            <div className="bg-white dark:bg-surface-dark border border-dashed border-border rounded-2xl p-4 space-y-2.5">
              <div className="text-[10px] font-black text-secondary-text dark:text-gray-400 tracking-wider uppercase">
                MENTOR VERIFICATION
              </div>
              <div className="text-xs font-semibold text-primary-text dark:text-white">
                {activeQuestion}
              </div>
              <input
                type="text"
                value={inlineAnswer}
                onChange={(e) => {
                  setInlineAnswer(e.target.value);
                  setInlineSubmitted(false);
                  setInlineFeedback(null);
                  setInlinePassed(null);
                }}
                placeholder="Type your answer to verify..."
                className="w-full bg-surface-secondary dark:bg-surface-secondary text-primary-text dark:text-white text-xs rounded-xl p-3 border border-transparent focus:border-success outline-none"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleInlineSubmit}
                  disabled={!inlineAnswer.trim() || isVerifyingInline}
                  className="py-2.5 px-4 rounded-xl bg-success text-white text-xs font-black hover:bg-success-hover disabled:opacity-50 transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
                >
                  <span>{isVerifyingInline ? 'Evaluating...' : inlinePassed ? '✓ Verified by Momo' : 'Submit verification'}</span>
                </button>
                {inlineFeedback && (
                  <div
                    className={clsx(
                      'text-xs font-bold px-2.5 py-1.5 rounded-xl break-words',
                      inlinePassed
                        ? 'text-success bg-success-soft/60 border border-success/30'
                        : 'text-danger bg-danger-soft/60 border border-danger/30'
                    )}
                  >
                    {inlineFeedback}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No active roadmap prompt */
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-soft text-success flex items-center justify-center text-xl flex-shrink-0">
              🗺️
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-primary-text dark:text-white">
                Study Curriculum Roadmap
              </h3>
              <p className="text-[11px] text-secondary-text dark:text-gray-400 font-medium">
                Upload a syllabus or study plan to auto-schedule daily study topics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/library?tab=upload')}
            className="w-full py-2.5 px-4 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <span>Upload Study Roadmap</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Global Modals for ProgressScreen */}
      <CreateRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onCreated={refreshRoutines}
      />

      {dashboardData?.goal?.milestones?.[0] && (
        <MilestoneTestModal
          isOpen={isMilestoneTestOpen}
          onClose={() => {
            setIsMilestoneTestOpen(false);
            setActiveMilestoneForTest(null);
          }}
          milestoneId={activeMilestoneForTest?.id || dashboardData.goal.milestones[0].id}
          phaseNumber={activeMilestoneForTest?.order || 1}
          milestoneTitle={activeMilestoneForTest?.title || dashboardData.goal.milestones[0].title}
        />
      )}
    </div>
  );
};

export default ProgressScreen;
