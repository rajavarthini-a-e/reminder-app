import React, { useState } from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Heading, Text } from '../ui/Typography.js';
import { Button } from '../ui/Button.js';
import { Task, Milestone } from '@shared/types';
import { CheckCircle2, Lock, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export type MilestoneCardState = 'locked' | 'active' | 'achieved';

export interface MilestoneCardProps {
  milestone: Milestone;
  onVerifyTask?: (task: Task) => void;
  className?: string;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onVerifyTask,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tasks = milestone.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const isAchieved = milestone.completed || (tasks.length > 0 && completedTasks === tasks.length);
  const isLocked = !milestone.completed && tasks.length === 0;
  const isActive = !isAchieved && !isLocked;

  return (
    <Card
      variant={isAchieved ? 'subtle' : isActive ? 'default' : 'subtle'}
      className={clsx(
        'transition-all duration-200',
        isActive && 'border-l-4 border-l-success',
        isAchieved && 'border-l-4 border-l-forest',
        isLocked && 'opacity-60',
        className
      )}
    >
      <div
        className="flex items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left: Milestone Identity */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={clsx(
              'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-subtle',
              isAchieved
                ? 'bg-success text-white'
                : isActive
                ? 'bg-success-soft text-success border border-success/30'
                : 'bg-surface-secondary text-disabled border border-border'
            )}
          >
            {isAchieved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              <span className="text-sm font-bold">{milestone.order}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-text">
                Milestone {milestone.order}
              </span>
              {isAchieved ? (
                <Badge variant="completed" size="sm">
                  Earned Checkpoint
                </Badge>
              ) : isActive ? (
                <Badge variant="pending" size="sm">
                  Active Sprint
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  Scheduled
                </Badge>
              )}
            </div>

            <Heading variant="heading" tone="primary" className="truncate">
              {milestone.title}
            </Heading>
          </div>
        </div>

        {/* Right: Progress & Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {tasks.length > 0 && (
            <span className="text-xs font-bold text-secondary-text tabular-nums">
              {completedTasks} / {tasks.length} Verified
            </span>
          )}
          <button
            type="button"
            className="p-1 text-secondary-text hover:text-primary-text transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Task Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-2.5">
          {tasks.length === 0 ? (
            <p className="text-xs text-secondary-text py-2">No tasks listed for this milestone.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-surface-secondary dark:bg-surface-darkCard flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <CheckCircle2
                    className={clsx(
                      'w-4 h-4 flex-shrink-0',
                      task.completed ? 'text-success' : 'text-disabled'
                    )}
                  />
                  <span
                    className={clsx(
                      'font-medium truncate',
                      task.completed && 'line-through text-secondary-text'
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                {!task.completed && onVerifyTask && !isLocked && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerifyTask(task);
                    }}
                    icon={<ShieldCheck className="w-3 h-3" />}
                  >
                    Verify
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default MilestoneCard;
