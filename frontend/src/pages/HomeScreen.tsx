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

  const [activeTestMilestone, setActiveTestMilestone] = useState<{
    id: string;
    title: string;
    phaseNumber: number;
  } | null>(null);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const goal = dashboardData?.goal || null;
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
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-6 transition-all">
      {/* Screen Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white flex items-center gap-2">
            <span>Progress & Analytics</span>
            <span>✨</span>
          </h1>
          <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
            Daily consistency rings, wave charts & curriculum velocity
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

      {/* 1. Daily Routine Consistency Analytics */}
      <div className="space-y-3">
        <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
          Daily Routine Consistency
        </div>
        <PersonalAnalyticsView
          routines={routines}
          onOpenCreateModal={() => setIsRoutineModalOpen(true)}
          longestStreak={longestStreak}
        />
      </div>

      {/* 2. Study Curriculum Mastery Analytics */}
      <div className="space-y-3">
        <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider px-1">
          Curriculum & Roadmap Mastery
        </div>
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
          onNavigateUpload={() => navigate('/library?tab=upload')}
          milestoneTestStats={milestoneStats}
        />
      </div>

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
