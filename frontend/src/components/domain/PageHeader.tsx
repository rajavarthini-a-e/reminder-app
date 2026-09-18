import React from 'react';
import { Heading, Text } from '../ui/Typography.js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';
import clsx from 'clsx';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  backTo?: string;
  streak?: number;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  backTo,
  streak,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {backTo && (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            aria-label="Go back"
            className="p-2.5 rounded-2xl bg-surface border border-border text-secondary-text hover:text-primary-text hover:bg-surface-secondary shadow-subtle transition-colors flex-shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            {typeof title === 'string' ? (
              <Heading variant="titleLg" tone="primary" className="truncate">
                {title}
              </Heading>
            ) : (
              title
            )}

            {streak !== undefined && streak > 0 && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-soft text-primary-text text-xs font-bold border border-warning/40 shadow-subtle">
                <Flame className="w-3.5 h-3.5 text-warning fill-warning" />
                <span>{streak}d Streak</span>
              </div>
            )}
          </div>

          {subtitle && (
            <div className="text-xs sm:text-sm text-secondary-text">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
