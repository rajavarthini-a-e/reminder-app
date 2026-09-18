import React from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Heading, Text } from '../ui/Typography.js';
import { Mascot } from '../ui/Mascot.js';
import { CheckCircle2, Clock, Play, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Task } from '@shared/types';
import { formatScheduledTime } from '../../utils/formatTime.js';
import clsx from 'clsx';

export type HeroCardVariant = 'mission' | 'celebration' | 'at-risk' | 'all-clear' | 'empty';

export interface HeroCardProps {
  variant?: HeroCardVariant;
  task?: Task | null;
  onVerify?: (task: Task) => void;
  onStart?: (task: Task) => void;
  onSnooze?: (task: Task, minutes: number) => void;
  onUploadPlan?: () => void;
  onOpenChat?: () => void;
  mentorTip?: string;
  className?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  variant = 'mission',
  task,
  onVerify,
  onStart,
  onSnooze,
  onUploadPlan,
  onOpenChat,
  mentorTip,
  className = '',
}) => {
  // 1. Empty State: No plan loaded
  if (variant === 'empty' || (!task && variant === 'mission')) {
    return (
      <div className={clsx('relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-surface border border-border shadow-card', className)}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-4 text-left">
            <Badge variant="upcoming" dot>
              Welcome to MentorAI
            </Badge>
            <Heading variant="titleLg" tone="primary" className="text-2xl sm:text-3xl font-black">
              Ready to begin your journey?
            </Heading>
            <Text variant="body" tone="secondary" className="max-w-md text-sm sm:text-base leading-relaxed">
              Upload your study syllabus, certification plan, or project roadmap. Your AI Mentor will convert it into actionable daily missions.
            </Text>
            <div className="pt-2">
              <Button
                variant="success"
                size="lg"
                onClick={onUploadPlan}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="min-h-[48px] px-6 text-base font-bold shadow-sm"
              >
                Upload Your Roadmap
              </Button>
            </div>
          </div>
          <div className="w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 flex items-center justify-center">
            <Mascot pose="encouraging" className="w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Celebration State: Today's missions completed
  if (variant === 'celebration' || (task && task.completed)) {
    return (
      <div className={clsx('relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-success text-white shadow-card border border-success-hover/30', className)}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/25 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-peach" />
                Daily Mission Complete
              </span>
              <span className="text-xs font-semibold text-white/90">
                Verified Discipline
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Outstanding work today!
            </h2>
            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
              You verified your deliverables and held yourself strictly accountable. Rest, let concepts consolidate, and return tomorrow ready to continue.
            </p>
            {task && (
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 inline-flex items-center gap-2 text-xs font-medium text-white">
                <ShieldCheck className="w-4 h-4 text-peach flex-shrink-0" />
                <span className="truncate max-w-xs">{task.title}</span>
              </div>
            )}
          </div>
          <div className="w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 flex items-center justify-center">
            <Mascot pose="celebrating" className="w-full h-full drop-shadow-md" />
          </div>
        </div>
      </div>
    );
  }

  // 3. All Clear State: Plan active, nothing due today
  if (variant === 'all-clear') {
    return (
      <div className={clsx('relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-surface-secondary border border-border shadow-card', className)}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <Badge variant="completed" dot>
              All Caught Up
            </Badge>
            <Heading variant="titleLg" tone="primary" className="text-2xl font-black">
              No tasks pending for today.
            </Heading>
            <Text variant="body" tone="secondary" className="max-w-md text-sm leading-relaxed">
              You are on schedule with your roadmap. Feel free to review upcoming milestones or ask your mentor for a deep-dive challenge.
            </Text>
            {onOpenChat && (
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onOpenChat}
                  className="min-h-[48px] px-5 font-bold"
                >
                  Consult Mentor
                </Button>
              </div>
            )}
          </div>
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
            <Mascot pose="sleepy" className="w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  // 4. Active Mission State: Saturated Color-Blocked Sage Treatment
  const isCritical = variant === 'at-risk' || task?.priority === 'CRITICAL';

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-card transition-all duration-200',
        isCritical
          ? 'bg-danger text-white border border-danger-hover/30'
          : 'bg-success text-white border border-success-hover/30',
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 space-y-3.5">
          {/* Header Tag Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border flex items-center gap-1.5',
                isCritical
                  ? 'bg-white/25 text-white border-white/30'
                  : 'bg-white/20 text-white border-white/25'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-peach animate-pulse" />
              {isCritical ? 'Critical Priority Mission' : "Today's Mission"}
            </span>

            {task?.scheduledTime && (
              <span className="flex items-center gap-1 text-xs font-semibold text-white/90">
                <Clock className="w-3.5 h-3.5" />
                {formatScheduledTime(task.scheduledTime)}
              </span>
            )}
            {task?.estimatedMinutes && (
              <span className="text-xs text-white/80 font-medium">
                • {task.estimatedMinutes} mins
              </span>
            )}
          </div>

          {/* Task Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight">
            {task?.title || "Daily Mission"}
          </h2>

          {/* Task Description */}
          {task?.description && (
            <p className="text-sm sm:text-base text-white/90 line-clamp-2 max-w-xl leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Mentor Guidance Note */}
          <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-start gap-2.5 max-w-xl">
            <Sparkles className="w-4 h-4 text-peach flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/95">
              <strong className="font-bold text-white block">Coach's Direction:</strong>
              {mentorTip || "Complete this core topic today to stay on track with your milestone."}
            </div>
          </div>

          {/* Action CTAs (Strict 48px Touch Targets) */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {task && (
              <button
                type="button"
                onClick={() => (onStart ? onStart(task) : onVerify?.(task))}
                className="min-h-[48px] min-w-[170px] px-6 py-2.5 rounded-2xl bg-white text-success hover:bg-cream active:scale-98 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-success text-success" />
                <span>Start focus session</span>
              </button>
            )}

            {task && onVerify && (
              <button
                type="button"
                onClick={() => onVerify(task)}
                className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-98 text-white border border-white/25 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Verify Done</span>
              </button>
            )}

            {task && onSnooze && (
              <button
                type="button"
                onClick={() => onSnooze(task, 30)}
                className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-transparent hover:bg-white/10 active:scale-98 text-white/90 border border-white/25 font-medium text-sm transition-all flex items-center justify-center cursor-pointer"
              >
                Snooze 30m
              </button>
            )}
          </div>
        </div>

        {/* Cat Mascot Presence */}
        <div className="hidden sm:flex w-36 h-36 lg:w-44 lg:h-44 flex-shrink-0 items-center justify-center">
          <Mascot
            pose={isCritical ? 'concerned' : 'idle'}
            className="w-full h-full drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
