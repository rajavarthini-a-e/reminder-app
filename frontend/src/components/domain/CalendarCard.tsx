import React from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Heading, Text } from '../ui/Typography.js';
import { Button } from '../ui/Button.js';
import { Task } from '@shared/types';
import { CheckCircle2, Clock, CalendarDays, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { formatScheduledTime } from '../../utils/formatTime.js';

export type DayState = 'completed' | 'partial' | 'upcoming' | 'today' | 'overdue' | 'rest';

export interface CalendarDayCellProps {
  dayNumber: number;
  state: DayState;
  isSelected?: boolean;
  isCurrentMonth?: boolean;
  taskCount?: number;
  completedCount?: number;
  onClick?: () => void;
  className?: string;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  dayNumber,
  state,
  isSelected = false,
  isCurrentMonth = true,
  taskCount = 0,
  completedCount = 0,
  onClick,
  className = '',
}) => {
  const stateStyles: Record<DayState, { ring: string; badge: string; dot: string }> = {
    completed: {
      ring: 'bg-success-soft text-success border border-success/30 font-bold',
      badge: 'bg-success',
      dot: 'bg-success',
    },
    today: {
      ring: 'bg-surface border-2 border-primary text-primary font-extrabold shadow-subtle',
      badge: 'bg-primary',
      dot: 'bg-primary',
    },
    partial: {
      ring: 'bg-warning-soft text-warning border border-warning/30 font-semibold',
      badge: 'bg-warning',
      dot: 'bg-warning',
    },
    overdue: {
      ring: 'bg-danger-soft text-danger border border-danger/30 font-bold',
      badge: 'bg-danger',
      dot: 'bg-danger',
    },
    upcoming: {
      ring: 'bg-surface text-primary-text hover:bg-surface-secondary border border-border font-medium',
      badge: 'bg-secondary-text',
      dot: 'bg-secondary-text',
    },
    rest: {
      ring: 'bg-surface text-disabled font-normal',
      badge: 'bg-disabled',
      dot: 'bg-disabled',
    },
  };

  const current = stateStyles[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isCurrentMonth}
      className={clsx(
        'h-12 sm:h-14 w-full rounded-2xl flex flex-col items-center justify-center relative p-1 transition-all duration-150 select-none outline-none cursor-pointer',
        !isCurrentMonth && 'opacity-20 cursor-default',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-app shadow-hover',
        current.ring,
        className
      )}
    >
      <span className="text-xs sm:text-sm font-bold tabular-nums">
        {dayNumber}
      </span>

      {/* Task indicators */}
      {taskCount > 0 && isCurrentMonth && (
        <div className="flex items-center gap-0.5 mt-0.5">
          <span className={clsx('w-1.5 h-1.5 rounded-full', current.dot)} />
          {taskCount > 1 && (
            <span className="text-[9px] text-secondary-text font-bold leading-none">
              {completedCount}/{taskCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export interface CalendarDaySummaryProps {
  dateLabel: string;
  tasks: Task[];
  onVerifyTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
  className?: string;
}

export const CalendarDaySummary: React.FC<CalendarDaySummaryProps> = ({
  dateLabel,
  tasks,
  onVerifyTask,
  onSelectTask,
  className = '',
}) => {
  return (
    <Card variant="default" className={clsx('p-5 sm:p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <Heading variant="heading" tone="primary">
            {dateLabel}
          </Heading>
        </div>
        <Badge variant={tasks.length > 0 ? 'pending' : 'neutral'}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center text-secondary-text text-sm">
          No tasks scheduled for this day. Rest and recover!
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask && onSelectTask(task)}
              className="p-3.5 rounded-2xl bg-surface-secondary dark:bg-surface-darkCard border border-border flex items-center justify-between gap-3 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {task.scheduledTime && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-secondary-text">
                      <Clock className="w-3 h-3" />
                      {formatScheduledTime(task.scheduledTime)}
                    </span>
                  )}
                  {task.completed ? (
                    <Badge variant="completed" size="sm">
                      Done
                    </Badge>
                  ) : task.priority === 'CRITICAL' ? (
                    <Badge variant="critical" size="sm">
                      Critical
                    </Badge>
                  ) : null}
                </div>
                <p
                  className={clsx(
                    'text-xs sm:text-sm font-bold truncate text-primary-text dark:text-gray-100',
                    task.completed && 'line-through text-secondary-text'
                  )}
                >
                  {task.title}
                </p>
              </div>

              {!task.completed && onVerifyTask && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerifyTask(task);
                  }}
                  icon={<ShieldCheck className="w-3.5 h-3.5" />}
                >
                  Verify
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default { CalendarDayCell, CalendarDaySummary };
