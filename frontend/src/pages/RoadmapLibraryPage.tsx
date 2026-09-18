import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Pause, Play, Archive, Trash2, RotateCcw } from 'lucide-react';
import { StoredRoadmap } from '../components/domain/RoadmapCard.js';
import {
  getStoredRoadmaps,
  addOrUpdateRoadmap,
  togglePauseRoadmap,
  archiveRoadmap,
  deleteRoadmap,
  clearAllRoadmaps,
  setActiveRoadmap,
  resetRoadmap,
  getOrSynthesizePlanData,
} from '../services/roadmapLibrary.js';
import { saveGoalPlan } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import clsx from 'clsx';

export const RoadmapLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loadDashboard } = useAppStore();
  const [roadmaps, setRoadmaps] = useState<StoredRoadmap[]>([]);

  useEffect(() => {
    let stored = getStoredRoadmaps();

    const activeGoal = dashboardData?.goal;
    if (activeGoal) {
      const allTasks = activeGoal.milestones.flatMap((m) => m.tasks);
      const completedTasks = allTasks.filter((t) => t.completed).length;

      const syncedItem: StoredRoadmap = {
        id: activeGoal.id,
        title: activeGoal.title,
        description: activeGoal.description || undefined,
        status: 'active',
        progress: activeGoal.progress || 0,
        totalTasks: allTasks.length,
        completedTasks,
        startDate: activeGoal.startDate,
        deadline: activeGoal.deadline,
        subjectTag: 'Core Curriculum',
      };

      addOrUpdateRoadmap(syncedItem);
      stored = getStoredRoadmaps();
    }

    setRoadmaps(stored);
  }, [dashboardData]);

  const handleSelectActive = async (id: string) => {
    try {
      const target = roadmaps.find((r) => r.id === id);
      if (!target) return;

      const updated = setActiveRoadmap(id);
      setRoadmaps([...updated]);

      // Activate in backend database so Home and Progress dashboards switch to it
      const plan = getOrSynthesizePlanData(target);
      await saveGoalPlan(plan);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to set roadmap active:', err);
    }
  };

  const handleReset = async (id: string, title: string) => {
    if (window.confirm(`Restart "${title}" from Day 1? This will reset all your completed tasks to 0.`)) {
      try {
        const target = roadmaps.find((r) => r.id === id);
        const updated = resetRoadmap(id);
        setRoadmaps([...updated]);

        // If target is currently active in database, call backend reset
        if (target && target.status === 'active') {
          await fetch('/api/goals/reset', { method: 'POST' });
          await loadDashboard();
        }
      } catch (err) {
        console.error('Failed to reset roadmap:', err);
      }
    }
  };

  const handleTogglePause = (id: string) => {
    const updated = togglePauseRoadmap(id);
    setRoadmaps([...updated]);
  };

  const handleArchive = (id: string) => {
    const updated = archiveRoadmap(id);
    setRoadmaps([...updated]);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" roadmap?`)) {
      const updated = deleteRoadmap(id);
      setRoadmaps([...updated]);

      // If active goal was deleted, clear active goal in backend too
      if (dashboardData?.goal?.id === id) {
        try {
          await fetch('/api/goals/active', { method: 'DELETE' });
          await loadDashboard();
        } catch (err) {
          console.error('Failed to clear active goal:', err);
        }
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Remove all roadmaps and start fresh from zero?')) {
      clearAllRoadmaps();
      setRoadmaps([]);
      try {
        await fetch('/api/goals/active', { method: 'DELETE' });
        await loadDashboard();
      } catch (err) {
        console.error('Failed to clear active goal in backend:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white">
            My roadmaps
          </h1>
          <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
            Career roadmaps as a bookshelf — resume or pause anytime
          </p>
        </div>

        <div className="flex items-center gap-2">
          {roadmaps.length > 0 && (
            <button
              onClick={handleClearAll}
              className="py-2 px-3 rounded-xl border border-border dark:border-surface-darkBorder text-secondary-text hover:text-danger hover:border-danger/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 min-h-[40px]"
              title="Remove all roadmaps & start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          )}

          <button
            onClick={() => navigate('/upload')}
            className="py-2.5 px-3.5 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New roadmap</span>
          </button>
        </div>
      </div>

      {/* Roadmaps List or Empty State */}
      {roadmaps.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-8 text-center shadow-2xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-secondary dark:bg-surface-darkBorder flex items-center justify-center text-3xl">
            📚
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-primary-text dark:text-white">
              Your Bookshelf is Clean & Fresh
            </h3>
            <p className="text-xs text-secondary-text dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
              No roadmaps currently active. Upload a syllabus document or paste your study plan text to begin your fresh learning journey.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/upload')}
              className="py-3 px-5 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Fresh Roadmap</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {roadmaps.map((r) => {
            const isActive = r.status === 'active';
            const iconBg = isActive ? 'bg-success-soft text-success' : 'bg-surface-secondary text-secondary-text';
            const barColor = isActive ? 'bg-success' : 'bg-secondary-text';

            return (
              <div
                key={r.id}
                className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Icon box */}
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0', iconBg)}>
                    {isActive ? '📘' : '📙'}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-primary-text dark:text-white break-words leading-snug">
                        {r.title}
                      </h3>
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                          isActive
                            ? 'bg-success-soft text-success'
                            : r.status === 'paused'
                            ? 'bg-warning-soft text-warning-text'
                            : 'bg-surface-secondary text-secondary-text'
                        )}
                      >
                        {r.status} · {Math.round(r.progress)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface-secondary dark:bg-surface-darkBorder rounded-full h-2 overflow-hidden">
                      <div
                        className={clsx('h-2 rounded-full transition-all duration-500', barColor)}
                        style={{ width: `${Math.max(4, Math.round(r.progress))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 dark:border-surface-darkBorder/60 text-xs">
                  <span className="text-[11px] font-medium text-secondary-text dark:text-gray-400">
                    {r.completedTasks} of {r.totalTasks} tasks finished
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isActive ? (
                      <button
                        onClick={() => handleTogglePause(r.id)}
                        className="px-3 py-2 rounded-xl bg-surface-secondary dark:bg-surface-darkBorder hover:bg-border text-primary-text dark:text-white font-black text-xs min-h-[44px] flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectActive(r.id)}
                        className="px-3 py-2 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs min-h-[44px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Set Active</span>
                      </button>
                    )}

                    {/* Reset Roadmap Button */}
                    <button
                      onClick={() => handleReset(r.id, r.title)}
                      className="px-2.5 py-2 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary dark:hover:bg-surface-darkBorder font-bold text-xs min-h-[44px] flex items-center gap-1 cursor-pointer transition-all"
                      title="Reset roadmap to start fresh from Day 1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    {r.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(r.id)}
                        className="px-2.5 py-2 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary dark:hover:bg-surface-darkBorder font-bold text-xs min-h-[44px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Archive roadmap"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(r.id, r.title)}
                      className="px-2.5 py-2 rounded-xl text-secondary-text hover:text-danger hover:bg-danger-soft font-bold text-xs min-h-[44px] flex items-center gap-1 cursor-pointer transition-all"
                      title="Delete roadmap"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Button: + New Roadmap */}
      {roadmaps.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => navigate('/upload')}
            className="w-full min-h-[48px] py-3.5 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ New roadmap</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RoadmapLibraryPage;
