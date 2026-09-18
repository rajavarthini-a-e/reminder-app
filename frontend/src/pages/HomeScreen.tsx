import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Flame } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import {
  getMilestoneTestStats,
} from '../services/milestoneTestService.js';
import { MilestoneTestModal } from '../components/milestones/MilestoneTestModal.js';
import {
  getStoredRoutines,
  Routine,
} from '../services/routinesService.js';
import { PersonalAnalyticsView } from '../components/personal/PersonalAnalyticsView.js';
import { CareerAnalyticsView } from '../components/career/CareerAnalyticsView.js';
import { CreateRoutineModal } from '../components/routines/CreateRoutineModal.js';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loadDashboard } = useAppStore();

  const [activeTab, setActiveTab] = useState<'career' | 'personal'>('career');
  const [activeTestMilestone, setActiveTestMilestone] = useState<{
    id: string;
    title: string;
    phaseNumber: number;
  } | null>(null);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const goal = dashboardData?.goal || null;
  const milestones = goal?.milestones || [];
  const streak = dashboardData?.streak?.current ?? 0;
  const milestoneStats = getMilestoneTestStats();

  const allTasks = useMemo(() => {
    return (goal?.milestones || []).flatMap((m) => m.tasks || []);
  }, [goal]);

  const completedTasks = useMemo(() => {
    return allTasks.filter((t) => t.completed);
  }, [allTasks]);

  // Personal routines for analytics
  const [routines, setRoutines] = useState<Routine[]>(() => getStoredRoutines());
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  React.useEffect(() => {
    const handleUpdate = () => {
      setRoutines(getStoredRoutines());
    };
    window.addEventListener('mentor_routines_updated', handleUpdate);
    return () => window.removeEventListener('mentor_routines_updated', handleUpdate);
  }, []);

  const longestStreak = routines.length > 0 ? Math.max(...routines.map((r) => r.streak || 0), 0) : 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all">
      {/* Screen Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white flex items-center gap-2">
            <span>{activeTab === 'career' ? 'Career Analytics' : 'Routine Analytics'}</span>
            <span>{activeTab === 'career' ? '🎓' : '✨'}</span>
          </h1>
          <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
            {activeTab === 'career'
              ? 'Curriculum velocity, 7-day study rhythm & phase mastery'
              : 'Radial consistency rings, 7-day wave charts & task-by-task statistics'}
          </p>
        </div>

        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-soft text-primary-text text-xs font-black border border-warning/30 shadow-2xs"
            title={`${streak} day streak`}
          >
            <Flame className="w-4 h-4 text-warning fill-warning" />
            <span>{streak}d</span>
          </div>
        )}
      </div>

      {/* Domain Switcher */}
      <div className="flex bg-surface-secondary dark:bg-surface-darkBorder rounded-2xl p-1 select-none border border-border/60">
        <button
          onClick={() => setActiveTab('career')}
          className={clsx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer',
            activeTab === 'career'
              ? 'bg-success text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          )}
        >
          🎓 Career Growth
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={clsx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer',
            activeTab === 'personal'
              ? 'bg-peach text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          )}
        >
          🌿 Routine Consistency
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CAREER GROWTH ANALYTICS (User-Friendly, Visual & Comprehensive)         */}
      {/* ========================================================================= */}
      {activeTab === 'career' && (
        <CareerAnalyticsView
          goal={goal}
          allTasks={allTasks}
          completedTasks={completedTasks}
          streak={streak}
          goalProgress={dashboardData?.goalProgress ?? 0}
          onTakeMilestoneTest={(m) =>
            setActiveTestMilestone({
              id: m.id,
              title: m.title,
              phaseNumber: m.order,
            })
          }
          onNavigateUpload={() => navigate('/upload')}
          milestoneTestStats={milestoneStats}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. PERSONAL ROUTINE ANALYTICS (Modeled after Image 2: Wave Chart & Ring)  */}
      {/* ========================================================================= */}
      {activeTab === 'personal' && (
        <PersonalAnalyticsView
          routines={routines}
          onOpenCreateModal={() => setIsRoutineModalOpen(true)}
          longestStreak={longestStreak}
        />
      )}

      {/* Deep Milestone Knowledge Test Modal */}
      {activeTestMilestone && (
        <MilestoneTestModal
          isOpen={Boolean(activeTestMilestone)}
          onClose={() => setActiveTestMilestone(null)}
          milestoneId={activeTestMilestone.id}
          phaseNumber={activeTestMilestone.phaseNumber}
          milestoneTitle={`Phase ${activeTestMilestone.phaseNumber}: ${activeTestMilestone.title}`}
        />
      )}

      {/* Create Routine Modal */}
      <CreateRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onCreated={() => setRoutines(getStoredRoutines())}
      />
    </div>
  );
};

export default HomeScreen;
