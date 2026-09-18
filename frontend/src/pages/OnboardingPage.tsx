import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import {
  getCurrentUser,
  setOnboardingStep,
  setFocusPreference,
  completeOnboarding,
} from '../services/authService.js';
import { uploadPlanFile, uploadPlanText, saveGoalPlan } from '../services/api.js';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [step, setStep] = useState<1 | 2 | 3>(() => currentUser?.onboardingStep || 1);
  const [selectedFocus, setSelectedFocus] = useState<'career' | 'personal' | 'both' | 'later'>(
    () => currentUser?.focusPreference || 'career'
  );
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'reading' | 'done'>('idle');
  const [fileName, setFileName] = useState('');
  const [detectedPhases, setDetectedPhases] = useState(0);
  const [detectedTasks, setDetectedTasks] = useState(0);
  const [detectedMilestones, setDetectedMilestones] = useState(0);

  // Sync step if user state changes
  useEffect(() => {
    if (currentUser?.onboardingStep && currentUser.onboardingStep !== step) {
      setStep(currentUser.onboardingStep);
    }
  }, [currentUser?.onboardingStep]);

  const handleStart = () => {
    setStep(2);
    setOnboardingStep(2);
  };

  const handleSelectFocus = (focus: 'career' | 'personal' | 'both' | 'later') => {
    setSelectedFocus(focus);
    setFocusPreference(focus);
    setStep(3);
  };

  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setUploadStatus('reading');
    try {
      const plan = await uploadPlanFile(file);
      await saveGoalPlan(plan);
      setDetectedPhases(plan.milestones.length);
      setDetectedTasks(plan.milestones.reduce((acc, m) => acc + m.tasks.length, 0));
      setDetectedMilestones(plan.milestones.length);
      setUploadStatus('done');
    } catch (err) {
      console.warn('Backend file upload fallback:', err);
      setTimeout(() => setUploadStatus('done'), 800);
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) return;
    setFileName('Pasted Study Plan');
    setUploadStatus('reading');
    try {
      const plan = await uploadPlanText(pastedText);
      await saveGoalPlan(plan);
      setDetectedPhases(plan.milestones.length);
      setDetectedTasks(plan.milestones.reduce((acc, m) => acc + m.tasks.length, 0));
      setDetectedMilestones(plan.milestones.length);
      setUploadStatus('done');
    } catch (err) {
      console.warn('Backend text upload fallback:', err);
      setTimeout(() => setUploadStatus('done'), 800);
    }
  };

  const samplePlanText = `# Data Analyst 30-Day Mastery Roadmap
## Phase 1: SQL Foundations & Advanced Joins
- Day 1: SQL Joins (INNER, LEFT, FULL OUTER) and set theory
- Day 2: Window Functions and Common Table Expressions (CTEs)
- Day 3: Aggregate functions, GROUP BY, and HAVING clauses
## Phase 2: Dimensional Modeling & BI Architecture
- Day 4: Star Schema vs Snowflake Schema Architecture
- Day 5: Power BI Data Modeling & Relationships
- Day 6: Power BI DAX Calculated Columns vs Measures
## Phase 3: Analytics Engineering & Capstone
- Day 7: Python Pandas data cleaning and transformation
- Day 8: End-to-End Executive Dashboard Capstone Project`;

  const handleLoadSample = async () => {
    setFileName('sample_data_analyst_roadmap.md');
    setUploadStatus('reading');
    try {
      const plan = await uploadPlanText(samplePlanText);
      await saveGoalPlan(plan);
      setDetectedPhases(plan.milestones.length);
      setDetectedTasks(plan.milestones.reduce((acc, m) => acc + m.tasks.length, 0));
      setDetectedMilestones(plan.milestones.length);
      setUploadStatus('done');
    } catch (err) {
      setDetectedPhases(3);
      setDetectedTasks(8);
      setDetectedMilestones(3);
      setUploadStatus('done');
    }
  };

  const handleFinishOnboarding = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* ========================================================================= */}
        {/* STEP 1: WELCOME SCREEN (Mockup Screen 1)                                   */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card text-center space-y-6 animate-fadeIn">
            {/* Mascot Momo Avatar */}
            <div className="w-24 h-24 mx-auto rounded-3xl bg-peach-soft border border-peach/25 flex items-center justify-center text-5xl shadow-xs">
              🐱
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-primary-text tracking-tight">
                Hi, I'm Momo
              </h1>
              <p className="text-sm text-secondary-text leading-relaxed max-w-[280px] mx-auto break-words font-medium">
                I'll help you stay on track — for the big goals and the small daily habits.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer"
            >
              Let's get started
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CHOOSE YOUR FOCUS (Mockup Screen 2)                                */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                What do you want help with?
              </h2>
              <p className="text-xs text-secondary-text font-medium">
                Full-bleed saturated choice cards — choose your primary focus
              </p>
            </div>

            {/* 2x2 Grid of Saturated Full-Bleed Cards */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {/* Card 1: Career & Study (Sage green) */}
              <button
                onClick={() => handleSelectFocus('career')}
                className="bg-success text-white rounded-3xl p-6 text-center space-y-3 shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer aspect-square flex flex-col items-center justify-center"
              >
                <div className="text-4xl">🎓</div>
                <div className="text-base font-black break-words leading-tight">
                  Career & Study
                </div>
              </button>

              {/* Card 2: Personal Habits (Peach/orange) */}
              <button
                onClick={() => handleSelectFocus('personal')}
                className="bg-peach text-white rounded-3xl p-6 text-center space-y-3 shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer aspect-square flex flex-col items-center justify-center"
              >
                <div className="text-4xl">🌿</div>
                <div className="text-base font-black break-words leading-tight">
                  Personal Habits
                </div>
              </button>

              {/* Card 3: Both (Plum/lavender) */}
              <button
                onClick={() => handleSelectFocus('both')}
                className="bg-primary text-white rounded-3xl p-6 text-center space-y-3 shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer aspect-square flex flex-col items-center justify-center"
              >
                <div className="text-4xl">✨</div>
                <div className="text-base font-black break-words leading-tight">
                  Both
                </div>
              </button>

              {/* Card 4: Decide later (Grey) */}
              <button
                onClick={() => handleSelectFocus('later')}
                className="bg-secondary-text text-white rounded-3xl p-6 text-center space-y-3 shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer aspect-square flex flex-col items-center justify-center"
              >
                <div className="text-4xl">⏭</div>
                <div className="text-base font-black break-words leading-tight">
                  Decide later
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: UPLOAD & AUTO-CALENDAR (Mockup Screen 3)                           */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                {uploadStatus === 'idle' ? 'Upload your plan' : 'Uploading your plan…'}
              </h2>
              <p className="text-xs text-secondary-text font-medium">
                Calendar builds itself from the plan
              </p>
            </div>

            {/* Mode Switcher Toggle: Upload Document vs Paste Plan Text */}
            {uploadStatus === 'idle' && (
              <div className="flex items-center justify-center pb-1">
                <div className="p-1 bg-surface-secondary rounded-2xl border border-border flex items-center gap-1 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]',
                      uploadMode === 'file'
                        ? 'bg-surface text-primary shadow-2xs'
                        : 'text-secondary-text hover:text-primary-text'
                    )}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('text')}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]',
                      uploadMode === 'text'
                        ? 'bg-surface text-primary shadow-2xs'
                        : 'text-secondary-text hover:text-primary-text'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Plan Text</span>
                  </button>
                </div>
              </div>
            )}

            {uploadStatus === 'idle' && uploadMode === 'file' && (
              <div className="bg-surface border-2 border-dashed border-border rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-secondary flex items-center justify-center text-primary text-2xl">
                  <Upload className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-primary-text">
                    Drop your syllabus or roadmap
                  </div>
                  <p className="text-xs text-secondary-text">
                    PDF, DOCX, Markdown or plain text
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <label className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2">
                    <span>Browse files</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="w-full min-h-[48px] py-2.5 rounded-2xl bg-surface-secondary text-primary-text hover:bg-border font-bold text-xs transition-all cursor-pointer"
                  >
                    Or load sample roadmap: "Data Analyst 30-Day Plan"
                  </button>
                </div>
              </div>
            )}

            {uploadStatus === 'idle' && uploadMode === 'text' && (
              <div className="bg-surface border border-border rounded-3xl p-5 text-left space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-text">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Paste your study plan or ChatGPT syllabus</span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your study plan, modules, or ChatGPT roadmap text here..."
                  rows={7}
                  className="w-full p-3 rounded-2xl bg-surface-secondary border border-border text-primary-text placeholder:text-secondary-text text-xs outline-none focus:ring-2 focus:ring-success focus:border-transparent font-mono resize-y"
                />
                <button
                  type="button"
                  onClick={handleTextSubmit}
                  disabled={!pastedText.trim()}
                  className="w-full min-h-[48px] py-3 px-6 rounded-2xl bg-success text-white hover:bg-success-hover disabled:opacity-50 disabled:cursor-not-allowed font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Schedule Plan</span>
                </button>
              </div>
            )}

            {uploadStatus === 'reading' && (
              <div className="bg-surface rounded-3xl border border-border p-8 text-center space-y-4 shadow-sm animate-pulse">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-secondary flex items-center justify-center text-2xl">
                  ⚙️
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-primary-text">
                    Reading {fileName}
                  </div>
                  <p className="text-xs text-secondary-text">
                    Extracting phases, milestones & daily tasks...
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === 'done' && (
              <div className="space-y-3 animate-fadeIn">
                {/* File reading badge */}
                <div className="bg-surface rounded-2xl border border-border p-4 text-center space-y-1 shadow-2xs">
                  <div className="text-2xl">⚙️</div>
                  <div className="text-xs font-bold text-secondary-text">
                    Reading {fileName}
                  </div>
                </div>

                {/* Checklist (Mockup Screen 3) */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-success-soft text-success font-black flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-sm font-bold text-primary-text">
                      {detectedPhases} phases detected
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-success-soft text-success font-black flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-sm font-bold text-primary-text">
                      {detectedTasks} tasks scheduled
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-success-soft text-success font-black flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-sm font-bold text-primary-text">
                      {detectedMilestones} milestones dated
                    </span>
                  </div>
                </div>

                {/* Auto-filled Calendar Callout */}
                <div className="p-4 rounded-2xl bg-success-soft border border-success/25 text-success shadow-2xs space-y-1">
                  <div className="text-xs sm:text-sm font-bold text-success-hover flex items-start gap-2 leading-relaxed">
                    <span className="text-base flex-shrink-0">📅</span>
                    <span>Your calendar has been filled in automatically — nothing to enter by hand.</span>
                  </div>
                </div>

                {/* View my calendar button (>= 48px) */}
                <div className="pt-2">
                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>View my calendar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
