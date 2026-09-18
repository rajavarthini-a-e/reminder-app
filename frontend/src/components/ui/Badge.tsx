import React from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'completed' | 'pending' | 'critical' | 'upcoming' | 'neutral' | 'today' | 'atRisk';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  children,
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    completed: {
      container: 'bg-success-soft text-success border border-success/20',
      dot: 'bg-success',
    },
    today: {
      container: 'bg-success-soft text-success border border-success/30 font-bold',
      dot: 'bg-success',
    },
    pending: {
      container: 'bg-warning-soft text-warning border border-warning/30',
      dot: 'bg-warning',
    },
    atRisk: {
      container: 'bg-warning-soft text-warning border border-warning/40 font-bold',
      dot: 'bg-warning',
    },
    critical: {
      container: 'bg-danger-soft text-danger border border-danger/30 font-bold',
      dot: 'bg-danger',
    },
    upcoming: {
      container: 'bg-lavender text-primary border border-primary/20',
      dot: 'bg-primary',
    },
    neutral: {
      container: 'bg-surface-secondary text-secondary-text border border-border',
      dot: 'bg-secondary-text',
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] sm:text-[11px] px-2.5 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-3 py-1 font-bold',
  };

  const config = variantStyles[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-sans select-none whitespace-nowrap',
        sizeStyles[size],
        config.container,
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
