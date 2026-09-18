import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export type CardVariant = 'default' | 'hero' | 'subtle' | 'accent-green' | 'accent-red' | 'lavender';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  className = '',
  children,
  ...rest
}) => {
  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder shadow-soft',
    hero: 'bg-gradient-to-br from-hero-start to-hero-end dark:from-hero-darkStart dark:to-hero-darkEnd border border-hero-border dark:border-hero-darkBorder shadow-card',
    subtle: 'bg-surface-secondary dark:bg-surface-darkCard border border-border dark:border-surface-darkBorder shadow-subtle',
    'accent-green': 'bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder border-l-4 border-l-success shadow-soft',
    'accent-red': 'bg-surface dark:bg-surface-dark border border-border dark:border-surface-darkBorder border-l-4 border-l-danger shadow-soft',
    lavender: 'bg-lavender dark:bg-lavender-dark border border-primary/20 shadow-soft',
  };

  const baseClasses = 'rounded-card p-5 sm:p-6 transition-all duration-200';

  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={clsx(baseClasses, variantStyles[variant], 'cursor-pointer hover:shadow-hover', className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={clsx(baseClasses, variantStyles[variant], className)} {...(rest as any)}>
      {children}
    </div>
  );
};

export default Card;
