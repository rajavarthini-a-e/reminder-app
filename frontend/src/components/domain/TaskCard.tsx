import React from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Check, CheckCircle2, Clock, BookOpen, Code, Award, Flame, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { Task } from '@shared/types';
import clsx from 'clsx';
import { formatScheduledTime } from '../../utils/formatTime.js';

export type TaskCardState = 'upcoming' | 'today' | 'in_progress' | 'awaiting_verification' | 'complete' | 'overdue';

export interface TaskCardProps {
  task: Task;
  onVerify?: (task: Task) => void;
  onClick?: (task: Task) => void;
  onSnooze?: (task: Task, minutes: number) => void;
  state?: TaskCardState;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onVerify,
  onClick,
  onSnooze,
  state: forcedState,
  className = '',
}) => {
  // Determine computed state if not forced
  let computedState: TaskCardState = 'upcoming';
  if (task.completed) {
    computedState = 'complete';
  } else if (task.priority === 'CRITICAL' || (task.activeEscalationLevel && task.activeEscalationLevel >= 2)) {
    computedState = 'overdue';
  } else if (task.scheduledTime) {
    computedState = 'today';
  }

  const currentState = forcedState || computedState;
  const isComplete = currentState === 'complete';
  const isOverdue = currentState === 'overdue';

  const stateBadges: Record<TaskCardState, { variant: 'completed' | 'pending' | 'critical' | 'upcoming' | 'neutral' | 'today'; label: string }> = {
    complete: { variant: 'completed', label: 'Verified' },
    overdue: { variant: 'critical', label: 'Overdue' },
    awaiting_verification: { variant: 'pending', label: 'Needs Proof' },
    in_progress: { variant: 'today', label: 'In Progress' },
    today: { variant: 'today', label: 'Due Today' },
    upcoming: { variant: 'upcoming', label: 'Scheduled' },
  };

  const badgeInfo = stateBadges[currentState];

  // Principle B: Subject / Task-type appropriate icon avatar
  const getSubjectAvatar = () => {
    const titleLower = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (titleLower.includes('read') || titleLower.includes('book') || titleLower.includes('chapter') || titleLower.includes('theory')) {
      return { icon: BookOpen, bg: 'bg-peach-soft text-peach border border-peach/20' };
    }
    if (titleLower.includes('code') || titleLower.includes('build') || titleLower.includes('sql') || titleLower.includes('dashboard') || titleLower.includes('project') || titleLower.includes('capstone')) {
      return { icon: Code, bg: 'bg-success-soft text-success border border-success/20' };
    }
    if (titleLower.includes('exam') || titleLower.includes('review') || titleLower.includes('milestone') || titleLower.includes('quiz')) {
      return { icon: Award, bg: 'bg-lavender text-primary border border-primary/20' };
    }
    if (task.priority === 'CRITICAL' || isOverdue) {
      return { icon: Flame, bg: 'bg-danger-soft text-danger border border-danger/20' };
    }
    return { icon: Sparkles, bg: 'bg-success-soft text-success border border-success/20' };
  };

  const avatar = getSubjectAvatar();
  const AvatarIcon = avatar.icon;

  return (
    <div
      onClick={() => onClick && onClick(task)}
      className={clsx(
        'group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3.5 sm:gap-4 select-none',
        isComplete
          ? 'bg-surface-secondary/70 border-border/70 opacity-85'
          : isOverdue
          ? 'bg-surface border-l-4 border-l-danger border-border shadow-card hover:shadow-hover'
          : 'bg-surface border-l-4 border-l-success border-border shadow-soft hover:shadow-card hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* 1. Left: Small Colored Icon Avatar */}
      <div className={clsx('w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform group-hover:scale-105', avatar.bg)}>
        <AvatarIcon className="w-6 h-6 stroke-[2]" />
      </div>

      {/* 2. Middle: Task Title in Strong Type + Metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant={badgeInfo.variant} dot size="sm">
            {badgeInfo.label}
          </Badge>
          {task.scheduledTime && (
            <span className="flex items-center gap-1 text-xs text-secondary-text font-semibold">
              <Clock className="w-3 h-3" />
              {formatScheduledTime(task.scheduledTime)}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-xs text-secondary-text font-medium">
              • {task.estimatedMinutes}m
            </span>
          )}
        </div>

        <h4
          className={clsx(
            'text-base sm:text-lg font-black text-primary-text leading-snug tracking-tight truncate',
            isComplete && 'line-through text-secondary-text font-semibold'
          )}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs sm:text-sm text-secondary-text line-clamp-1 mt-0.5 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* 3. Right: Chunky Satisfying Checkmark / Verification Control (48px Min) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isComplete && onVerify) {
              onVerify(task);
            }
          }}
          disabled={isComplete}
          aria-label={isComplete ? `Task ${task.title} completed` : `Verify and complete ${task.title}`}
          title={isComplete ? 'Task verified' : 'Click to submit proof of work and verify completion'}
          className={clsx(
            'w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all duration-200 select-none flex-shrink-0',
            isComplete
              ? 'bg-success text-white shadow-xs cursor-default'
              : isOverdue
              ? 'bg-surface border-2 border-danger text-danger hover:bg-danger-soft active:scale-95 shadow-xs cursor-pointer'
              : 'bg-surface border-2 border-border hover:border-success text-transparent hover:text-success active:scale-95 shadow-xs cursor-pointer'
          )}
        >
          {isComplete ? (
            <Check className="w-6 h-6 stroke-[3]" />
          ) : (
            <Check className="w-5 h-5 stroke-[2] opacity-0 hover:opacity-100 transition-opacity" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
