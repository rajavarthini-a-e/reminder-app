import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Bell, CheckCircle2, Clock, X } from 'lucide-react';
import { Button } from '../ui/Button.js';
import clsx from 'clsx';

export type NotificationVariant = 'info' | 'at-risk' | 'overdue' | 'escalated' | 'success';

export interface NotificationBannerProps {
  id?: string;
  variant?: NotificationVariant;
  escalationLevel?: number; // 1 to 4
  title: string;
  message: string;
  onAcknowledge?: () => void;
  onSnooze?: (minutes: number) => void;
  onVerify?: () => void;
  className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  id,
  variant = 'info',
  escalationLevel = 1,
  title,
  message,
  onAcknowledge,
  onSnooze,
  onVerify,
  className = '',
}) => {
  // Determine variant styling based on escalation level if escalated
  let computedVariant = variant;
  if (escalationLevel >= 3) {
    computedVariant = 'escalated';
  } else if (escalationLevel === 2) {
    computedVariant = 'overdue';
  } else if (escalationLevel === 1) {
    computedVariant = 'at-risk';
  }

  const variantStyles: Record<NotificationVariant, { bg: string; border: string; icon: React.ReactNode; badge: string }> = {
    info: {
      bg: 'bg-lavender dark:bg-lavender-dark',
      border: 'border-primary/30',
      icon: <Bell className="w-5 h-5 text-primary" />,
      badge: 'Mentor Reminder',
    },
    'at-risk': {
      bg: 'bg-warning-soft dark:bg-surface-darkCard',
      border: 'border-warning/40',
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      badge: 'Level 1: Gentle Nudge',
    },
    overdue: {
      bg: 'bg-danger-soft dark:bg-surface-darkCard',
      border: 'border-danger/40',
      icon: <AlertTriangle className="w-5 h-5 text-danger" />,
      badge: 'Level 2: Urgent Notice',
    },
    escalated: {
      bg: 'bg-danger-soft dark:bg-surface-darkCard',
      border: 'border-danger/60 ring-2 ring-danger/20',
      icon: <ShieldAlert className="w-5 h-5 text-danger" />,
      badge: 'Level 3+: Strict Intervention',
    },
    success: {
      bg: 'bg-success-soft dark:bg-surface-darkCard',
      border: 'border-success/40',
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      badge: 'Goal Completed',
    },
  };

  const current = variantStyles[computedVariant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className={clsx(
        'w-full p-4 rounded-2xl sm:rounded-3xl border shadow-card flex items-start justify-between gap-4',
        current.bg,
        current.border,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="p-2 rounded-xl bg-surface/80 dark:bg-surface-dark/80 shadow-subtle flex-shrink-0 mt-0.5">
          {current.icon}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-text">
              {current.badge}
            </span>
          </div>
          <h4 className="text-sm font-bold text-primary-text dark:text-gray-100 truncate">
            {title}
          </h4>
          <p className="text-xs text-secondary-text dark:text-gray-300 leading-relaxed">
            {message}
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 pt-2 flex-wrap">
            {onVerify && (
              <Button variant="success" size="sm" onClick={onVerify}>
                Verify Completion
              </Button>
            )}
            {onSnooze && (
              <Button variant="secondary" size="sm" onClick={() => onSnooze(30)}>
                Snooze 30m
              </Button>
            )}
            {onAcknowledge && (
              <Button variant="ghost" size="sm" onClick={onAcknowledge}>
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </div>

      {onAcknowledge && (
        <button
          type="button"
          onClick={onAcknowledge}
          aria-label="Dismiss notification"
          className="p-1.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface/50 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default NotificationBanner;
