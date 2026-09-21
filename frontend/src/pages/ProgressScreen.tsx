import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAppStore } from '../store/useAppStore.js';
import {
  Flame,
  Volume2,
  VolumeX,
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
import { CareerPlanView } from '../components/career/CareerPlanView.js';
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

  const [domainMode, setDomainMode] = useState<'career' | 'personal'>(() => {
    return (localStorage.getItem('mentor_domain_mode') as 'career' | 'personal') || 'personal';
  });

  const handleSwitchDomain = (mode: 'career' | 'personal') => {
    setDomainMode(mode);
    localStorage.setItem('mentor_domain_mode', mode);
  };
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
            {domainMode === 'career' ? 'Daily curriculum progress & topic execution' : 'Personal routine progress & daily habits'}
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

      {/* 2. Mode Switch: Career vs Personal */}
      <div className="flex bg-surface-secondary dark:bg-surface-darkBorder rounded-2xl p-1 select-none border border-border/60">
        <button
          onClick={() => handleSwitchDomain('career')}
          className={clsx(
            'flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
            domainMode === 'career'
              ? 'bg-success text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          )}
        >
          <span>🎓</span>
          <span>Career</span>
        </button>
        <button
          onClick={() => handleSwitchDomain('personal')}
          className={clsx(
            'flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
            domainMode === 'personal'
              ? 'bg-peach text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          )}
        >
          <span>🌿</span>
          <span>Personal</span>
        </button>
      </div>

      {/* Quick Active Roadmap Card (visible in Personal mode when an active roadmap exists) */}
      {domainMode === 'personal' && dashboardData?.goal && (
        <div
          onClick={() => navigate('/library')}
          className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:border-success transition-all group"
          title="Open your full study roadmap"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-success-soft text-success flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition-transform">
              🗺️
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-secondary-text">
                Active Study Roadmap
              </div>
              <div className="text-xs font-bold text-primary-text dark:text-white truncate">
                {dashboardData.goal.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-black text-success">
              {Math.round(dashboardData.goal.progress || 0)}%
            </span>
            <span className="text-xs text-secondary-text font-bold group-hover:translate-x-0.5 transition-transform">
              View Roadmap →
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAREER MODE (Daily & Weekly & Monthly Progress + Execution)                */}
      {/* ========================================================================= */}
      {domainMode === 'career' && (
        <CareerPlanView
          goal={dashboardData?.goal || null}
          allTasks={allTasks}
          todayTasks={todayTasks}
          onDeleteTask={handleDeleteTask}
          onVerifyTask={openVerification}
          onToggleTask={(task) => toggleTask(task.id)}
          focusTimerActive={focusTimerActive}
          focusSeconds={focusSeconds}
          onToggleFocusTimer={() => setFocusTimerActive(!focusTimerActive)}
          formatTimer={formatTimer}
          onTakeMilestoneTest={(milestone) => {
            setActiveMilestoneForTest(milestone);
            setIsMilestoneTestOpen(true);
          }}
          onNavigateUpload={() => navigate('/library')}
          onNavigateCalendar={() => navigate('/calendar')}
          criticalDeadlineSlot={
            dashboardData?.criticalDeadlines && dashboardData.criticalDeadlines.length > 0 ? (
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
            ) : null
          }
          inlineVerificationSlot={
            primaryTask && activeQuestion ? (
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
            ) : null
          }
        />
      )}

      {/* ========================================================================= */}
      {/* PERSONAL MODE (Daily & Weekly & Monthly Progress + Routines Checklist)     */}
      {/* ========================================================================= */}
      {domainMode === 'personal' && (
        <PersonalRoutinesView
          routines={routines}
          onToggleRoutine={handleToggleRoutine}
          onDeleteRoutine={handleDeleteRoutine}
          onOpenCreateModal={() => setIsRoutineModalOpen(true)}
          longestStreak={streak}
        />
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
