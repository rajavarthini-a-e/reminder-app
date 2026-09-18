import React from 'react';
import { Check, Clock, AlertCircle, Circle } from 'lucide-react';
import { Badge } from '../ui/Badge.js';
import { Heading, Text } from '../ui/Typography.js';
import { Button } from '../ui/Button.js';
import clsx from 'clsx';

export type TimelineItemStatus = 'completed' | 'current' | 'upcoming' | 'overdue';

export interface TimelineItem {
  id: string;
  title: string;
  time?: string;
  status: TimelineItemStatus;
  description?: string;
  taskRef?: any;
}

export interface TimelineProps {
  items: TimelineItem[];
  onVerifyItem?: (item: TimelineItem) => void;
  onSelectItem?: (item: TimelineItem) => void;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  onVerifyItem,
  onSelectItem,
  className = '',
}) => {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-secondary-text text-sm">
        No scheduled timeline items.
      </div>
    );
  }

  const getStatusIcon = (status: TimelineItemStatus) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center shadow-subtle flex-shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        );
      case 'current':
        return (
          <div className="w-6 h-6 rounded-full bg-surface border-2 border-success text-success flex items-center justify-center shadow-subtle flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
          </div>
        );
      case 'overdue':
        return (
          <div className="w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center shadow-subtle flex-shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'upcoming':
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-surface-secondary border border-border text-secondary-text flex items-center justify-center flex-shrink-0">
            <Circle className="w-2 h-2 fill-secondary-text text-secondary-text" />
          </div>
        );
    }
  };

  return (
    <div className={clsx('relative space-y-6', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isCurrent = item.status === 'current';
        const isCompleted = item.status === 'completed';
        const isOverdue = item.status === 'overdue';

        return (
          <div
            key={item.id}
            className="relative flex items-start gap-4 group"
            onClick={() => onSelectItem && onSelectItem(item)}
          >
            {/* Connective Spine */}
            {!isLast && (
              <span
                className="absolute left-3 top-6 bottom-[-24px] w-0.5 bg-border dark:bg-surface-darkBorder transition-colors"
                aria-hidden="true"
              />
            )}

            {/* Node Icon */}
            <div className="z-10 relative mt-0.5">{getStatusIcon(item.status)}</div>

            {/* Item Content Card */}
            <div
              className={clsx(
                'flex-1 p-3.5 sm:p-4 rounded-2xl transition-all duration-150',
                isCurrent
                  ? 'bg-success-soft/60 dark:bg-surface-darkCard border border-success/30 shadow-subtle'
                  : isOverdue
                  ? 'bg-danger-soft/60 dark:bg-surface-darkCard border border-danger/30 shadow-subtle'
                  : 'bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder hover:bg-surface-secondary/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {item.time && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-secondary-text">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    )}
                    {isCurrent && (
                      <Badge variant="pending" size="sm">
                        In Progress
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="completed" size="sm">
                        Done
                      </Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="critical" size="sm">
                        Overdue
                      </Badge>
                    )}
                  </div>

                  <Heading
                    variant="heading"
                    tone={isCompleted ? 'secondary' : 'primary'}
                    className={clsx('truncate', isCompleted && 'line-through')}
                  >
                    {item.title}
                  </Heading>

                  {item.description && (
                    <Text variant="caption" tone="secondary" className="line-clamp-1 mt-0.5">
                      {item.description}
                    </Text>
                  )}
                </div>

                {/* Optional Verify Button */}
                {!isCompleted && onVerifyItem && (
                  <Button
                    variant={isOverdue ? 'danger' : 'success'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerifyItem(item);
                    }}
                  >
                    Verify
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
