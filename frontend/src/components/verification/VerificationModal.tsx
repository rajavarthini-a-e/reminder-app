import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Send,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Code2,
  BookOpen,
  Dumbbell,
  GraduationCap,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { submitVerification } from '../../services/api.js';
import { soundService } from '../../services/sound.service.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { colors } from '../../design-system/colors.js';
import clsx from 'clsx';

export const VerificationModal: React.FC = () => {
  const {
    isVerificationModalOpen,
    closeVerification,
    verifyingTask,
    verificationQuestion,
    verificationId,
    loadDashboard,
  } = useAppStore();

  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    feedback: string;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isVerificationModalOpen || !verifyingTask) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setErrorMsg('Please formulate your explanation or paste your proof.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitVerification(
        verifyingTask.id,
        answer,
        verificationQuestion,
        verificationId || undefined
      );

      setResult(res);

      if (res.passed) {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.65 },
          colors: [colors.primary, colors.success, colors.warning],
        });
        soundService.playVictory();
        await loadDashboard();
      } else {
        soundService.playStrictAlert();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoneClosing = () => {
    setResult(null);
    setAnswer('');
    closeVerification();
  };

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'CODING':
        return <Code2 className="w-5 h-5 text-primary" />;
      case 'READING':
        return <BookOpen className="w-5 h-5 text-warning" />;
      case 'WORKOUT':
        return <Dumbbell className="w-5 h-5 text-danger" />;
      case 'LEARNING':
      default:
        return <GraduationCap className="w-5 h-5 text-success" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary-text/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-surface dark:bg-surface-dark rounded-t-card sm:rounded-card border border-border dark:border-surface-darkBorder shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-border dark:border-surface-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-success-soft text-success flex items-center justify-center shadow-subtle">
              {getVerificationIcon(verifyingTask.verificationType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="completed">Verification Challenge</Badge>
                <span className="text-caption text-secondary-text">Step 1 of 1</span>
              </div>
              <h3 className="text-h3 font-bold text-primary-text dark:text-white mt-0.5">
                {verifyingTask.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDoneClosing}
            className="p-2 rounded-2xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary dark:hover:bg-surface-darkCard transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-caption text-secondary-text">
            Great work reaching this point. Let's verify today's learning before locking in completion.
          </div>

          {/* Question Callout */}
          <div className="p-4 rounded-2xl bg-surface-secondary dark:bg-surface-darkCard border border-border dark:border-surface-darkBorder">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mentor Challenge Question</span>
            </div>
            <p className="text-sm font-semibold text-primary-text dark:text-gray-100 leading-relaxed">
              {verificationQuestion || 'Loading your challenge question...'}
            </p>
          </div>

          {/* Result Banner */}
          {result && (
            <div
              className={clsx(
                'p-4 rounded-2xl border transition-all',
                result.passed
                  ? 'bg-success-soft/70 border-success/40 text-primary-text dark:text-white'
                  : 'bg-danger-soft border-danger/40 text-primary-text dark:text-white'
              )}
            >
              <div className="flex items-start gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm">
                      {result.passed ? 'Mastery Verified!' : 'Revision Needed'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-surface dark:bg-surface-darkCard shadow-subtle">
                      Score: {result.score}/100
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed text-secondary-text dark:text-gray-300">
                    {result.feedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          {!result?.passed && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-text mb-1.5">
                  {verifyingTask.verificationType === 'CODING'
                    ? 'Paste your query or code snippet & brief explanation:'
                    : verifyingTask.verificationType === 'READING'
                    ? 'Provide your 3 concrete takeaways:'
                    : verifyingTask.verificationType === 'WORKOUT'
                    ? 'Report your exercises, sets, reps, and duration:'
                    : 'Explain the core concept in your own words:'}
                </label>
                <textarea
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Explain with precision. The mentor checks for genuine comprehension rather than one-word shortcuts..."
                  className="w-full p-4 rounded-2xl bg-surface-secondary dark:bg-surface-darkCard/50 border border-border dark:border-surface-darkBorder focus:border-primary focus:ring-1 focus:ring-primary text-sm text-primary-text dark:text-white placeholder:text-secondary-text/70 outline-none transition-colors resize-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-secondary-text">
                  Proof is evaluated to preserve your discipline score.
                </span>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Evaluating...' : 'Submit Proof'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer when passed */}
        {result?.passed && (
          <div className="p-4 border-t border-border dark:border-surface-darkBorder bg-surface-secondary dark:bg-surface-darkCard flex justify-end pb-safe">
            <Button
              variant="success"
              size="md"
              onClick={handleDoneClosing}
            >
              Continue Today's Journey
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
