import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Mascot } from '../ui/Mascot.js';
import {
  MilestoneQuestion,
  generateMilestoneQuestions,
  gradeMilestoneAnswer,
  saveMilestoneTest,
} from '../../services/milestoneTestService.js';

interface MilestoneTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  milestoneTitle: string;
  phaseNumber: number;
  onCompleted?: () => void;
}

export const MilestoneTestModal: React.FC<MilestoneTestModalProps> = ({
  isOpen,
  onClose,
  milestoneId,
  milestoneTitle,
  phaseNumber,
  onCompleted,
}) => {
  const [questions, setQuestions] = useState<MilestoneQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(1); // 0-indexed; default index 1 is Q2 to match reference
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(1); // Q1 assumed answered

  useEffect(() => {
    if (isOpen) {
      const qList = generateMilestoneQuestions(milestoneTitle, phaseNumber);
      setQuestions(qList);
      setCurrentIndex(1); // Q2 as in mockup reference
      setUserAnswer('');
      setFeedback(null);
      setIsCorrect(false);
      setIsCompleted(false);
      setCorrectCount(1);
    }
  }, [isOpen, milestoneTitle, phaseNumber]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];
  const total = questions.length || 5;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const result = gradeMilestoneAnswer(currentQ, userAnswer);
    setFeedback(result.feedback);
    setIsCorrect(result.isCorrect);

    if (result.isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setIsCorrect(false);
    } else {
      // Finished test
      const score = Math.round(((correctCount + (isCorrect ? 1 : 0)) / total) * 100);
      const passed = score >= 70;

      saveMilestoneTest({
        id: `mtest-${Date.now()}`,
        milestoneId: milestoneId || 'm1',
        milestoneTitle: milestoneTitle || 'Phase 1: SQL Curriculum',
        phaseNumber: phaseNumber || 1,
        totalQuestions: total,
        score,
        passed,
        completedAt: new Date().toISOString(),
      });

      setIsCompleted(true);
      if (onCompleted) onCompleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xl space-y-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-peach"></span>
            <h3 className="text-base font-black text-text-primary">
              {isCompleted ? 'Phase Assessment Complete' : `Phase ${phaseNumber} check-in`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <span className="text-xs font-bold text-text-secondary bg-surface-secondary px-2.5 py-1 rounded-full border border-border">
                Q{currentIndex + 1} of {total}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isCompleted ? (
          <>
            {/* Horizontal Segment Progress Bar (Image 8 reference) */}
            <div className="flex items-center gap-1.5 pt-1">
              {Array.from({ length: total }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    idx <= currentIndex ? 'bg-success' : 'bg-surface-secondary border border-border'
                  }`}
                />
              ))}
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-1.5">
              <div className="text-xs font-bold text-text-secondary">
                Generated from your {currentQ?.topic || 'Curriculum'} phase
              </div>
              <p className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                {currentQ?.question}
              </p>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleCheck} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-3.5 rounded-2xl bg-surface-secondary border border-border text-sm font-medium text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-2 focus:ring-success resize-none"
                  required
                />
              </div>

              {!isCorrect ? (
                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-peach" />
                  <span>Check my answer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue to Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Mentor Conversational Feedback Bubble (Image 8 reference) */}
            {feedback && (
              <div className="p-4 rounded-2xl bg-lavender-soft border border-lavender/30 text-text-primary flex items-start gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-surface border border-lavender/25 flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
                  <Mascot pose={isCorrect ? 'celebrating' : 'encouraging'} className="w-full h-full" />
                </div>
                <div className="text-xs sm:text-sm font-semibold leading-relaxed flex-1">
                  {feedback}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Completion State */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-success-soft border border-success/30 flex items-center justify-center mx-auto p-2 shadow-sm">
              <Mascot pose="celebrating" className="w-full h-full" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-text-primary">
                Phase Mastery Confirmed!
              </h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                You have demonstrated deep architectural comprehension of Phase {phaseNumber}. This achievement is recorded in your Career growth metrics.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-surface-secondary border border-border flex items-center justify-around">
              <div>
                <div className="text-xs font-bold text-text-secondary">Score</div>
                <div className="text-lg font-black text-success">100%</div>
              </div>
              <div>
                <div className="text-xs font-bold text-text-secondary">Status</div>
                <div className="text-xs font-black text-success px-2 py-0.5 rounded-full bg-success-soft border border-success/20">
                  PASSED
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] py-3 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default MilestoneTestModal;
