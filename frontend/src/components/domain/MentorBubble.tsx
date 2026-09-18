import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, ShieldAlert, Bot } from 'lucide-react';
import { Mascot, MascotPose } from '../ui/Mascot.js';
import clsx from 'clsx';

export type MentorTone = 'encouraging' | 'neutral' | 'firm' | 'escalated';

export interface MentorBubbleProps {
  variant?: MentorTone;
  content?: string;
  isTyping?: boolean;
  timestamp?: string;
  actionPrompt?: string;
  onAction?: () => void;
  showAvatar?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MentorBubble: React.FC<MentorBubbleProps> = ({
  variant = 'encouraging',
  content,
  isTyping = false,
  timestamp,
  actionPrompt,
  onAction,
  showAvatar = true,
  className = '',
  children,
}) => {
  const variantStyles: Record<MentorTone, { container: string; icon: React.ReactNode; badge: string }> = {
    encouraging: {
      container: 'bg-lavender dark:bg-lavender-dark text-primary-text dark:text-gray-100 border border-primary/20',
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      badge: 'Mentor Encouragement',
    },
    neutral: {
      container: 'bg-surface-secondary dark:bg-surface-darkCard text-primary-text dark:text-gray-100 border border-border',
      icon: <Bot className="w-4 h-4 text-secondary-text" />,
      badge: 'Mentor Advice',
    },
    firm: {
      container: 'bg-warning-soft dark:bg-surface-darkCard text-primary-text dark:text-gray-100 border-l-4 border-l-warning border-y border-r border-warning/30',
      icon: <AlertCircle className="w-4 h-4 text-warning" />,
      badge: 'Accountability Notice',
    },
    escalated: {
      container: 'bg-danger-soft dark:bg-surface-darkCard text-primary-text dark:text-gray-100 border-l-4 border-l-danger border-y border-r border-danger/30',
      icon: <ShieldAlert className="w-4 h-4 text-danger" />,
      badge: 'Critical Escalation',
    },
  };

  const current = variantStyles[variant];

  const getMascotPose = (): MascotPose => {
    if (content?.toLowerCase().includes('tired') || content?.toLowerCase().includes('rest')) {
      return 'sleepy';
    }
    if (variant === 'escalated' || variant === 'firm') {
      return 'concerned';
    }
    return 'encouraging';
  };

  return (
    <div className={clsx('flex items-start gap-3 select-text', className)}>
      {showAvatar && (
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
          <Mascot pose={getMascotPose()} className="w-10 h-10" />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        {/* Bubble Body */}
        <div
          className={clsx(
            'p-4 rounded-2xl sm:rounded-3xl shadow-subtle font-sans text-sm leading-relaxed relative',
            current.container
          )}
        >
          {/* Header tag */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-primary-light flex items-center gap-1">
              {current.badge}
            </span>
            {timestamp && (
              <span className="text-[10px] text-secondary-text">{timestamp}</span>
            )}
          </div>

          {/* Typing Indicator */}
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1 px-1">
              <span className="text-xs text-secondary-text font-medium mr-1">Thinking</span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content || children}</div>
          )}

          {/* Contextual Action prompt button */}
          {actionPrompt && onAction && !isTyping && (
            <button
              onClick={onAction}
              className="mt-3 px-3 py-1.5 bg-surface/90 dark:bg-surface-dark/90 hover:bg-surface text-primary dark:text-primary-light rounded-xl text-xs font-bold border border-primary/30 shadow-subtle flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{actionPrompt}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorBubble;
