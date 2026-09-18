import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Brain,
  ShieldCheck,
  BellRing,
  BookOpen,
  Plus,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { ExtractedPlan } from '@shared/types';
import { uploadPlanFile, uploadPlanText, saveGoalPlan } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import { Card, Button, Badge, Heading, Text } from '../components/ui/index.js';
import { Mascot } from '../components/ui/Mascot.js';
import { UploadCard, UploadState } from '../components/domain/UploadCard.js';
import { RoadmapCard, StoredRoadmap } from '../components/domain/RoadmapCard.js';
import { Illustration } from '../components/ui/Illustration.js';
import { FileText } from 'lucide-react';
import {
  getStoredRoadmaps,
  addOrUpdateRoadmap,
  togglePauseRoadmap,
  archiveRoadmap,
  deleteRoadmap,
  setActiveRoadmap,
  resetRoadmap,
  getOrSynthesizePlanData,
} from '../services/roadmapLibrary.js';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loadDashboard } = useAppStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 0: true });
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoScheduled, setIsAutoScheduled] = useState(false);
  const [roadmaps, setRoadmaps] = useState<StoredRoadmap[]>([]);
  const [dailyCommitment, setDailyCommitment] = useState<'30 min' | '1 hour' | '2+ hours'>('1 hour');
  const [uploadedFileName, setUploadedFileName] = useState<string>('data_analyst_roadmap.pdf');

  // Synchronize active goal from backend into local bookshelf library
  useEffect(() => {
    const stored = getStoredRoadmaps();
    const activeGoal = dashboardData?.goal;

    if (activeGoal) {
      const allTasks = activeGoal.milestones.flatMap((m) => m.tasks);
      const completedTasks = allTasks.filter((t) => t.completed).length;

      const syncedItem: StoredRoadmap = {
        id: activeGoal.id,
        title: activeGoal.title,
        description: activeGoal.description || undefined,
        status: 'active',
        progress: activeGoal.progress,
        totalTasks: allTasks.length,
        completedTasks,
        startDate: activeGoal.startDate,
        deadline: activeGoal.deadline,
        subjectTag: 'Core Curriculum',
      };

      addOrUpdateRoadmap(syncedItem);
    }

    setRoadmaps(getStoredRoadmaps());
  }, [dashboardData]);

  const handleFileSelect = async (file: File) => {
    setErrorMsg(null);
    setUploadState('uploading');
    setUploadedFileName(file.name);

    try {
      setUploadState('parsing');
      const plan = await uploadPlanFile(file);
      setExtractedPlan(plan);
      setExpandedWeeks({ 0: true });
      setUploadState('idle');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse file. Please upload a PDF, DOCX, Markdown, or plain text plan.');
      setUploadState('error');
    }
  };

  const handleTextSubmit = async (text: string) => {
    if (!text.trim()) return;
    setErrorMsg(null);
    setUploadState('parsing');

    try {
      setUploadState('parsing');
      const plan = await uploadPlanText(text);
      setExtractedPlan(plan);
      setExpandedWeeks({ 0: true });
      setUploadState('idle');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse plan text. Please check the structure and try again.');
      setUploadState('error');
    }
  };

  const toggleWeek = (index: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleConfirmAndStart = async () => {
    if (!extractedPlan) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const response = await saveGoalPlan(extractedPlan);

      // Save into client-side bookshelf library as active
      const totalTasksCount = extractedPlan.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
      const newRoadmap: StoredRoadmap = {
        id: response.goalId || `roadmap-${Date.now()}`,
        title: extractedPlan.goal,
        description: extractedPlan.rawSummary || undefined,
        status: 'active',
        progress: 0,
        totalTasks: totalTasksCount,
        completedTasks: 0,
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + (extractedPlan.duration || 60) * 86400000).toISOString(),
        subjectTag: 'Self-Paced',
        planData: extractedPlan,
      };
      addOrUpdateRoadmap(newRoadmap);

      await loadDashboard();
      setIsSaving(false);
      setIsAutoScheduled(true); // Switch to Auto-Calendar confirmation view (Mockup Screen 3)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to activate plan.');
      setIsSaving(false);
    }
  };

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

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" roadmap permanently?`)) {
      try {
        const target = roadmaps.find((r) => r.id === id);
        const updated = deleteRoadmap(id);
        setRoadmaps([...updated]);

        // If active in database, clear active goal
        if (target && (target.status === 'active' || dashboardData?.goal?.title === title)) {
          await fetch('/api/goals/active', { method: 'DELETE' });
          await loadDashboard();
        }
      } catch (err) {
        console.error('Failed to delete roadmap:', err);
      }
    }
  };

  const handleTogglePause = (id: string) => {
    const updated = togglePauseRoadmap(id);
    setRoadmaps(updated);
  };

  const handleArchive = (id: string) => {
    const updated = archiveRoadmap(id);
    setRoadmaps(updated);
  };

  const totalTasksCount = extractedPlan
    ? extractedPlan.milestones.reduce((acc, m) => acc + m.tasks.length, 0)
    : 18;
  const milestonesCount = extractedPlan ? extractedPlan.milestones.length : 3;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all">
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-black text-primary-text dark:text-white">
          {isAutoScheduled ? 'Plan & Schedule Created' : 'New Roadmap'}
        </h1>
        <p className="text-xs text-secondary-text dark:text-gray-400 font-medium">
          {isAutoScheduled
            ? 'Your study timeline is locked and ready for execution'
            : 'Upload the plan ChatGPT or Claude gave you'}
        </p>
      </div>
      {/* Navigation Switcher between Upload and Bookshelf */}
      {!isAutoScheduled && (
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <button
            onClick={() => {
              setActiveTab('upload');
              setExtractedPlan(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-success text-white shadow-soft'
                : 'bg-surface text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            <Plus className="w-4 h-4" /> New Roadmap
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-success text-white shadow-soft'
                : 'bg-surface text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            <BookOpen className="w-4 h-4" /> My Roadmaps ({roadmaps.length})
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTO-SCHEDULE CONFIRMATION SCREEN (Mockup Screen 3)                        */}
      {/* ========================================================================= */}
      {isAutoScheduled && (
        <div className="max-w-md mx-auto space-y-4 pt-2 animate-fade-in">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-text-primary">
              Uploading your ChatGPT plan…
            </h2>
            <p className="text-xs text-text-secondary font-medium">
              Calendar builds itself from the plan
            </p>
          </div>

          {/* File reading badge */}
          <div className="p-5 rounded-2xl bg-surface border border-border text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center mx-auto text-2xl">
              ⚙️
            </div>
            <div className="text-xs font-bold text-text-secondary">
              Reading {uploadedFileName}
            </div>
          </div>

          {/* Detection Checklist Rows (Image 3 reference) */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-success-soft text-success font-black flex items-center justify-center text-xs">
                ✓
              </span>
              <span className="text-sm font-bold text-text-primary">
                {milestonesCount} phases detected
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-success-soft text-success font-black flex items-center justify-center text-xs">
                ✓
              </span>
              <span className="text-sm font-bold text-text-primary">
                {totalTasksCount} tasks scheduled
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-success-soft text-success font-black flex items-center justify-center text-xs">
                ✓
              </span>
              <span className="text-sm font-bold text-text-primary">
                {milestonesCount} milestones dated
              </span>
            </div>
          </div>

          {/* Auto-filled Calendar Callout (Image 3 reference) */}
          <div className="p-4 rounded-2xl bg-success-soft border border-success/25 text-success shadow-xs space-y-1">
            <div className="text-sm font-bold text-success flex items-start gap-2">
              <span className="text-base">📅</span>
              <span>Your calendar has been filled in automatically — nothing to enter by hand.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="w-full min-h-[48px] py-3.5 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View my calendar</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full min-h-[48px] py-3 rounded-2xl bg-surface hover:bg-surface-secondary border border-border text-text-primary font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Go to Today's Mission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: Upload & Ingestion Zone */}
      {activeTab === 'upload' && !extractedPlan && !isAutoScheduled && (
        <div className="space-y-6 pt-2">
          <UploadCard
            onFileSelect={handleFileSelect}
            onTextSubmit={handleTextSubmit}
            state={uploadState}
            errorMessage={errorMsg}
            onResetError={() => {
              setErrorMsg(null);
              setUploadState('idle');
            }}
          />

          {/* Value Props & Reassurance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <Card variant="subtle" className="p-4 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-lavender text-primary flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <Heading as="h4" variant="heading" className="text-sm font-bold text-text-primary">
                AI Curriculum Extraction
              </Heading>
              <Text tone="secondary" variant="body" className="text-xs">
                Extracts phases, weekly milestones, estimated reading minutes, and learning objectives automatically.
              </Text>
            </Card>

            <Card variant="subtle" className="p-4 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-success-soft text-success flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <Heading as="h4" variant="heading" className="text-sm font-bold text-text-primary">
                Strict Knowledge Verification
              </Heading>
              <Text tone="secondary" variant="body" className="text-xs">
                No fake checkbox progress. Every milestone requires answering mentor comprehension questions.
              </Text>
            </Card>

            <Card variant="subtle" className="p-4 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-peach-soft text-peach-text flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <Heading as="h4" variant="heading" className="text-sm font-bold text-text-primary">
                Escalating Reminders
              </Heading>
              <Text tone="secondary" variant="body" className="text-xs">
                Gentle nudges that turn firm if study sessions are delayed, keeping you firmly accountable.
              </Text>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 1 (Preview Mode): Extracted Plan Review & Confirmation */}
      {activeTab === 'upload' && extractedPlan && !isAutoScheduled && (
        <div className="space-y-5 pt-2 max-w-xl mx-auto">
          {/* 1. Parsed File Badge */}
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-success-soft text-success flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-text-primary block break-words leading-snug">
                  {uploadedFileName}
                </span>
                <span className="text-xs text-text-secondary">
                  {extractedPlan.milestones.length} phases identified
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success border border-success/20 flex-shrink-0">
              Parsed
            </span>
          </div>

          {/* 2. "Here's what I found" */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-text-primary">
              Here's what I found
            </h3>

            {extractedPlan.milestones.map((milestone, mIdx) => (
              <div
                key={mIdx}
                className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1"
              >
                <div className="text-xs font-bold text-text-secondary">
                  Phase {mIdx + 1} · {milestone.tasks.length > 2 ? '4 weeks' : '3 weeks'}
                </div>
                <div className="text-base font-black text-text-primary">
                  {milestone.title}
                </div>
              </div>
            ))}
          </div>

          {/* 3. Mentor Cat Dialogue Bubble (Image 3 reference) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-peach-soft/60 border border-peach/25 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-peach/20 flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
              <Mascot pose="encouraging" className="w-full h-full" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                No end date in your plan — how many hours a day can you realistically give this?
              </p>

              {/* Time commitment chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {(['30 min', '1 hour', '2+ hours'] as const).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setDailyCommitment(chip)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer shadow-xs ${
                      dailyCommitment === chip
                        ? 'bg-success text-white shadow-sm'
                        : 'bg-surface text-text-secondary hover:text-text-primary border border-border'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Large Action Button: Build My Daily Plan */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirmAndStart}
              disabled={isSaving}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-success text-white hover:bg-success-hover active:scale-98 font-black text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-peach" />
              <span>{isSaving ? 'Building your schedule...' : 'Build my daily plan'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Bookshelf Roadmap Library */}
      {activeTab === 'library' && !isAutoScheduled && (
        <div className="space-y-6 pt-2">
          {roadmaps.length === 0 ? (
            <Card variant="subtle" className="text-center py-12 space-y-4">
              <Illustration name="empty-roadmaps" className="w-28 h-28 mx-auto" />
              <div className="space-y-1">
                <Heading as="h3" variant="title" className="text-lg font-bold text-text-primary">
                  Your Bookshelf is Waiting
                </Heading>
                <Text tone="secondary" variant="body" className="max-w-md mx-auto text-sm">
                  Upload your first syllabus or roadmap. Each journey lives here on your shelf, so you can
                  pursue multiple goals without fear of losing previous progress.
                </Text>
              </div>
              <Button
                variant="success"
                size="md"
                onClick={() => setActiveTab('upload')}
                icon={<Plus className="w-4 h-4" />}
              >
                Upload First Roadmap
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">
                  {roadmaps.length} Roadmap{roadmaps.length === 1 ? '' : 's'} on Shelf
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('upload');
                    setExtractedPlan(null);
                  }}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Roadmap
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmaps.map((r) => (
                  <RoadmapCard
                    key={r.id}
                    roadmap={r}
                    onSelectActive={handleSelectActive}
                    onResume={handleSelectActive}
                    onTogglePause={handleTogglePause}
                    onArchive={handleArchive}
                    onReset={handleReset}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
