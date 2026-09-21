import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Pause,
  Play,
  Archive,
  Trash2,
  RotateCcw,
  Check,
  Map,
} from 'lucide-react';
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
import { saveGoalPlan, resetActiveGoal, deleteActiveGoal, deleteTask } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import { MilestoneTestModal } from '../components/milestones/MilestoneTestModal.js';
import { Milestone, Task } from '@shared/types';
import clsx from 'clsx';

export const RoadmapLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loadDashboard, toggleTask, openVerification } = useAppStore();
  const [roadmaps, setRoadmaps] = useState<StoredRoadmap[]>([]);

  // View tabs: 'full' (full active roadmap timeline) or 'shelf' (all saved roadmaps)
  const [activeTab, setActiveTab] = useState<'full' | 'shelf'>('full');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);

  // Milestone Test Modal
  const [activeTestMilestone, setActiveTestMilestone] = useState<{
    id: string;
    title: string;
    phaseNumber: number;
  } | null>(null);

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

  // Determine active roadmap
  const activeRoadmap = useMemo(() => {
    if (selectedRoadmapId) {
      const found = roadmaps.find((r) => r.id === selectedRoadmapId);
      if (found) return found;
    }
    return roadmaps.find((r) => r.status === 'active') || roadmaps[0] || null;
  }, [roadmaps, selectedRoadmapId]);

  // Milestones for the active roadmap view
  const activeMilestones = useMemo(() => {
    // If viewing the backend active goal
    if (dashboardData?.goal && (!selectedRoadmapId || selectedRoadmapId === dashboardData.goal.id)) {
      return (dashboardData.goal.milestones || []) as any[];
    }

    if (activeRoadmap) {
      const plan = getOrSynthesizePlanData(activeRoadmap);
      if (plan?.milestones) {
        return plan.milestones.map((m: any, idx: number) => ({
          id: m.id || `m-${idx + 1}`,
          goalId: activeRoadmap.id,
          title: m.title || `Phase ${idx + 1}`,
          description: m.description || '',
          order: idx + 1,
          dueDate: m.dueDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completed: Array.isArray(m.tasks) && m.tasks.length > 0 && m.tasks.every((t: any) => t.completed),
          tasks: (m.tasks || []).map((t: any, tIdx: number) => ({
            id: t.id || `t-${idx + 1}-${tIdx + 1}`,
            milestoneId: m.id || `m-${idx + 1}`,
            title: t.title,
            estimatedMinutes: t.estimatedMinutes || 45,
            completed: Boolean(t.completed),
            priority: t.priority || 'CORE',
            verificationType: t.verificationType || 'LEARNING',
            scheduledTime: t.scheduledTime || new Date().toISOString(),
          })),
        }));
      }
    }

    return [];
  }, [dashboardData?.goal, activeRoadmap, selectedRoadmapId]);

  const allActiveTasks = useMemo(() => {
    return activeMilestones.flatMap((m) => m.tasks || []);
  }, [activeMilestones]);

  const completedActiveTasks = useMemo(() => {
    return allActiveTasks.filter((t) => t.completed);
  }, [allActiveTasks]);

  const activeProgressPct = allActiveTasks.length > 0
    ? Math.round((completedActiveTasks.length / allActiveTasks.length) * 100)
    : Math.round(activeRoadmap?.progress || 0);

  const isViewingLiveActiveGoal =
    dashboardData?.goal && (!selectedRoadmapId || selectedRoadmapId === dashboardData.goal.id);

  const handleSelectActive = async (id: string) => {
    try {
      const target = roadmaps.find((r) => r.id === id);
      if (!target) return;

      const updated = setActiveRoadmap(id);
      setRoadmaps([...updated]);
      setSelectedRoadmapId(id);

      const plan = getOrSynthesizePlanData(target);
      await saveGoalPlan(plan);
      await loadDashboard();
      setActiveTab('full');
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

        if (target && (target.status === 'active' || dashboardData?.goal?.id === id)) {
          await resetActiveGoal();
          await loadDashboard();
        }
      } catch (err) {
        console.error('Failed to reset roadmap:', err);
      }
    }
  };

  const handleToggleTaskItem = async (task: Task) => {
    if (isViewingLiveActiveGoal) {
      await toggleTask(task.id);
    } else if (activeRoadmap) {
      // Toggle in local storage for offline roadmap
      const currentRoadmaps = getStoredRoadmaps();
      const targetR = currentRoadmaps.find((r) => r.id === activeRoadmap.id);
      if (targetR && targetR.planData?.milestones) {
        targetR.planData.milestones.forEach((m: any) => {
          (m.tasks || []).forEach((t: any) => {
            if (t.id === task.id || t.title === task.title) {
              t.completed = !t.completed;
            }
          });
        });
        const allT = targetR.planData.milestones.flatMap((m: any) => m.tasks || []);
        const compT = allT.filter((t: any) => t.completed).length;
        targetR.completedTasks = compT;
        targetR.progress = allT.length > 0 ? Math.round((compT / allT.length) * 100) : 0;
        addOrUpdateRoadmap(targetR);
        setRoadmaps([...getStoredRoadmaps()]);
      }
    }
  };

  const handleDeleteTaskItem = async (taskId: string, title: string) => {
    if (window.confirm(`Delete "${title}" from this roadmap?`)) {
      if (isViewingLiveActiveGoal) {
        try {
          await deleteTask(taskId);
          await loadDashboard();
        } catch (err) {
          console.error('Failed to delete task:', err);
        }
      } else if (activeRoadmap) {
        const currentRoadmaps = getStoredRoadmaps();
        const targetR = currentRoadmaps.find((r) => r.id === activeRoadmap.id);
        if (targetR && targetR.planData?.milestones) {
          targetR.planData.milestones.forEach((m: any) => {
            m.tasks = (m.tasks || []).filter((t: any) => t.id !== taskId && t.title !== title);
          });
          addOrUpdateRoadmap(targetR);
          setRoadmaps([...getStoredRoadmaps()]);
        }
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

      if (selectedRoadmapId === id) {
        setSelectedRoadmapId(null);
      }

      if (dashboardData?.goal?.id === id) {
        try {
          await deleteActiveGoal();
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
      setSelectedRoadmapId(null);
      try {
        await deleteActiveGoal();
        await loadDashboard();
      } catch (err) {
        console.error('Failed to clear active goal in backend:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 md:py-6 pb-28 md:pb-14 space-y-4 transition-all">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white flex items-center gap-2">
            <span>Study Roadmaps</span>
            <span className="text-success">🗺️</span>
          </h1>
          <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
            Full curriculum timeline, phases & daily progress
          </p>
        </div>

        <div className="flex items-center gap-2">
          {roadmaps.length > 0 && activeTab === 'shelf' && (
            <button
              onClick={handleClearAll}
              className="py-2 px-2.5 rounded-xl border border-border dark:border-surface-darkBorder text-secondary-text hover:text-danger text-xs font-bold transition-all cursor-pointer flex items-center gap-1 min-h-[40px]"
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
            <span className="whitespace-nowrap">New roadmap</span>
          </button>
        </div>
      </div>

      {/* 2. Top View Switcher: [Full Roadmap] vs [All Roadmaps Shelf] */}
      <div className="flex bg-surface-secondary dark:bg-surface-darkBorder rounded-2xl p-1 select-none border border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab('full')}
          className={clsx(
            'flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]',
            activeTab === 'full'
              ? 'bg-success text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          )}
        >
          <span>🗺️</span>
          <span>Full Roadmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shelf')}
          className={clsx(
            'flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]',
            activeTab === 'shelf'
              ? 'bg-success text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          )}
        >
          <span>📚</span>
          <span>All Roadmaps ({roadmaps.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FULL ROADMAP VIEW (All Phases, Milestones & Topics Checklist)     */}
      {/* ========================================================================= */}
      {activeTab === 'full' && (
        <div className="space-y-4 animate-fadeIn">
          {activeRoadmap ? (
            <>
              {/* If viewing an inactive roadmap, show a banner allowing 1-click activation */}
              {!isViewingLiveActiveGoal && (
                <div className="bg-warning-soft border border-warning/30 rounded-2xl p-3.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📌</span>
                    <span className="font-bold text-primary-text">
                      Viewing library roadmap. Not currently active.
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectActive(activeRoadmap.id)}
                    className="py-1.5 px-3 rounded-xl bg-success text-white font-black text-xs hover:bg-success-hover cursor-pointer shadow-xs flex-shrink-0"
                  >
                    Set as Active
                  </button>
                </div>
              )}

              {/* Roadmap Overview Hero Card */}
              <div className="bg-success dark:bg-[#16251C] dark:border dark:border-success/30 text-white dark:text-gray-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20">
                      {isViewingLiveActiveGoal ? 'ACTIVE CURRICULUM' : 'SAVED ROADMAP'}
                    </span>
                    {activeRoadmap.subjectTag && (
                      <span className="text-[10px] font-bold opacity-80">
                        {activeRoadmap.subjectTag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/20">
                    {activeProgressPct}% Completed
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black leading-snug break-words">
                    {activeRoadmap.title}
                  </h2>
                  {activeRoadmap.description && (
                    <p className="text-xs opacity-90 font-medium mt-1 leading-relaxed">
                      {activeRoadmap.description}
                    </p>
                  )}
                </div>

                <div className="text-xs font-bold opacity-95">
                  {completedActiveTasks.length} of {allActiveTasks.length} total topics completed
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-white/30 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-white dark:bg-success h-2.5 rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${Math.max(4, activeProgressPct)}%` }}
                  />
                </div>

                {/* Quick Actions inside Hero */}
                <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <button
                    onClick={() => handleReset(activeRoadmap.id, activeRoadmap.title)}
                    className="py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[38px]"
                    title="Reset all topics and restart this roadmap from Day 1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart from Day 1</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('shelf')}
                    className="py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[38px]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Switch Roadmap</span>
                  </button>
                </div>
              </div>

              {/* Milestones & Phases Breakdown */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-black text-primary-text dark:text-white uppercase tracking-wider">
                    Curriculum Phases & Milestones ({activeMilestones.length})
                  </div>
                  <span className="text-[11px] text-secondary-text dark:text-gray-400 font-medium">
                    Tap any checkmark to mark complete
                  </span>
                </div>

                {activeMilestones.length > 0 ? (
                  activeMilestones.map((milestone, idx) => {
                    const mTasks = milestone.tasks || [];
                    const mCompleted = mTasks.filter((t) => t.completed).length;
                    const mTotal = mTasks.length;
                    const mPct = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
                    const isAllDone = mTotal > 0 && mCompleted === mTotal;

                    return (
                      <div
                        key={milestone.id || `milestone-${idx}`}
                        className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all"
                      >
                        {/* Phase Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-success uppercase tracking-wider">
                              Phase {idx + 1}
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-primary-text dark:text-white break-words">
                              {milestone.title}
                            </h3>
                            {milestone.description && (
                              <p className="text-[11px] text-secondary-text dark:text-gray-400 font-medium leading-relaxed">
                                {milestone.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span
                              className={clsx(
                                'text-[10px] font-black px-2.5 py-0.5 rounded-full',
                                isAllDone
                                  ? 'bg-success-soft text-success'
                                  : 'bg-surface-secondary text-secondary-text'
                              )}
                            >
                              {mCompleted}/{mTotal} · {mPct}%
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setActiveTestMilestone({
                                  id: milestone.id,
                                  title: milestone.title,
                                  phaseNumber: idx + 1,
                                })
                              }
                              className="text-[10px] font-black text-primary bg-lavender-soft hover:bg-primary hover:text-white py-1 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Test your mastery of this phase with Momo"
                            >
                              <span>🎓 Take Quiz</span>
                            </button>
                          </div>
                        </div>

                        {/* Phase Progress Bar */}
                        <div className="w-full bg-surface-secondary dark:bg-surface-darkBorder rounded-full h-2 overflow-hidden">
                          <div
                            className={clsx(
                              'h-2 rounded-full transition-all duration-500',
                              isAllDone ? 'bg-success' : 'bg-primary'
                            )}
                            style={{ width: `${Math.max(2, mPct)}%` }}
                          />
                        </div>

                        {/* Topics Checklist */}
                        <div className="space-y-2 pt-1">
                          {mTasks.map((task) => (
                            <div
                              key={task.id}
                              className={clsx(
                                'bg-surface-secondary/60 dark:bg-surface-darkBorder/40 rounded-xl p-3 flex items-center justify-between gap-3 transition-all',
                                task.completed && 'opacity-85'
                              )}
                            >
                              {/* Left: Checkbox */}
                              <button
                                type="button"
                                onClick={() => handleToggleTaskItem(task)}
                                className={clsx(
                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-2xs',
                                  task.completed
                                    ? 'bg-success text-white'
                                    : 'border border-border dark:border-surface-darkBorder hover:border-success text-secondary-text hover:text-success'
                                )}
                                title={task.completed ? 'Topic completed — click to undo' : 'Mark topic complete'}
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>

                              {/* Center: Topic Info */}
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

                              {/* Right: Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isViewingLiveActiveGoal && !task.completed && (
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
                                  onClick={() => handleDeleteTaskItem(task.id, task.title)}
                                  className="p-1.5 rounded-lg text-secondary-text hover:text-danger hover:bg-danger-soft transition-all cursor-pointer"
                                  title={`Delete ${task.title}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-6 text-center space-y-2">
                    <span className="text-2xl">🌱</span>
                    <div className="text-xs font-bold text-primary-text dark:text-white">
                      No milestones found in this roadmap
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* No Roadmap Empty State */
            <div className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-8 text-center shadow-2xs space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-secondary dark:bg-surface-darkBorder flex items-center justify-center text-3xl">
                🗺️
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-primary-text dark:text-white">
                  No Active Roadmap Yet
                </h3>
                <p className="text-xs text-secondary-text dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Upload a curriculum document, paste a syllabus, or generate a fresh roadmap to track your daily progress.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => navigate('/upload')}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Fresh Roadmap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKSHELF VIEW (Saved Roadmaps Cards & Switcher)                  */}
      {/* ========================================================================= */}
      {activeTab === 'shelf' && (
        <div className="space-y-3.5 animate-fadeIn">
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
                  No roadmaps currently saved. Upload a syllabus document or paste your study plan to begin.
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
                const iconBg = isActive
                  ? 'bg-success-soft text-success'
                  : 'bg-surface-secondary text-secondary-text';
                const barColor = isActive ? 'bg-success' : 'bg-secondary-text';

                return (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon box */}
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                          iconBg
                        )}
                      >
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
                        {/* View Full Roadmap */}
                        <button
                          onClick={() => {
                            setSelectedRoadmapId(r.id);
                            setActiveTab('full');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-surface-secondary dark:bg-surface-darkBorder hover:bg-border text-primary-text dark:text-white font-bold text-xs min-h-[38px] flex items-center gap-1 cursor-pointer transition-all"
                          title="View all phases and topics in this roadmap"
                        >
                          <Map className="w-3.5 h-3.5 text-success" />
                          <span>View Roadmap</span>
                        </button>

                        {isActive ? (
                          <button
                            onClick={() => handleTogglePause(r.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-surface-secondary dark:bg-surface-darkBorder hover:bg-border text-secondary-text font-bold text-xs min-h-[38px] flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectActive(r.id)}
                            className="px-3 py-1.5 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs min-h-[38px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Set Active</span>
                          </button>
                        )}

                        {/* Reset Roadmap Button */}
                        <button
                          onClick={() => handleReset(r.id, r.title)}
                          className="px-2.5 py-1.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary dark:hover:bg-surface-darkBorder font-bold text-xs min-h-[38px] flex items-center gap-1 cursor-pointer transition-all"
                          title="Reset roadmap to start fresh from Day 1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reset</span>
                        </button>

                        {r.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(r.id)}
                            className="px-2 py-1.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary dark:hover:bg-surface-darkBorder font-bold text-xs min-h-[38px] flex items-center gap-1 cursor-pointer transition-all"
                            title="Archive roadmap"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(r.id, r.title)}
                          className="px-2 py-1.5 rounded-xl text-secondary-text hover:text-danger hover:bg-danger-soft font-bold text-xs min-h-[38px] flex items-center gap-1 cursor-pointer transition-all"
                          title="Delete roadmap"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
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
                className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload or Create New Roadmap</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Milestone Knowledge Test Modal */}
      {activeTestMilestone && (
        <MilestoneTestModal
          isOpen={Boolean(activeTestMilestone)}
          onClose={() => setActiveTestMilestone(null)}
          milestoneId={activeTestMilestone.id}
          milestoneTitle={activeTestMilestone.title}
          phaseNumber={activeTestMilestone.phaseNumber}
          onCompleted={() => {
            setActiveTestMilestone(null);
            loadDashboard();
          }}
        />
      )}
    </div>
  );
};

export default RoadmapLibraryPage;
